const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviewSchema");

// Schema
const storySchema = new mongoose.Schema({
  title: String,
  category: String,
  image: String,
  story: String,
  author: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    }
  ],
}, { timestamps: true });

storySchema.post("findOneAndDelete", async(story) => {
  if(story) {
    await Review.deleteMany({_id : {$in: story.reviews}});
  }
});

module.exports = mongoose.model("Story", storySchema);