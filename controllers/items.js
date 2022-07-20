const itemRouter = require("express").Router();
const Item = require("../models/item");

itemRouter.get("/", async (req, res) => {
  const items = await Item.find({});
  // Send as a json fomatted string
  res.json(items);
});

itemRouter.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (item) res.json(item);
  else res.status(404).end();
  // note next(exception) is called implicitly by express-async-errors
});

itemRouter.post("/", async (req, res) => {
  const item = new Item(req.body);
  const savedItem = await item.save();
  res.json(savedItem);
});

module.exports = itemRouter;
