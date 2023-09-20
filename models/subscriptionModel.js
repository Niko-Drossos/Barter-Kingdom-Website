const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  email: String,
  name: String,
});

const subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = subscription;
