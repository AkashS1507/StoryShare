const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
require("dotenv").config();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const {clerkMiddleware, clerkClient, requireAuth, getAuth } = require("@clerk/express");

const storyRoute = require("./routes/storyRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/storyshare";
const MONGO_URL = process.env.MONGO_URL;

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(clerkMiddleware());

app.use((req, res, next) => {
  res.locals.auth = req.auth(); // req.auth comes from clerkMiddleware()
  next();
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});

// stories routes
app.use("/stories", storyRoute);

// reviews routes
app.use("/stories/:id/reviews", reviewRoute);


// Clerk user info
app.get('/user', async (req, res) => {
  const { userId } = getAuth(req);
  const user = await clerkClient.users.getUser(userId);
  res.send(user);
});


app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", {err});
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server is listening to 8080");
});