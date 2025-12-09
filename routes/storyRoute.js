const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {storySchemaJoi} = require("../schema.js");
const Story = require("../models/storySchema");

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
router.get("/create", (req, res) => {
    res.render("stories/createStory.ejs");
});

// Create route POST
router.post("/create", validateStory, wrapAsync(async (req, res) => {
  const newStory = new Story(req.body.story);
  await newStory.save();
  res.redirect("/stories");
}));

// All stories
router.get("/", async (req, res) => {
  const stories = await Story.find({});
  res.render("stories/stories.ejs", { stories });
});

// Show route
router.get("/:id", wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const story = await Story.findById(id).populate("reviews");
  res.render("stories/showStory", { story });
}));

// Edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const story = await Story.findById(id);
  res.render("stories/edit.ejs", { story });
}));

// Update route
router.put("/:id", validateStory, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { title, category, story } = req.body;
  await Story.findByIdAndUpdate(id, { title, category, story });
  res.redirect(`/stories/${id}`);
}));

// Delete route
router.delete("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Story.findByIdAndDelete(id);
  res.redirect("/stories");
}));

module.exports = router;