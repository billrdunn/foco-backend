// Note this module resembles node-config package, so it may be better to use that in future

// Environment variables from .env file now available globally
require("dotenv").config();

const PORT = process.env.PORT;

const MONGODB_URI =
  process.env.NODE_ENV === "test" ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI;

module.exports = {
  MONGODB_URI,
  PORT,
};
