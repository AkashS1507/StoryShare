require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Story = require("../models/storySchema.js");

const MONGO_URL = process.env.MONGO_URL;

main()
  .then(() => {  
     console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Story.deleteMany({});
  await Story.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();