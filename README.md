# E-Commerce Platform

A full-stack e-commerce application built with React, Node.js, Express, and PostgreSQL.

## Features

- 🛍️ Product browsing and search
- 🛒 Shopping cart functionality
- 👤 User authentication and profiles
- 📦 Order management and history
- 💳 Checkout process
- 📱 Responsive design for mobile and desktop
- 🔐 Secure user authentication
- 📊 PostgreSQL database for data persistence

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Radix UI components
- TanStack Query for state management

**Backend:**
- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL
- Passport.js for authentication

## Deployment on Render

### Quick Deploy

1. **Fork or clone this repository**

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Environment Variables:**
   The `render.yaml` file automatically configures the DATABASE_URL from the PostgreSQL service.

### Manual Deployment

If you prefer manual setup:

1. **Create a PostgreSQL Database:**
   - In Render Dashboard, click "New +" → "PostgreSQL"
   - Choose a name (e.g., `ecommerce-db`)
   - Select your plan
   - Copy the connection string

2. **Create a Web Service:**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Environment Variables:**
       - `NODE_ENV`: `production`
       - `DATABASE_URL`: [Your PostgreSQL connection string]

## Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ecommerce-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce
   NODE_ENV=development
   ```

4. **Set up PostgreSQL database:**
   - Install PostgreSQL locally
   - Create a database named `ecommerce`
   - Update the DATABASE_URL with your credentials

5. **Run the application:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## Database Schema

The application automatically creates the following tables:
- `users` - User accounts and profiles
- `categories` - Product categories
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Order information
- `order_items` - Individual items in orders

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get product by slug
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug

### Cart
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details