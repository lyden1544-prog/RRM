// backend/src/routes/users.js
import express from 'express';
import { getDatabase } from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();
const supabase = getDatabase();

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

// Apply token verification to all routes
router.use(verifyToken);

// Get all users with search and filters
router.get('/', async (req, res) => {
  try {
    const { search, status, sortBy = 'created_at', order = 'desc', limit = 50, offset = 0 } = req.query;

    let query = supabase.from('users').select('*', { count: 'exact' });

    // Search by name or email
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Sorting
    query = query.order(sortBy, { ascending: order === 'asc' });

    // Pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching users:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      data: {
        users: data,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: { user: data },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user (admin only)
router.post('/', async (req, res) => {
  try {
    const { email, password, full_name, company_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message });
    }

    // Create user profile
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name,
          company_name: company_name || '',
          phone: phone || '',
          status: 'active',
        },
      ])
      .select();

    if (dbError) {
      logger.error('Error creating user:', dbError);
      return res.status(400).json({ success: false, message: dbError.message });
    }

    logger.info(`User created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userData[0] },
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, company_name, phone, status } = req.body;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (company_name !== undefined) updateData.company_name = company_name;
    if (phone !== undefined) updateData.phone = phone;
    if (status) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      logger.error('Error updating user:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info(`User updated: ${id}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: data[0] },
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get user email before deletion
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', id)
      .single();

    // Delete from users table
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (dbError) {
      return res.status(400).json({ success: false, message: dbError.message });
    }

    // Delete from auth
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (authError) {
      logger.warn('Could not delete from auth:', authError.message);
      // Continue anyway - user is already deleted from database
    }

    logger.info(`User deleted: ${userData?.email || id}`);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update user status
router.patch('/status/bulk', async (req, res) => {
  try {
    const { userIds, status } = req.body;

    if (!userIds || !Array.isArray(userIds) || !status) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', userIds)
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    logger.info(`Bulk status update: ${userIds.length} users updated to ${status}`);

    res.json({
      success: true,
      message: `${data.length} users updated`,
      data: { users: data },
    });
  } catch (error) {
    logger.error('Bulk update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;