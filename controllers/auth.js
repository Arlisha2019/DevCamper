const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errResponse');
const crypto = require('crypto')


// @desc Register user
// @route POST /api/v1/auth/register
// @access Public 
exports.register = asyncHandler(async (req, res, next) => {

    const { name, email, password, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    //Create Token 
    sendTokenRepsonse(user, 200, res);
})

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public 
exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    // Validate email & password
    if(!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    //Check for User
    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }
    //Check if password matches
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    sendTokenRepsonse(user, 200, res);
})

// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access Private

exports.getMe = asyncHandler(async (req, res, next ) => {

    console.log('Get Me', req.user);

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc Forgot Password
// @route POST /api/v1/auth/forgotpassword
// @access Public

exports.forgotPassword = asyncHandler(async (req, res, next ) => {

    // console.log('Get Me', req.user);

    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new ErrorResponse('There is no user with those credentials', 404));
    }

    // Get Rest token 

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

   // Create reset URL
   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

   const message = `You are receiving this email because you (or someone else) has requested
   the reset of a password. Please make an update request to: \n\n ${resetURL}`;

   try {
    await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
    });

    res.status(200).json({
        success: true,
        data: 'Email Sent'
    })
   } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
   }

   await user.save({ validateBeforeSave: false });

//    return next(new ErrorResponse('email could not be sent', 500))
});

// @desc Reset Password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access Public

exports.resetPassword = asyncHandler(async (req, res, next ) => {

    // Get hashed token

    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

    const user = await User.findOne({

       resetPasswordToken,
       resetPasswordExpire: { $gt: Date.now()}

    });
    

    if(!user) {
        return next(new ErrorResponse('Invalid Token ', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenRepsonse(user, 200, res);
});



// Get token from model , create cookie and send response
const sendTokenRepsonse = (user, statusCode, res) => {
    //Create Token 
   const token = user.getSignedJwtToken();

   const options = {
       expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 ),
       httpOnly: true

   }

   res
       .status(statusCode)
       .cookie('token', token, options)
       .json({
           success: true,
           token 
       })
}