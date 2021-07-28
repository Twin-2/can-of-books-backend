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
mongoose.connect('mongodb://localhost:27017/books-db-lab13-a', mongooseOptions);

//seeded mongo data
// let david = new User({ name: 'David', email: 'thebestdavid@gmail.com', books: [{ name: 'Wheel of Time', author: 'Robert Jordan and Brandon Sanderson', genre: 'fantasy', description: 'An epic adventure in a world on magic and monsters', status: 'owned' }, { name: 'Drive', author: 'Dan Pink', genre: 'self-improvement', description: 'Learn what motivates you and how to leverage that to be your best!', status: 'owned' }, { name: 'Mistborn', author: 'Brandon Sanderson', genre: 'fantasy', description: 'An epic adventure in a world of powerful magic', status: 'owned' }] })
// david.save();


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
      console.log(user)
      user.save()
        .then(user => res.json(user.books))
        .catch(err => console.error(err))
    })
})
app.use('*', errorHandler);

//route functions
function handleGetBooks(req, res) {
  console.log('books req body', req.body)
  User.find({})
    .then(users => {
      console.log(users)
      res.json(users)
    })
}
function errorHandler(req, res) {
  res.status(404).send('No Such Route')
}

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
