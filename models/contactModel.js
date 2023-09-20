const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  email: String,
  name: String,
});

const contact = mongoose.model('Contact', contactSchema);

module.exports = contact;
