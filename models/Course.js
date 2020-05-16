const mongoose = require('mongoose');


const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [ true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [ true, 'Please add a description']
    },
    weeks : {
        type: String,
        required: [ true, 'Please add a number of weeks']
    },
    tuition : {
        type: Number,
        required: [ true, 'Please add a tution cost']
    },
    minimumSkill : {
        type: String,
        required: [ true, 'Please add a description'],
        enum: ['beginner', 'intermediate', 'advance']
    },
    scholarshipAvailable : {
        type: Boolean,
        default: false
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        require: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    }

});

//Static method to get avg of course tutions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
   

    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
           $group: {
               _id: '$bootcamp',
               averageCost: { $avg: '$tuition'}
           }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
           averageCost: Math.ceil(obj[0].averageCost /10 ) * 10
        })
    } catch (err) {
        console.error(err);
    }

}

//Call getAverage after save
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp);
})

//Call getAverage after save
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);
})


module.exports = mongoose.model('Course', CourseSchema);