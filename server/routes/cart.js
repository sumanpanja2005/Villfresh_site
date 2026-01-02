import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Cart from '../models/Cart.js';

const router = express.Router();

// Get user cart
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    
    // Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({ cart: { items: cart.items, total } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/add', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({ error: 'Product is required' });
    }

    // Normalize product ID (handle both _id from MongoDB and id from frontend)
    const productId = product._id || product.id || product.productId;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart (convert both to string for comparison)
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += 1;
    } else {
      cart.items.push({
        productId: productId,
        name: product.name,
        image: product.image,
        price: product.price,
        weight: product.weight || '',
        quantity: 1,
      });
    }

    await cart.save();

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({
      message: 'Product added to cart',
      cart: { items: cart.items, total },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update cart item quantity
router.put('/update', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find item by productId (convert both to string for comparison)
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({
      message: quantity <= 0 ? 'Product removed from cart' : 'Cart updated',
      cart: { items: cart.items, total },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/remove', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    await cart.save();

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({
      message: 'Product removed from cart',
      cart: { items: cart.items, total },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clear cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    } else {
      cart.items = [];
    }
    
    await cart.save();

    res.json({
      message: 'Cart cleared',
      cart: { items: [], total: 0 },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
