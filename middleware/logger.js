//@desc Log Req to Console
const logger = (req, res, next) => {
    req.hello = 'Hello World';
    console.log(`${req.method}`);
    next();
}


module.exports = logger;

