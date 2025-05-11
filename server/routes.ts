import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCartItemSchema, 
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

// Type for authenticated request
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

// Auth middleware
const authenticate = async (req: AuthRequest, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware setup
  const SessionStore = MemoryStore(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'shopworld-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000 // 24 hours
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // API Routes
  
  // -------- Auth routes --------
  
  // Register user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user info (excluding password)
      const { password, ...userInfo } = user;
      res.status(201).json(userInfo);
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid user data" });
    }
  });
  
  // Login user
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user info (excluding password)
      const { password: _, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get current user
  app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user info (excluding password)
      const { password, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Logout user
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Update user profile
  app.put('/api/users/profile', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userData = req.body;
      
      // Don't allow updating username or email to existing ones
      if (userData.username) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail && existingEmail.id !== req.user.id) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Hash password if it's being updated
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      // Update user
      const updatedUser = await storage.updateUser(req.user.id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return updated user info (excluding password)
      const { password, ...userInfo } = updatedUser;
      res.json(userInfo);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // -------- Category routes --------
  
  // Get all categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get single category by slug
  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // -------- Product routes --------
  
  // Get all products
  app.get('/api/products', async (req, res) => {
    try {
      // Check for query params
      const { category, featured, newArrivals, limit } = req.query;
      
      let products;
      
      if (category) {
        const categoryObj = await storage.getCategoryBySlug(category as string);
        if (!categoryObj) {
          return res.status(404).json({ message: "Category not found" });
        }
        products = await storage.getProductsByCategory(categoryObj.id);
      } else if (featured === 'true') {
        products = await storage.getFeaturedProducts(limit ? Number(limit) : undefined);
      } else if (newArrivals === 'true') {
        products = await storage.getNewProducts(limit ? Number(limit) : undefined);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get single product by slug
  app.get('/api/products/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // -------- Cart routes --------
  
  // Get cart items
  app.get('/api/cart', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cartItems = await storage.getCartItemsWithProducts(req.user.id);
      res.json(cartItems);
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Add item to cart
  app.post('/api/cart', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if product exists
      const product = await storage.getProductById(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Add to cart
      const cartItem = await storage.addItemToCart(cartItemData);
      
      // Get updated cart with products
      const updatedCart = await storage.getCartItemsWithProducts(req.user.id);
      
      res.status(201).json(updatedCart);
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid cart data" });
    }
  });
  
  // Update cart item quantity
  app.put('/api/cart/:id', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(Number(id), quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get updated cart with products
      const updatedCart = await storage.getCartItemsWithProducts(req.user.id);
      
      res.json(updatedCart);
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Remove cart item
  app.delete('/api/cart/:id', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      
      const success = await storage.removeCartItem(Number(id));
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get updated cart with products
      const updatedCart = await storage.getCartItemsWithProducts(req.user.id);
      
      res.json(updatedCart);
    } catch (error) {
      console.error('Remove cart error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // -------- Order routes --------
  
  // Create order
  app.post('/api/orders', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { orderItems, ...orderData } = req.body;
      
      // Validate order data
      const validatedOrderData = insertOrderSchema.parse({
        ...orderData,
        userId: req.user.id
      });
      
      // Validate order items
      if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ message: "Order items are required" });
      }
      
      // Create order items array with product information
      const items = [];
      for (const item of orderItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with id ${item.productId} not found` });
        }
        
        items.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }
      
      // Create order
      const order = await storage.createOrder(validatedOrderData, items);
      
      // Clear the cart after successful order
      const cartItems = await storage.getCartItems(req.user.id);
      for (const item of cartItems) {
        await storage.removeCartItem(item.id);
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid order data" });
    }
  });
  
  // Get user orders
  app.get('/api/orders', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const orders = await storage.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get single order
  app.get('/api/orders/:id', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      const order = await storage.getOrderById(Number(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to user or user is admin
      if (order.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const orderItems = await storage.getOrderItemsByOrder(order.id);
      
      res.json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
