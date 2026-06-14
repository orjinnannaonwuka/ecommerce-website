import { Request, Response } from 'express';
import { database } from '../database/connection';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  // Get total users
  const usersResult = await database.query(
    'SELECT COUNT(*) as total FROM users WHERE role = \'customer\''
  );

  // Get total products
  const productsResult = await database.query(
    'SELECT COUNT(*) as total FROM products WHERE is_active = true'
  );

  // Get total orders
  const ordersResult = await database.query(
    'SELECT COUNT(*) as total FROM orders'
  );

  // Get total revenue
  const revenueResult = await database.query(
    'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = \'delivered\''
  );

  res.json({
    stats: {
      total_users: parseInt(usersResult.rows[0].total),
      total_products: parseInt(productsResult.rows[0].total),
      total_orders: parseInt(ordersResult.rows[0].total),
      total_revenue: parseFloat(revenueResult.rows[0].total),
    },
  });
};

export const getSalesAnalytics = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const { period = '30' } = req.query;

  const result = await database.query(
    `SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue
     FROM orders
     WHERE created_at >= NOW() - INTERVAL '${period} days'
     AND status = 'delivered'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`
  );

  res.json({ analytics: result.rows });
};

export const getUserManagement = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = ((Number(page) - 1) * Number(limit));

  const result = await database.query(
    `SELECT id, name, email, role, is_active, created_at
     FROM users
     WHERE role = 'customer'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await database.query(
    'SELECT COUNT(*) as total FROM users WHERE role = \'customer\''
  );

  res.json({
    users: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].total),
      page: Number(page),
      limit: Number(limit),
    },
  });
};

export const getOrderManagement = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const { page = 1, limit = 10, status } = req.query;
  const offset = ((Number(page) - 1) * Number(limit));

  let query = `SELECT o.id, o.user_id, u.name, u.email, o.total_amount, o.status, o.created_at
               FROM orders o
               JOIN users u ON o.user_id = u.id`;
  const params: any[] = [];

  if (status) {
    query += ` WHERE o.status = $${params.length + 1}`;
    params.push(status);
  }

  query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await database.query(query, params);

  const countQuery = status
    ? `SELECT COUNT(*) as total FROM orders WHERE status = $1`
    : `SELECT COUNT(*) as total FROM orders`;
  const countParams = status ? [status] : [];
  const countResult = await database.query(countQuery, countParams);

  res.json({
    orders: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].total),
      page: Number(page),
      limit: Number(limit),
    },
  });
};
