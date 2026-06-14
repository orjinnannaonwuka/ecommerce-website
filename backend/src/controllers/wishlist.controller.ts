import { Request, Response } from 'express';
import { database } from '../database/connection';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const result = await database.query(
    `SELECT w.id, p.id as product_id, p.name, p.price, p.image_url, p.description
     FROM wishlist w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = $1`,
    [req.user.id]
  );

  res.json({ wishlist: result.rows });
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { product_id } = req.body;

  if (!product_id) {
    throw new ApiError(400, 'Product ID is required');
  }

  // Check if product exists
  const productResult = await database.query(
    'SELECT id FROM products WHERE id = $1',
    [product_id]
  );

  if (productResult.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }

  try {
    await database.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
      [req.user.id, product_id]
    );
    res.json({ message: 'Added to wishlist' });
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ApiError(400, 'Product already in wishlist');
    }
    throw error;
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  const { productId } = req.params;

  const result = await database.query(
    'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *',
    [req.user.id, productId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Wishlist item not found');
  }

  res.json({ message: 'Removed from wishlist' });
};
