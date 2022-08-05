/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  }
});

// Format object returned by Mongoose by
// modifying toJSON method of schema
itemSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // transform _id (object) to id (string)
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    // don't need mongo versioning field at frontend
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("ImgUrl", itemSchema);
