const Joi = require("joi");

module.exports.storySchemaJoi = Joi.object({
  story: Joi.object({
    title: Joi.string().required(),
    category: Joi.string().required(),
    image: Joi.string().required(),
    story: Joi.string().required(),
  }).required(),
});

module.exports.reviewSchemaJoi = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
  }).required(),
});