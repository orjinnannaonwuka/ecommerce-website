import { Request, Response } from 'express';
import { database } from '../database/connection';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const getOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = ((Number(page) - 1) * Number(limit));

  const result = await database.query(
    `SELECT o.*, json_agg(json_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'product_name', p.name,
      'quantity', oi.quantity,
      'price', oi.price
    )) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset]
  );

  res.json({ orders: result.rows });
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { id } = req.params;

  const result = await database.query(
    `SELECT o.*, json_agg(json_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'product_name', p.name,
      'quantity', oi.quantity,
      'price', oi.price
    )) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = $1 AND o.user_id = $2
    GROUP BY o.id`,
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  res.json({ order: result.rows[0] });
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { items, shipping_address, billing_address, stripeToken } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order items are required');
  }

  // Calculate total
  let total = 0;
  for (const item of items) {
    const productResult = await database.query(
      'SELECT price, stock FROM products WHERE id = $1',
      [item.product_id]
    );

    if (productResult.rows.length === 0) {
      throw new ApiError(404, `Product ${item.product_id} not found`);
    }

    const product = productResult.rows[0];
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for product ${item.product_id}`);
    }

    total += product.price * item.quantity;
  }

  // Create order
  const orderResult = await database.query(
    `INSERT INTO orders (user_id, total_amount, status, shipping_address, billing_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.user.id, total, 'pending', shipping_address, billing_address]
  );

  const order = orderResult.rows[0];

  // Add order items and update stock
  for (const item of items) {
    const productResult = await database.query(
      'SELECT price FROM products WHERE id = $1',
      [item.product_id]
    );
    const price = productResult.rows[0].price;

    await database.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
      [order.id, item.product_id, item.quantity, price]
    );

    // Update stock
    await database.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [item.quantity, item.product_id]
    );
  }

  // Process payment if token provided
  if (stripeToken) {
    try {
      const charge = await stripe.charges.create({
        amount: Math.round(total * 100),
        currency: 'usd',
        source: stripeToken,
        description: `Order #${order.id}`,
      });

      await database.query(
        'UPDATE orders SET stripe_payment_id = $1, status = $2 WHERE id = $3',
        [charge.id, 'processing', order.id]
      );
    } catch (error: any) {
      throw new ApiError(400, `Payment failed: ${error.message}`);
    }
  }

  res.status(201).json({ order });
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const result = await database.query(
    'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  res.json({ order: result.rows[0] });
};
