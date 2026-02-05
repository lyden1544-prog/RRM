// backend/src/routes/auth.js - FIXED
import express from 'express';
import { getDatabase } from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();
const supabase = getDatabase();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, company_name } = req.body;

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

    // Create user profile in database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name,
          company_name: company_name || '',
          status: 'active',
        },
      ])
      .select();

    if (dbError) {
      logger.error('Error creating user profile:', dbError);
      return res.status(400).json({ success: false, message: dbError.message });
    }

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userData[0],
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      logger.error('Error fetching user profile:', userError);
    }

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        session: data.session,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      data: {
        user: userData || { id: data.user.id, email: data.user.email },
      },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    // Sign out from Supabase
    await supabase.auth.signOut();

    logger.info('User logged out');

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { full_name, company_name, phone } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name,
        company_name,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authData.user.id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    logger.info(`Profile updated for user: ${authData.user.email}`);

    res.json({
      success: true,
      message: 'Profile updated',
      data: { user: data[0] },
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete account
router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Delete from users table
    await supabase.from('users').delete().eq('id', authData.user.id);

    // Delete from auth
    await supabase.auth.admin.deleteUser(authData.user.id);

    logger.info(`Account deleted for user: ${authData.user.email}`);

    res.json({
      success: true,
      message: 'Account deleted',
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;