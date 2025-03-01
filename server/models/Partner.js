const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  businessCategory: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  courseDescription: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Partner', PartnerSchema);