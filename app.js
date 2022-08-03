const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const sslRedirect = require("heroku-ssl-redirect").default;
const config = require("./utils/config");
require("express-async-errors");

const app = express();
const itemsRouter = require("./controllers/items");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const imgUrlsRouter = require("./controllers/imgUrls");
const testingRouter = require("./controllers/testing");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

app.use(sslRedirect());
app.use(cors());
// Check if the build dir contains a file corresponding to the request's address and if so, return it.
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
// The order of middlewares matters!

app.use("/api/items", itemsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/imgUrls", imgUrlsRouter);

// Used for Cypress to reset database
if (process.env.NODE_ENV === "test") {
  app.use("/api/testing", testingRouter);
}

// Allows deployed app to access routes
if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));
}
app.get("*", (request, response) => {
  response.sendFile(path.join(__dirname, "build", "index.html"));
});

// Use the middleware after the routes so it is
// only called if no route handles the request
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
