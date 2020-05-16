const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamps');
const asyncHandler = require('../middleware/async');

const ErrorResponse = require('../utils/errResponse');



// @desc Get All Courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public 
exports.getCourses = asyncHandler(async (req, res, next) => {

    if(req.params.bootcampId) {
        const Courses = await Course.find({
            bootcamp: req.params.bootcampId
        })

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advanceResult)
    }

   
    
})

// @desc Get A SingleCourses
// @route GET /api/v1/courses/:id
// @access Public 
exports.getCourse = asyncHandler(async (req, res, next) => {
    
    const course = await (await Course.findById(req.params.id)).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course) {
        return next(new ErrorResponse(`No Course with the id of ${req.params.id} `), 404)

    }

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc Add A Course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private 
exports.addCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId; 

    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId} `), 
            404
        );
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to this bootcamp ${bootcamp.name}`, 401));
    }  

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc Update Course
// @route PUT /api/v1/courses/:id
// @access Private 
exports.updateCourse = asyncHandler(async (req, res, next) => {
    
   let  course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id} `), 
            404
        );
    }

    // Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update a course to this coursw ${course.name}`, 401));
    }  

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc Delete a Course
// @route DELETE /api/v1/courses/:id
// @access Private 
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    
    const course = await Course.findByIdAndRemove(req.params.id);
 
     if(!course) {
         return next(new ErrorResponse(`No course with the id of ${req.params.id} `), 
             404
         );
     }

    // Make sure user is bootcamp owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete a course ${course.name}`, 401));
    }  

     await course.remove();
 
     res.status(200).json({
         success: true,
         data: {}
     })
 })
 


