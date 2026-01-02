# VILLFRESH - Organic Products E-commerce Site

A modern e-commerce platform for organic rice, nuts, and seeds built with React and MongoDB Atlas.

## Features

- 🛍️ Product browsing with search, filter, and sort
- 🛒 Shopping cart functionality
- 👤 User authentication (Signup/Login)
- 📦 Order management
- 👨‍💼 Admin panel for product management
- 📱 Fully responsive design

## Tech Stack

### Frontend
- React 19.1.1
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username and password)
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs in development)
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/villfresh?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

Replace:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster` with your cluster name
- `your-super-secret-jwt-key-change-this-in-production` with a secure random string

### 4. Run the Application

#### Start the Backend Server
```bash
npm run server
```

Or with auto-reload:
```bash
npm run dev:server
```

#### Start the Frontend (in a new terminal)
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)
The backend will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Products
- `GET /api/products` - Get all products (with query params: search, category, priceRange, sortBy)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user cart (requires auth)
- `POST /api/cart/add` - Add product to cart (requires auth)
- `PUT /api/cart/update` - Update cart item quantity (requires auth)
- `DELETE /api/cart/remove` - Remove item from cart (requires auth)
- `DELETE /api/cart/clear` - Clear cart (requires auth)

### Orders
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders/my-orders` - Get user orders (requires auth)
- `GET /api/orders/:id` - Get single order (requires auth)
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## Database Schema

### User
- name, email, phone, password, profilePicture, role

### Product
- name, description, price, image, category, weight, benefits, inStock

### Order
- userId, items, total, shippingAddress, paymentMethod, status, estimatedDelivery

## Default Admin User

To create an admin user, you can either:
1. Use MongoDB Compass or Atlas UI to manually update a user's role to "admin"
2. Create a script to seed an admin user

## Production Deployment

1. Set `NODE_ENV=production` in your `.env` file
2. Use a strong `JWT_SECRET`
3. Configure CORS properly for your domain
4. Use environment variables for all sensitive data
5. Consider using Redis for cart storage instead of in-memory storage
6. Set up proper error logging and monitoring

## License

MIT
