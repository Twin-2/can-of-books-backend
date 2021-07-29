'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User.js');
const BookSchema = require('./models/BookSchema')

app.use(express.json());
app.use(cors());

//mongoDB set up
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect('mongodb://localhost:27017/books-db-lab13-c', mongooseOptions);


//auth0 set up
const client = jwksClient({
  jwksUri: 'https://dev-3zy4mv8n.us.auth0.com/.well-known/jwks.json'
});
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

//routes
app.get('/auth-test', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      res.send('invalid token - you cannot access this route');
    } else {
      res.json({ 'token': token })
    }
  });
  console.log('profile page')
});
app.get('/books', handleGetBooks);

app.post('/books', (req, res) => {
  let bookInfo = req.body.data
  let email = req.body.email
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
})
app.use('*', errorHandler);

//route functions
function handleGetBooks(req, res) {
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
function errorHandler(req, res) {
  res.status(404).send('No Such Route')
}

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
