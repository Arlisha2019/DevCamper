// const dotenv = require('dotenv');

// dotenv.config({ path: './config/config.env' })

// const connectDB = async () => {
//     const MongoClient = require('mongodb').MongoClient;
//     const uri = process.env.MONGO_URI;
//     const client = await new MongoClient(uri, 
//         { 
//             useNewUrlParser: true, 
//             retryWrites: true,
//             useUnifiedTopology: true
//         });

//     client.connect(err => {
//         if(err) {
//             console.log(err)
//         } else {
//             console.log(`System connected to MongoDB Server: `)
//         }
// //   perform actions on the collection object
//         client.close();
//     });
// }



// module.exports = client;


const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;