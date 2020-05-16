const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookirParser = require('cookie-parser');
const connectDb = require("./config/db");

const errorHandler = require('./middleware/error');
// const client = require('./config/db');


//Load env vars
dotenv.config({ path: './config/config.env' })

//Conect to database

connectDb();

//Route Files

const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();

//Body Parser

app.use(express.json());

// Cookie Parser
app.use(cookirParser());

// Dev Logging Middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//File Uplodaing
app.use(fileupload());

// Set Static Folder 
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routers

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler);


const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}` )
);

//Handle unhandle promise rejections
process.on('unhandleRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(() => {
        process.exit(1)
    })
})