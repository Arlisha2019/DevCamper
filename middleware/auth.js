const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errResponse');
const User = require('../models/User');


// Protect routes

exports.protect = asyncHandler(async (req, res, next) => {
    let token ;

    console.log('Header', req.headers);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // else if(req.cookie.token) {
    //     token = req.cookies.token
    // }

    // Make sure token exisit 

    if(!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }
    // Make sure token is sent 

    try {
        // Verify token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }

});
// Grant access to speific roles
exports.authortize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is unauthorized to access this route`, 403))
        }
        next();
    }
}

