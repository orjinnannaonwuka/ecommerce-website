import { Request, Response } from 'express';
import { database } from '../database/connection';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getProducts = async (req: Request, res: Response) => {
  const { category, search, page = 1, limit = 10, sort = 'created_at' } = req.query;
  const offset = ((Number(page) - 1) * Number(limit));

  let query = 'SELECT * FROM products WHERE is_active = true';
  const params: any[] = [];

  if (category) {
    query += ` AND category_id = $${params.length + 1}`;
    params.push(category);
  }

  if (search) {
    query += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  // Get total count
  const countResult = await database.query(
    `SELECT COUNT(*) as total FROM products WHERE is_active = true ${category ? `AND category_id = $1` : ''}`,
    category ? [category] : []
  );
  const total = parseInt(countResult.rows[0].total);

  query += ` ORDER BY ${sort} DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await database.query(query, params);

  res.json({
    products: result.rows,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await database.query(
    'SELECT * FROM products WHERE id = $1 AND is_active = true',
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ product: result.rows[0] });
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, price, stock, category_id, image_url } = req.body;

  // Validation
  if (!name || price === undefined || stock === undefined) {
    throw new ApiError(400, 'Name, price, and stock are required');
  }

  const result = await database.query(
    `INSERT INTO products (name, description, price, stock, category_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description, price, stock, category_id, image_url]
  );

  res.status(201).json({ product: result.rows[0] });
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id, image_url, is_active } = req.body;

  const result = await database.query(
    `UPDATE products
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         stock = COALESCE($4, stock),
         category_id = COALESCE($5, category_id),
         image_url = COALESCE($6, image_url),
         is_active = COALESCE($7, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING *`,
    [name, description, price, stock, category_id, image_url, is_active, id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ product: result.rows[0] });
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await database.query(
    'UPDATE products SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ message: 'Product deleted successfully' });
};
