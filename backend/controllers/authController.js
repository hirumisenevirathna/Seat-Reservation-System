const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fallback secret if .env is missing
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// ─────── Signup ───────
exports.signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    console.log("User created:", email);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(" Signup error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─────── Login ───────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Add email/id to the token payload
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful:', email);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
};


