// server/controllers/authController.js

const User = require('../models/User');
const Partner = require('../models/Partner');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// === Learner (User) Sign Up ===
exports.userSignup = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, fullName });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({ error: 'Server error during user signup' });
  }
};

// === Learner (User) Login ===
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Include role: 'user' in the token payload
    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Server error during user login' });
  }
};

// === Partner Sign Up ===
exports.partnerSignup = async (req, res) => {
  try {
    const { email, password, businessCategory, courseDescription, contactNumber, businessName } = req.body;
    let existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'Partner already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const partner = new Partner({
      email,
      password: hashedPassword,
      businessCategory,
      courseDescription,
      contactNumber,
      businessName,
      createdAt: new Date()
    });
    await partner.save();
    res.status(201).json({ message: 'Partner registered successfully' });
  } catch (error) {
    console.error('Partner signup error:', error);
    res.status(500).json({ error: 'Server error during partner signup' });
  }
};

// === Partner Login ===
exports.partnerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Include role: 'partner' in the token payload
    const token = jwt.sign({ id: partner._id, role: 'partner' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Partner logged in successfully', token });
  } catch (error) {
    console.error('Partner login error:', error);
    res.status(500).json({ error: 'Server error during partner login' });
  }
};
