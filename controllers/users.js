const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const { userExtractor } = require("../utils/middleware");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!username) return response.status(400).json({ error: "username missing" });
  if (!name) return response.status(400).json({ error: "name missing" });
  if (!password) return response.status(400).json({ error: "password missing" });

  if (username.length < 5)
    return response.status(400).json({ error: "username must be at least 5 characters long" });
  if (name.length < 3)
    return response.status(400).json({ error: "name must be at least 3 characters long" });
  if (password.length < 8)
    return response.status(400).json({ error: "password must be at least 8 characters long" });

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return response.status(400).send({ error: "username must be unique" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
  return null;
});

usersRouter.get("/", async (request, response) => {
  // Populate replaces the _id with the object
  // Can also use a second argument to limit the properties of the object
  // Populate depends on defining a "type" in the Mongoose schema using "ref"
  const users = await User.find({}).populate("items");
  response.json(users);
});

usersRouter.put("/:id", userExtractor, async (request, response) => {
  // Note using "userExtractor" as argument adds
  // middleware to extract the user from the request

  if (!request.token) return response.status(401).json({ error: "token missing" });
  if (!request.user) return response.status(404).send({ error: "user not found" });

  const { username, name, passwordHash, items, user_images } = request.body;

  const { user } = request;
  if (username) user.username = username;
  if (name) user.name = name;
  if (passwordHash) user.passwordHash = passwordHash;
  if (items) user.items = items;
  if (user_images) user.user_images = user_images;

  const updatedUser = await request.user.save();
  response.json(updatedUser);
  return null;
});

module.exports = usersRouter;
