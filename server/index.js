const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Course = require('./models/Course');
const Partner = require('./models/Partner');

const app = express();

// Configure CORS to explicitly allow the Live Server IP and localhost, with credentials and methods
app.use(cors({
  origin: ['http://192.168.2.161:5500', 'http://localhost:5500', 'http://localhost:*'], // Explicitly allow your Live Server IP and localhost
  methods: ['GET', 'POST', 'OPTIONS'], // Allow common HTTP methods, including OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  credentials: true, // Allow cookies if needed (optional, disable if not using auth)
  optionsSuccessStatus: 200 // Some browsers (e.g., older Chrome) require this for OPTIONS
}));

app.use(express.json());

// Connect to MongoDB Atlas with modern options
mongoose.connect('mongodb+srv://UpSkilled:Beretta-M9@upskilled.jfcn3.mongodb.net/upskilled?retryWrites=true&w=majority&appName=UpSkilled', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Remove deprecated options; use these modern alternatives if needed:
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds for initial connection
  heartbeatFrequencyMS: 10000, // How often to check server heartbeat (10 seconds)
  maxPoolSize: 10 // Maximum number of connections in the pool (adjust as needed)
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB Atlas connection error:', err);
  process.exit(1); // Exit if connection fails
});

// Handle MongoDB disconnection with modern reconnection logic
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected, attempting to reconnect...');
  // Use exponential backoff for reconnection attempts
  let reconnectAttempts = 0;
  const maxAttempts = 5;
  const reconnect = () => {
    if (reconnectAttempts < maxAttempts) {
      const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff (1s, 2s, 4s, 8s, 16s)
      reconnectAttempts++;
      console.log(`Reconnecting to MongoDB in ${delay}ms (Attempt ${reconnectAttempts}/${maxAttempts})...`);
      setTimeout(() => {
        mongoose.connect('mongodb+srv://UpSkilled:Beretta-M9@upskilled.jfcn3.mongodb.net/upskilled?retryWrites=true&w=majority&appName=UpSkilled', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          heartbeatFrequencyMS: 10000,
          maxPoolSize: 10
        }).then(() => {
          console.log('Reconnected to MongoDB Atlas');
          reconnectAttempts = 0; // Reset on success
        }).catch(err => {
          console.error('Reconnection attempt failed:', err);
          reconnect(); // Try again if failed
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached, exiting...');
      process.exit(1); // Exit if reconnection fails after max attempts
    }
  };
  reconnect();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// API Endpoints
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    console.log(`Fetched ${courses.length} courses for request from ${req.headers.origin} on port ${req.headers.host}`);
    if (courses.length === 0) {
      console.warn('No courses found in database');
    }
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Server error fetching courses: ' + err.message });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    console.log('Received partner submission:', req.body);
    const { businessCategory, contactNumber, email, courseDescription } = req.body;
    if (!businessCategory || !contactNumber || !email || !courseDescription) {
      throw new Error('Missing required fields: businessCategory, contactNumber, email, or courseDescription');
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    // Validate contactNumber (simple numeric check)
    if (!/^\d+$/.test(contactNumber)) {
      throw new Error('Contact number must be numeric');
    }

    const partner = new Partner({ 
      businessCategory, 
      contactNumber, 
      email, 
      courseDescription,
      createdAt: new Date() 
    });
    await partner.save();
    console.log(`New partner saved: ${email}`);
    res.status(201).json({ message: 'Partner registered successfully' });
  } catch (err) {
    console.error('Error saving partner:', err);
    res.status(400).json({ error: 'Failed to save partner: ' + err.message });
  }
});

// Handle preflight OPTIONS requests explicitly for CORS
app.options('/api/courses', cors()); // Allow CORS preflight for GET
app.options('/api/partners', cors()); // Allow CORS preflight for POST

// Error handling middleware for unexpected errors
app.use((err, req, res, next) => {
  console.error('Unexpected server error:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

// Try multiple ports starting from 3000, with detailed logging
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    const nextPort = PORT + 1;
    console.log(`Port ${PORT} in use, trying ${nextPort}...`);
    app.listen(nextPort, (err) => {
      if (err) {
        console.error('Error on port', nextPort, ':', err);
        process.exit(1); // Exit if no ports work
      } else {
        console.log(`Server running on port ${nextPort}`);
      }
    });
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});