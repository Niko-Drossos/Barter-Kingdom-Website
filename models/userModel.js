const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fName: String,
  lName: String,
  login: String,
  password: String,
  email: String,
  photo: String,
});

const users = mongoose.model('User', userSchema);
module.exports = users
