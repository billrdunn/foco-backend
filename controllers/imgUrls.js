const imgUrlRouter = require("express").Router();
const ImgUrl = require("../models/imgUrl");

imgUrlRouter.get("/", async (req, res) => {
  const imgUrls = await ImgUrl.find({});
  // Send as a json fomatted string
  res.json(imgUrls);
});

imgUrlRouter.get("/:id", async (req, res) => {
  const imgUrl = await ImgUrl.findById(req.params.id);
  if (imgUrl) res.json(imgUrl);
  else res.status(404).end();
  // note next(exception) is called implicitly by express-async-errors
});

imgUrlRouter.post("/", async (req, res) => {
  const imgUrl = new ImgUrl(req.body);
  console.log("express post imgUrl :>> ", imgUrl);
  const savedImgUrl = await imgUrl.save();
  res.json(savedImgUrl);
});

imgUrlRouter.delete("/:id", async (req, res) => {
  console.log("in delete");
  const imgUrl = await ImgUrl.findById(req.params.id);
  console.log("imgUrl :>> ", imgUrl);
  if (!imgUrl) {
    res.status(404).json({ error: "requested blog to delete does not exist" });
  } else {
    await ImgUrl.findByIdAndRemove(req.params.id);
    res.status(204).end();
  }
});

module.exports = imgUrlRouter;
