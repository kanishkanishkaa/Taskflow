// ============================================================
// Controller: Authentication (Register / Login / Me)
// ============================================================
const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow 'admin' role if explicitly requested & valid; default to 'user'
    const finalRole = role === 'admin' ? 'admin' : 'user';

    const newUser = await User.create({ name, email, password: hashedPassword, role: finalRole });

    const user = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
