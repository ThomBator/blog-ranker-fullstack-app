require("express-async-errors");
const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const blogRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");

//We will use a unique route for testing purposes
//This will be used to reset the database before each test
//The database is then populated with test data
//This is a good practice to ensure that the tests are not affected by previous test runs
if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

const mongoose = require("mongoose");
// Disable strict query mode to allow query filters with fields not explicitly defined in the schema.
// This is useful for flexibility during development but can be enabled for stricter validation in production.
// For more details, see: https://mongoosejs.com/docs/migrating_to_6.html#strictQuery
mongoose.set("strictQuery", false);
const PORT = process.env.PORT || 3003;

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use("/api/blog", blogRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use(middleware.requestLogger);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
