const express = require('express');

const courseRouter = require('./courses');

const router = express.Router();

const { protect, authortize } = require('../middleware/auth');

const { getBootcamps, 
        getBootcamp, 
        createBootcamp, 
        updateBootcamp,
        deleteBootcamp,
        getBootcampsInRadius,
        bootcampPhotoUpload
    } = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamps');

const advanceResult = require('../middleware/advanceResults');

// Re-Route into other resource router 
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/')
    .get(advanceResult(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authortize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authortize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authortize('publisher', 'admin'), deleteBootcamp);

router
    .route('/:id/photo')
    .put(protect, authortize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;

