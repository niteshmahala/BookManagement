const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Book',
        required:"bookId is required"
    },
    reviewedBy:{
        type:String,
        required:true,
        default:"Guest"
    },
    reviewedAt:{
        type:Date,
        required:true
    },
    rating:{
        type:Number,
        required:true,
        minlength:1,
        maxlength:5
    },
    review:String,
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

module.exports = mongoose.model('Review',reviewSchema)  //reviews