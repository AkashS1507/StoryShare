const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {reviewSchemaJoi} = require("../schema.js");
const Review = require("../models/reviewSchema");
const Story = require("../models/storySchema");
const { getAuth } = require("@clerk/express");

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
router.post("/", validateReview, wrapAsync(async(req, res) => {
  const { userId } = getAuth(req);
  const story = await Story.findById(req.params.id);
  const newReview = new Review({
    ...req.body.review,
    author: userId,
  });
  story.reviews.push(newReview);
  await newReview.save();
  await story.save();
  res.redirect(`/stories/${story._id}`);
}));

// Reviews Delete route
router.delete("/:reviewId", wrapAsync(async(req, res) => {
  const { userId } = getAuth(req);
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  
  if(!review || review.author !== userId){
    return res.redirect(`/stories/${id}`);
  }
  await Story.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/stories/${id}`);
}));


module.exports = router;