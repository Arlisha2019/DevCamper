const path = require('path');

const Bootcamp = require('../models/Bootcamps');
const asyncHandler = require('../middleware/async');

const geocoder = require('../utils/geocoder');
const ErrorResponse = require('../utils/errResponse');

// @desc Get All Bootcamps
// @route GET /api/v1/bootcamps
// @access Public 
exports.getBootcamps = asyncHandler(async (req, res, next) => {

        res.status(200).json(res.advanceResult);

});

// @desc Get a single Bootcamps
// @route GET /api/v1/bootcamps/:id
// @access Public 
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            return next(new ErrorResponse(`Become not found with if of ${req.params.id}`, 404));
        }

    res.status(200).json({
        success: true,
        data: bootcamp
        })

});

// @desc Create new Bootcamps
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    //Add user to req.body

    req.body.user = req.user.id;

    console.log(req.body.user);

    // Check for published bootcamp

    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one bootcamp

    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with id ${req.user.id} has already published one bootcamp`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);



        res.status(201).json({
            success: true,
            data: bootcamp
        })

});

// @desc Update a Bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private 
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    
        let bootcamp = await Bootcamp.findById(req.params.id);
    
        if(!bootcamp) {
            return next(new ErrorResponse(`Become not found with if of ${req.params.id}`, 404)
            );
        }
        
        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
        }  

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        } )

        res.status(200).json({ success: true, data: bootcamp });
   
})

// @desc   Delete a single Bootcamp
// @route  DELETE /api.v1/bootcamp/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
   

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Become not found with if of ${req.params.id}`, 404));
    }
    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 401));
    } 

    bootcamp.remove();

    res.status(200).json({ success: true, message: `Delete a single bootcamp ${bootcamp.name}`});


});

// @desc   Get Bootcamp within a radius 
// @route  DELETE /api/v1/bootcamp/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
   
    const { zipcode, distance } = req.params;

    //Get lat/lng from geocoder

    const loc = await geocoder.geocode(zipcode);


    const lat = loc[0].latitude;

    const lng = loc[0].longitude;

    console.log('Get Radius Controller',loc, lat, lng);


    //Calculate radius using radius

    //Divide distance by radius of Earth 

    //Radius of Earth = 3,963 miles / 6,378 km

    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [
                     lng,
                     lat   
                    ],
                    radius
                ]
            }
        }
    })
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })

});

// @desc   Upload photo
// @route  PUT /api/v1/bootcamp/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
   

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Become not found with if of ${req.params.id}`, 404));
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
    } 
   
    if(!req.files) {
        return next(new ErrorResponse(`Please upload a file `, 404));
    }

    const file = req.files.file;

    //Make sure the image is a photo 
    
    

    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file `, 404));
    }

    // Check filesize

    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}` , 404));
    }


    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            next(new ErrorResponse(
                `Problem with file upload`, 
                500
                )
            );
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        })
    })

});