// server/routes/courseRoutes.js

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/authenticateToken');

// Public route: get all courses
router.get('/', courseController.getAllCourses);

// Public route: get a single course by courseId
router.get('/:courseId', courseController.getCourseById);

// Protected route: create a course (for partners)
router.post('/', authenticateToken, courseController.createCourse);

// Protected route: update a course
router.put('/:courseId', authenticateToken, courseController.updateCourse);

// Protected route: delete a course
router.delete('/:courseId', authenticateToken, courseController.deleteCourse);

module.exports = router;
