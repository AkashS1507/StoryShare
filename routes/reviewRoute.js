const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {reviewSchemaJoi} = require("../schema.js");
const Review = require("../models/reviewSchema");
const Story = require("../models/storySchema");

// Joi Validation
const validateReview = (req, res, next) => {
  let {error} = reviewSchemaJoi.validate(req.body);
  if(error){
    throw new ExpressError(400, error);
  } else{
    next();
  }
}

// Reviews Post route
router.post("/",validateReview, wrapAsync(async(req, res) => {
  let story = await Story.findById(req.params.id);
  let newReview = new Review(req.body.review);

  story.reviews.push(newReview);

  await newReview.save();
  await story.save();
  res.redirect(`/stories/${story._id}`);
}));

// Reviews Delete route
router.delete("/:reviewId", wrapAsync(async(req, res) => {
  let {id, reviewId} = req.params;
  await Story.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/stories/${id}`);
}));

module.exports = router;