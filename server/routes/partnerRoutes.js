// server/routes/partnerRoutes.js

const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const authenticateToken = require('../middleware/authenticateToken');

// Protected route: get partner by ID
router.get('/:id', authenticateToken, partnerController.getPartnerById);

// Protected route: update partner info
router.put('/:id', authenticateToken, partnerController.updatePartner);

module.exports = router;
