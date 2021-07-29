'use strict';

const mongoose = require('mongoose');
// const bookSchema = require('./BookSchema.js')

const bookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: String },
    genre: { type: String },
    description: { type: String, required: true },
    status: { type: String, required: true }
})

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    books: [bookSchema]
})


module.exports = mongoose.model('users', userSchema);