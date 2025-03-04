// server/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');    // Ensure you have this file
const partnerRoutes = require('./routes/partnerRoutes');  // Ensure you have this file

const app = express();

// Configure CORS
app.use(cors({
  origin: [
    'http://192.168.2.161:5500',
    'http://localhost:5500',
    'http://localhost:*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount other routes (make sure these files exist)
app.use('/api/courses', courseRoutes);
app.use('/api/partners', partnerRoutes);

// Example protected route
const authenticateToken = require('./middleware/authenticateToken');
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected server error:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
