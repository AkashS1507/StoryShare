const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {storySchemaJoi} = require("../schema.js");
const Story = require("../models/storySchema");
const { clerkClient, getAuth } = require("@clerk/express");

function isLoggedIn(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) return res.redirect("/signin");
  next();
}

// Joi Validation
const validateStory = (req, res, next) => {
  let {error} = storySchemaJoi.validate(req.body);
  if(error){
    throw new ExpressError(400, error);
  } else{
    next();
  }
}

// Create route GET
router.get("/create", isLoggedIn, (req, res) => {
    res.render("stories/createStory.ejs");
});

// Create route POST
router.post("/create", isLoggedIn, validateStory, wrapAsync(async (req, res) => {
  const { userId } = getAuth(req);
  const newStory = new Story({
    ...req.body.story,
    author: userId,
  });
  await newStory.save();
  res.redirect("/stories");
}));


// All stories
router.get("/", async (req, res) => {
  const stories = await Story.find({}).sort({ createdAt: -1 });
  res.render("stories/stories.ejs", { stories });
});

// Show route
router.get("/:id", wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = getAuth(req);
  const story = await Story.findById(id).populate("reviews");
   for (let review of story.reviews) {
    if (review.author) {
      review.user = await clerkClient.users.getUser(review.author);
    }
  }
  res.render("stories/showStory", { story, userId });
}));

// Edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const story = await Story.findById(id);
  if(story.author !== getAuth(req).userId) {
    return res.redirect(`/stories/${id}`);
  }
  res.render("stories/edit.ejs", { story });
}));


// Update route
router.put("/:id", isLoggedIn, validateStory, wrapAsync(async (req,res)=>{
  const {id} = req.params;
  const story = await Story.findById(id);
  if(story.author !== getAuth(req).userId) {
    return res.redirect(`/stories/${id}`);
  }
  await Story.findByIdAndUpdate(id, req.body.story);
  res.redirect(`/stories/${id}`);
}));



// Delete route
router.delete("/:id", isLoggedIn, wrapAsync(async (req,res)=>{
  const {id} = req.params;
  const story = await Story.findById(id);
  if(story.author !== getAuth(req).userId) {
    return res.redirect(`/stories/${id}`);
  }
  await Story.findByIdAndDelete(id);
  res.redirect("/stories");
}));


module.exports = router;