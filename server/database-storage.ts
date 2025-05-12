import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";
import {
  User, InsertUser, users,
  Category, InsertCategory, categories,
  Product, InsertProduct, products,
  CartItem, InsertCartItem, cartItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));
  }
  
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .limit(limit);
  }
  
  async getNewProducts(limit: number = 10): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isNew, true))
      .limit(limit);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }
  
  async getCartItemsWithProducts(userId: number): Promise<Array<CartItem & { product: Product }>> {
    const items = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
    
    return items;
  }
  
  async addItemToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item is already in the cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, insertCartItem.userId || 0),
          eq(cartItems.productId, insertCartItem.productId || 0)
        )
      );
    
    if (existingItem) {
      // Update quantity instead of adding new item
      const newQuantity = existingItem.quantity + (insertCartItem.quantity || 1);
      const updatedItem = await this.updateCartItemQuantity(existingItem.id, newQuantity);
      return updatedItem as CartItem;
    }
    
    // Ensure quantity is set
    const cartItemToInsert = {
      ...insertCartItem,
      quantity: insertCartItem.quantity || 1
    };
    
    const [cartItem] = await db.insert(cartItems).values(cartItemToInsert).returning();
    return cartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedCartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id))
      .returning();
    return result.length > 0;
  }
  
  async createOrder(insertOrder: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order> {
    // Start a transaction to ensure all operations succeed or fail together
    return await db.transaction(async (tx) => {
      // Insert order
      const [order] = await tx
        .insert(orders)
        .values({
          ...insertOrder,
          status: 'pending',
          createdAt: new Date()
        })
        .returning();
      
      // Insert order items with the new order ID
      for (const item of items) {
        await tx
          .insert(orderItems)
          .values({
            ...item,
            orderId: order.id
          });
      }
      
      return order;
    });
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }
  
  async getOrderItemsByOrder(orderId: number): Promise<Array<OrderItem & { product: Product }>> {
    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: products
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    
    return items;
  }
  
  // Method to seed initial data
  async seedInitialData() {
    const existingCategories = await db.select().from(categories);
    
    // Only seed data if no categories exist
    if (existingCategories.length === 0) {
      // Seed categories
      const categoriesData = [
        { name: "Electronics", slug: "electronics", icon: "laptop" },
        { name: "Fashion", slug: "fashion", icon: "tshirt" },
        { name: "Home & Kitchen", slug: "home-kitchen", icon: "home" },
        { name: "Health", slug: "health", icon: "heartbeat" },
        { name: "Sports", slug: "sports", icon: "futbol" },
        { name: "Gifts", slug: "gifts", icon: "gift" }
      ];
      
      const insertedCategories = await db.insert(categories).values(categoriesData).returning();
      
      // Create a mapping of category slugs to IDs
      const categoryMap = insertedCategories.reduce<Record<string, number>>((acc, category) => {
        acc[category.slug] = category.id;
        return acc;
      }, {});
      
      // Seed products
      const productsData = [
        {
          name: "Smartphone X Pro",
          slug: "smartphone-x-pro",
          description: "Latest smartphone with 108MP camera and all-day battery life",
          price: "799",
          comparePrice: "999",
          image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
          images: [],
          categoryId: categoryMap.electronics,
          stock: 100,
          rating: "4.5",
          numReviews: 128,
          isFeatured: true,
          isNew: false
        },
        {
          name: "Wireless Earbuds Pro",
          slug: "wireless-earbuds-pro",
          description: "True wireless earbuds with noise cancellation and crystal clear audio",
          price: "129",
          comparePrice: "149",
          image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
          images: [],
          categoryId: categoryMap.electronics,
          stock: 200,
          rating: "4.0",
          numReviews: 86,
          isFeatured: true,
          isNew: false
        },
        {
          name: "Smart Watch Series 5",
          slug: "smart-watch-series-5",
          description: "Fitness tracking, heart rate monitoring and smartphone notifications",
          price: "249",
          comparePrice: "349",
          image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
          images: [],
          categoryId: categoryMap.electronics,
          stock: 150,
          rating: "5.0",
          numReviews: 214,
          isFeatured: true,
          isNew: false
        },
        {
          name: "Modern Coffee Table",
          slug: "modern-coffee-table",
          description: "Stylish and minimalist coffee table for your living room",
          price: "299",
          comparePrice: "399",
          image: "https://images.unsplash.com/photo-1532372320572-cda25653a694?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
          images: [],
          categoryId: categoryMap["home-kitchen"],
          stock: 30,
          rating: "4.3",
          numReviews: 58,
          isFeatured: true,
          isNew: false
        },
        {
          name: "Designer Sunglasses",
          slug: "designer-sunglasses",
          description: "UV protection stylish sunglasses for men and women",
          price: "129",
          comparePrice: "179",
          image: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
          images: [],
          categoryId: categoryMap.fashion,
          stock: 80,
          rating: "4.2",
          numReviews: 48,
          isFeatured: true,
          isNew: false
        }
      ];
      
      await db.insert(products).values(productsData);
      
      console.log("Initial data seeding completed");
    }
  }
}