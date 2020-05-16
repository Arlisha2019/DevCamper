const express = require('express');

const { protect, authortize } = require('../middleware/auth');

const Course = require('../models/Course');

const advanceResult = require('../middleware/advanceResults');

const router = express.Router({ mergeParams: true});


const { 
    getCourses, 
    getCourse, 
    updateCourse,
    deleteCourse,
    addCourse } = require('../controllers/courses');


router
    .route('/')
    .get(advanceResult(Course, {select: 'name description'}), getCourses)
    .post(protect, authortize('publisher', 'admin'), addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authortize('publisher', 'admin'), updateCourse)
    .delete(protect, authortize('publisher', 'admin'), deleteCourse);
    

module.exports = router;