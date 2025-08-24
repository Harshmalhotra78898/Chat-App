const express = require('express');
const { pool } = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, is_online, last_seen, avatar, created_at FROM users WHERE id != ? ORDER BY username',
      [req.user.id]
    );

    res.json(users.map(user => ({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isOnline: user.is_online,
      lastSeen: user.last_seen,
      avatar: user.avatar,
      createdAt: user.created_at
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online users
router.get('/online', auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, is_online, last_seen, avatar FROM users WHERE is_online = TRUE AND id != ?',
      [req.user.id]
    );

    res.json(users.map(user => ({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isOnline: user.is_online,
      lastSeen: user.last_seen,
      avatar: user.avatar
    })));
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific user
router.get('/:id', auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, is_online, last_seen, avatar, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isOnline: user.is_online,
      lastSeen: user.last_seen,
      avatar: user.avatar,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }

    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    values.push(req.user.id);
    const [result] = await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [result] = await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
