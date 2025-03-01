const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  details: [String],
  images: [{ url: String, alt: String }],
  topics: [{ icon: String, text: String, alt: String }],
  duration: String,
  price: String,
  level: String,
  prerequisites: [String],
  maxClassSize: Number,
  skillTags: [String],
  equipmentProvided: [String],
  language: String,
  isFeatured: Boolean,
  videoPreview: String,
  instructor: { name: String, experience: String, image: String },
  business: { name: String, badge: String, image: String },
  venue: String,
  certification: String,
  learningOutcomes: [String],
  dates: [{ date: String, spotsAvailable: Number, status: String }],
  reviews: [{ name: String, date: String, rating: Number, text: String }]
});

module.exports = mongoose.model('Course', CourseSchema);