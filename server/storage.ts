import {
  User, InsertUser, users,
  Category, InsertCategory, categories,
  Product, InsertProduct, products,
  CartItem, InsertCartItem, cartItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getNewProducts(limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemsWithProducts(userId: number): Promise<Array<CartItem & { product: Product }>>;
  addItemToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  
  // Order methods
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderItemsByOrder(orderId: number): Promise<Array<OrderItem & { product: Product }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userId: number;
  private categoryId: number;
  private productId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug,
    );
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.isFeatured)
      .slice(0, limit);
  }
  
  async getNewProducts(limit: number = 10): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.isNew)
      .slice(0, limit);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
  
  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }
  
  async getCartItemsWithProducts(userId: number): Promise<Array<CartItem & { product: Product }>> {
    const items = await this.getCartItems(userId);
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);
      return { ...item, product };
    });
  }
  
  async addItemToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item is already in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId,
    );
    
    if (existingItem) {
      // Update quantity instead of adding new item
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.cartItemId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  // Order methods
  async createOrder(insertOrder: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order> {
    const id = this.orderId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: 'pending',
      createdAt: new Date()
    };
    
    this.orders.set(id, order);
    
    // Create order items
    for (const item of items) {
      const orderItemId = this.orderItemId++;
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id
      };
      
      this.orderItems.set(orderItemId, orderItem);
    }
    
    return order;
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());  // Sort by date desc
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderItemsByOrder(orderId: number): Promise<Array<OrderItem & { product: Product }>> {
    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);
      return { ...item, product };
    });
  }
  
  // Helper method to initialize sample data
  private initSampleData() {
    // Sample categories
    const categoriesData: InsertCategory[] = [
      {
        name: "Electronics",
        slug: "electronics",
        icon: "laptop"
      },
      {
        name: "Fashion",
        slug: "fashion",
        icon: "tshirt"
      },
      {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        icon: "home"
      },
      {
        name: "Health",
        slug: "health",
        icon: "heartbeat"
      },
      {
        name: "Sports",
        slug: "sports",
        icon: "futbol"
      },
      {
        name: "Gifts",
        slug: "gifts",
        icon: "gift"
      }
    ];
    
    categoriesData.forEach(category => {
      this.createCategory(category);
    });
    
    // Sample products
    const productsData: InsertProduct[] = [
      {
        name: "Smartphone X Pro",
        slug: "smartphone-x-pro",
        description: "Latest smartphone with 108MP camera and all-day battery life",
        price: "799",
        comparePrice: "999",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 1,
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
        categoryId: 1,
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
        categoryId: 1,
        stock: 150,
        rating: "5.0",
        numReviews: 214,
        isFeatured: true,
        isNew: false
      },
      {
        name: "Ultrabook Pro 15",
        slug: "ultrabook-pro-15",
        description: "Ultra-thin laptop with 4K display and all-day battery life",
        price: "1349",
        comparePrice: "1499",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 1,
        stock: 75,
        rating: "4.5",
        numReviews: 92,
        isFeatured: true,
        isNew: false
      },
      {
        name: "Digital Camera 4K",
        slug: "digital-camera-4k",
        description: "Professional-grade camera with 4K video recording and 20MP photo capability",
        price: "599",
        comparePrice: "799",
        image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 1,
        stock: 50,
        rating: "4.0",
        numReviews: 67,
        isFeatured: true,
        isNew: false
      },
      {
        name: "Premium Headphones",
        slug: "premium-headphones",
        description: "Wireless over-ear headphones with noise cancellation technology",
        price: "299",
        comparePrice: null,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 1,
        stock: 120,
        rating: "4.5",
        numReviews: 42,
        isFeatured: false,
        isNew: true
      },
      // Home & Kitchen products
      {
        name: "Modern Coffee Table",
        slug: "modern-coffee-table",
        description: "Stylish and minimalist coffee table for your living room",
        price: "299",
        comparePrice: "399",
        image: "https://images.unsplash.com/photo-1532372320572-cda25653a694?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 3,
        stock: 30,
        rating: "4.3",
        numReviews: 58,
        isFeatured: true,
        isNew: false
      },
      {
        name: "Kitchen Mixer Pro",
        slug: "kitchen-mixer-pro",
        description: "Professional stand mixer for all your baking needs",
        price: "249",
        comparePrice: "349",
        image: "https://images.unsplash.com/photo-1594135356513-14291e34b848?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 3,
        stock: 45,
        rating: "4.8",
        numReviews: 112,
        isFeatured: true,
        isNew: false
      },
      {
        name: "Cozy Throw Blanket",
        slug: "cozy-throw-blanket",
        description: "Soft and comfortable throw blanket for your home",
        price: "49",
        comparePrice: "69",
        image: "https://images.unsplash.com/photo-1580301762395-83604beb6b18?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 3,
        stock: 100,
        rating: "4.6",
        numReviews: 74,
        isFeatured: false,
        isNew: true
      },
      // Fashion products
      {
        name: "Designer Sunglasses",
        slug: "designer-sunglasses",
        description: "UV protection stylish sunglasses for men and women",
        price: "129",
        comparePrice: "179",
        image: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 2,
        stock: 80,
        rating: "4.2",
        numReviews: 48,
        isFeatured: true,
        isNew: false
      },
      {
        name: "Casual Sneakers",
        slug: "casual-sneakers",
        description: "Comfortable casual sneakers for everyday wear",
        price: "89",
        comparePrice: "119",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
        images: [],
        categoryId: 2,
        stock: 120,
        rating: "4.4",
        numReviews: 157,
        isFeatured: true,
        isNew: true
      }
    ];
    
    productsData.forEach(product => {
      this.createProduct(product);
    });
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
