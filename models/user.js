const mongoose = require("mongoose");

// const itemsSchema = new mongoose.Schema({
//   id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Item",
//   },
//   image: {
//     type: String,
//   },
// });

// const userSchema = new mongoose.Schema({
//   username: String,
//   name: String,
//   passwordHash: String,
//   items: [itemsSchema],
// });

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  user_images: [String],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
