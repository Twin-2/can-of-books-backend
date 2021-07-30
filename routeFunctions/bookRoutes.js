'use strict';

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const User = require('./models/User.js');
const BookSchema = require('./models/BookSchema')

let Book = {}

Book.add = function handleAddBook(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, getKey, {}, function (err, user) {
        if (err) {
            res.send('invalid token - you cannot access this route');
        } else {
            let { bookInfo, email } = req.body;
            // let bookInfo = req.body.data
            // let email = req.body.email
            User.findOne({ email: email })
                .then(user => {
                    let book = new BookSchema(bookInfo);
                    book.save();
                    user.books.push(book)
                    user.save()
                        .then(user => res.json(user.books))
                        .catch(err => console.error(err))
                })
            console.log('books page')
        }
    }
}

Book.list = function handleGetBooks(req, res) {
    let emails = req.query.user;
    let username = req.query.name;
    console.log('email', emails)
    console.log('name', username)
    if (!User.find({ 'email': `${emails}` })) {
        User.find({ 'email': `${emails}` })
            .then(users => {
                console.log('users line 74', users)
                res.json(users)
            })
    } else {
        username = new User({ "name": `${username}`, "email": `${emails}` })
        username.save();
        User.find({ 'email': `${emails}` })
            .then(users => {
                console.log('users line 82', users)
                res.json(users)
            })
    }
    console.log('get books')
}


module.exports = Book;