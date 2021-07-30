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
mongoose.connect('mongodb://localhost:27017/books-db-lab13-e', mongooseOptions);


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
app.get('/auth-test', handleGetProfile);
app.get('/books', handleGetBooks);
app.post('/books', handleAddBook);

app.delete('/books', async (req, res) => {
  let id = req.query.id;
  console.log(id)
  let email = req.query.email;
  await User.findOne({ "email": email }, (err, user) => {
    console.log("line 42", user)
    const filtered = user.books.filter(book => book.id !== id);
    user.books = filtered;
    console.log("filtered array 45", filtered)
    user.save();
    res.send(filtered);
    console.log('end of delete')
  })

})
app.use('*', errorHandler);

//route functions
function handleGetProfile(req, res) {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      res.send('invalid token - you cannot access this route');
    } else {
      res.json({ 'token': token })
    }
  });
  console.log('profile page')
}
function handleAddBook(req, res) {
  console.log('addbook')
  let bookInfo = req.body.data
  let email = req.body.email
  User.findOne({ 'email': email })
    .then(user => {
      bookInfo.name = new BookSchema(bookInfo);
      bookInfo.name.save();
      user.books.push(bookInfo.name)
      user.save()
        .then(user => res.json(user.books))
        .catch(err => console.error(err))
    })
    .catch(err => console.log(err))
  console.log('books page')
}
function handleGetBooks(req, res) {
  let emails = req.query.user;
  let username = req.query.name;
  console.log('email', emails)
  console.log('name', username)
  User.find({ 'email': `${emails}` })
    .then(users => {
      if (users.length > 0) {
        console.log('users line 91', users)
        res.json(users)
      } else {
        username = new User({ "name": `${username}`, "email": `${emails}`, "books": [] })
        username.save();
        User.find({ 'email': `${emails}` })
          .then(users => {
            console.log('users line 100', users)
            res.json(users)
          })
          .catch(err => console.error(err))
      }
    })
    .catch(err => console.error(err))
  console.log('get books')
}
function errorHandler(req, res) {
  res.status(404).send('No Such Route')
}

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
