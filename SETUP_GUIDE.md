# MongoDB Atlas Setup Guide for VILLFRESH

This guide will walk you through setting up MongoDB Atlas for your VILLFRESH e-commerce site.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (or log in if you already have one)
3. Complete the account setup

## Step 2: Create a Cluster

1. After logging in, click **"Create"** or **"Build a Database"**
2. Choose the **FREE (M0) tier** (perfect for development)
3. Select a cloud provider and region (choose one closest to you)
4. Give your cluster a name (e.g., "villfresh-cluster")
5. Click **"Create Cluster"** (this may take 3-5 minutes)

## Step 3: Create Database User

1. In the **Security** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username and password (save these - you'll need them!)
5. Under **"Database User Privileges"**, select **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

## Step 4: Whitelist Your IP Address

1. In the **Security** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - ⚠️ **Note**: For production, use specific IP addresses for security
4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. In the **Deployment** section, click **"Database"**
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Your Application

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the connection string:
   ```env
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/villfresh?retryWrites=true&w=majority
   ```

   Replace:
   - `YOUR_USERNAME` with your database username
   - `YOUR_PASSWORD` with your database password
   - `cluster0.xxxxx` with your actual cluster name
   - The database name `villfresh` is already included

3. Set a secure JWT secret:
   ```env
   JWT_SECRET=your-super-secret-random-string-here
   ```

   You can generate a random string using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Seed Initial Products (Optional)

To populate your database with initial products:

```bash
npm run seed:products
```

This will add 8 sample products to your database.

## Step 9: Start the Server

```bash
npm run server
```

You should see:
```
✅ Connected to MongoDB Atlas
🚀 Server running on http://localhost:5000
```

## Troubleshooting

### Connection Error: "Authentication failed"
- Double-check your username and password in the connection string
- Make sure there are no special characters that need URL encoding
- Verify the user has proper permissions

### Connection Error: "IP not whitelisted"
- Go to Network Access in MongoDB Atlas
- Add your current IP address or use `0.0.0.0/0` for development

### Connection Error: "Timeout"
- Check your internet connection
- Verify the cluster is running (not paused)
- Make sure the connection string is correct

### "Cannot find module" errors
- Run `npm install` again
- Make sure you're in the project root directory

## Next Steps

1. ✅ Your MongoDB Atlas database is ready!
2. Start the backend server: `npm run server`
3. Start the frontend: `npm run dev` (in another terminal)
4. Test the API at `http://localhost:5000/api/health`

## Creating an Admin User

To create an admin user, you have two options:

### Option 1: Using MongoDB Atlas UI
1. Go to your cluster → Collections
2. Find the `users` collection
3. Edit a user document and change `role` from `"user"` to `"admin"`

### Option 2: Using MongoDB Compass
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Navigate to `villfresh` database → `users` collection
4. Edit a user and change `role` to `"admin"`

## Production Considerations

When deploying to production:

1. **Security**:
   - Use specific IP addresses instead of `0.0.0.0/0`
   - Use a strong, unique JWT secret
   - Enable MongoDB Atlas encryption at rest

2. **Performance**:
   - Consider upgrading from M0 (free tier) for better performance
   - Set up database indexes for frequently queried fields
   - Enable connection pooling

3. **Monitoring**:
   - Set up MongoDB Atlas alerts
   - Monitor database performance metrics
   - Set up backup schedules

## Need Help?

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- Check the main README.md for API documentation

