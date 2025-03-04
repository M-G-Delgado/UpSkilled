// models/Partner.js

const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  businessCategory: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  courseDescription: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // Authentication fields for partner login:
  businessName: { type: String },
  password: { type: String, required: true },  // Hashed password
  businessAddress: { type: String },
  businessHours: { type: String },
  contactPerson: { type: String },
  paymentSettings: { type: String, default: 'monthly' },
  notificationPreferences: { type: String, default: 'all' },
  totalEarnings: { type: Number, default: 0 },
  coursesHeld: { type: Number, default: 0 },
  totalLearners: { type: Number, default: 0 },
  averageCourseRating: { type: Number, default: 0 },
  monthlyRevenue: { type: Number, default: 0 },
  partnerLevel: { type: String, default: 'Gold' },
  commissionTier: { type: Number, default: 25 }
});

module.exports = mongoose.model('Partner', PartnerSchema);
