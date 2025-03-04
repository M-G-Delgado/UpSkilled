// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Learner (User) authentication routes
router.post('/signup', authController.userSignup);
router.post('/login', authController.userLogin);

// Partner authentication routes
router.post('/partner/signup', authController.partnerSignup);
router.post('/partner/login', authController.partnerLogin);

module.exports = router;
