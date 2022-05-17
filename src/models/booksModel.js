const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const newBook = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true
    },
    excerpt: {
        type: String,
        require: true,
        trim: true
    },
    userId: {
        type: ObjectId,
        ref: 'userbooks',
        require: true
    },
    ISBN: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    category: {
        type: String,
        require: true,
        trim: true
    },
    subcategory: {
        type: [String],
        require: true
    },
    review: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        require: true
    },
    deletedAt: {
        type: Date
    }
})
module.exports = mongoose.model('book', newBook)