const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  model: {
    type: String,
    default: 'gpt-3.5-turbo',
    required: true
  },
  title: {
    type: String,
    default: null
  },
  pin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Session', SessionSchema);
