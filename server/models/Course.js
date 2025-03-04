// models/Course.js

const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  details: [{ type: String }],
  images: [{
    url: { type: String },
    alt: { type: String }
  }],
  topics: [{
    icon: { type: String },
    text: { type: String },
    alt: { type: String }
  }],
  duration: { type: String },
  price: { type: Number, required: true },
  level: { type: String }, // e.g., "Discovery", "Foundation", "Proficiency", etc.
  prerequisites: [{ type: String }],
  maxClassSize: { type: Number },
  skillTags: [{ type: String }],
  equipmentProvided: [{ type: String }],
  language: { type: String },
  isFeatured: { type: Boolean, default: false },
  videoPreview: { type: String },
  instructor: {
    // You may eventually convert this to a reference if needed
    name: { type: String },
    experience: { type: String },
    image: { type: String }
  },
  partner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Partner',
    required: true
  },
  venue: { type: String },
  certification: { type: String },
  learningOutcomes: [{ type: String }],
  dates: [{
    date: { type: Date, required: true },
    spotsAvailable: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Scheduled', 'Completed', 'Cancelled'], 
      default: 'Scheduled' 
    }
  }],
  reviews: [{
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // reference to the user who left the review
    name: { type: String },
    date: { type: Date, default: Date.now },
    rating: { type: Number, required: true },
    text: { type: String }
  }],
  totalEnrollments: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
