'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const app = express();
app.use(cors());
const mongoose = require('mongoose');
const User = require('./models/User.js');

//mongoDB set up
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect('mongodb://localhost:27017/new-users-db', mongooseOptions);

//seeded mongo data
let david = new User({ name: 'David', email: 'thebestdavid@gmail.com', books: [{ name: 'Wheel of Time', author: 'Robert Jordan and Brandon Sanderson', genre: 'fantasy', description: 'An epic adventure in a world on magic and monsters', status: 'owned' }, { name: 'Drive', author: 'Dan Pink', genre: 'self-improvement', description: 'Learn what motivates you and how to leverage that to be your best!', status: 'owned' }, { name: 'Mistborn', author: 'Brandon Sanderson', genre: 'fantasy', description: 'An epic adventure in a world of powerful magic', status: 'owned' }] })
david.save();



//auth0 set up
const client = jwksClient({
  jwksUri: 'https://dev-3y13wdvq.us.auth0.com/.well-known/jwks.json'
});
function getKey(header, callback) {
  console.log('tes1')
  client.getSigningKey(header.kid, function (err, key) {
    console.log(key)
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
app.use('*', errorHandler);

//route functions
function handleGetBooks(req, res) {
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
