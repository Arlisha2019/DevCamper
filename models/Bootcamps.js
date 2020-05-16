var mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

var BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [ 50, 'Name can not be more than 50 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [ true, 'Please add description'],
        maxlength: [ 550, 'Description can not be more than 550 characters']
    },
    website : {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [ 20, 'Phone number can not be longer than 20 characters' ]
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [ true, 'Please add a address']
    },
    location: {
        //GeoJSON Point
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point']// 'location.type' must be 'Point'
        
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        State: String,
        zipecode: String,
        country: String
      },
    careers: {
        //Array of Strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
      },
      averageCost: Number,
      photo: {
          type: String,
          default: 'no-photo.jpg'
      },
      housing: {
          type: Boolean,
          default: false
      },
      jobAssistance: {
          type: Boolean,
          default: false
      },
      acceptGi: {
          type: Boolean,
          default: false
      },
      createdAt: {
          type: Date,
          default: Date.now
      },
      jobGuarantee: {
        type: Boolean,
        default: false
      }, 
      user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true
      }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Create Bootcamp Slug from name
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    // console.log('Slugify', this.name, this.address);
    next();
});

//GEO_CODE & create location
BootcampSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [ loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

    //Do not save address in DB
    this.address = undefined;

    next();
});

//Cascade delete courses when a bootcamp is delete

BootcampSchema.pre('remove', async function(next) {
    console.log(`Course being removed from bootcamp ${this._id}`)
    await this.model('Course').deleteMany({
        bootcamp: this._id
    });
    next();
});

// Reverse populate with viturals 
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);





