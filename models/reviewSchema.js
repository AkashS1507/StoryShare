const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema
const reviewSchema = new mongoose.Schema({
  comment: String,
  author: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Review", reviewSchema);