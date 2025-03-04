// server/controllers/courseController.js

const Course = require('../models/Course');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Server error fetching course' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    // Example logic: only partners can create a course (check req.user.role)
    if (req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Forbidden: Only partners can create courses' });
    }
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(400).json({ error: 'Failed to create course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    if (req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Forbidden: Only partners can update courses' });
    }
    const { courseId } = req.params;
    const updatedCourse = await Course.findOneAndUpdate({ courseId }, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(400).json({ error: 'Failed to update course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Forbidden: Only partners can delete courses' });
    }
    const { courseId } = req.params;
    const deletedCourse = await Course.findOneAndDelete({ courseId });
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(400).json({ error: 'Failed to delete course' });
  }
};
