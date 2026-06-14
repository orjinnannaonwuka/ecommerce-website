import { Request, Response } from 'express';
import { database } from '../database/connection';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getCart = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  // Get or create cart
  let cartResult = await database.query(
    'SELECT id FROM cart WHERE user_id = $1',
    [req.user.id]
  );

  let cartId = cartResult.rows[0]?.id;

  if (!cartId) {
    const newCart = await database.query(
      'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
      [req.user.id]
    );
    cartId = newCart.rows[0].id;
  }

  // Get cart items
  const itemsResult = await database.query(
    `SELECT ci.id, ci.product_id, p.name, p.price, p.image_url, ci.quantity,
            (p.price * ci.quantity) as subtotal
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cartId]
  );

  const items = itemsResult.rows;
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  res.json({ cart: { id: cartId, items, total } });
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    throw new ApiError(400, 'Product ID and quantity are required');
  }

  // Get or create cart
  let cartResult = await database.query(
    'SELECT id FROM cart WHERE user_id = $1',
    [req.user.id]
  );

  let cartId = cartResult.rows[0]?.id;

  if (!cartId) {
    const newCart = await database.query(
      'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
      [req.user.id]
    );
    cartId = newCart.rows[0].id;
  }

  // Check if product exists
  const productResult = await database.query(
    'SELECT id, stock FROM products WHERE id = $1',
    [product_id]
  );

  if (productResult.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }

  if (productResult.rows[0].stock < quantity) {
    throw new ApiError(400, 'Insufficient stock');
  }

  // Check if item already in cart
  const existingItem = await database.query(
    'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cartId, product_id]
  );

  if (existingItem.rows.length > 0) {
    // Update quantity
    await database.query(
      'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
      [quantity, existingItem.rows[0].id]
    );
  } else {
    // Add new item
    await database.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
      [cartId, product_id, quantity]
    );
  }

  res.json({ message: 'Item added to cart' });
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    throw new ApiError(400, 'Valid quantity is required');
  }

  const result = await database.query(
    'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
    [quantity, itemId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Cart item not found');
  }

  res.json({ message: 'Cart item updated' });
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { itemId } = req.params;

  const result = await database.query(
    'DELETE FROM cart_items WHERE id = $1 RETURNING *',
    [itemId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Cart item not found');
  }

  res.json({ message: 'Item removed from cart' });
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const cartResult = await database.query(
    'SELECT id FROM cart WHERE user_id = $1',
    [req.user.id]
  );

  if (cartResult.rows.length === 0) {
    throw new ApiError(404, 'Cart not found');
  }

  await database.query(
    'DELETE FROM cart_items WHERE cart_id = $1',
    [cartResult.rows[0].id]
  );

  res.json({ message: 'Cart cleared' });
};
