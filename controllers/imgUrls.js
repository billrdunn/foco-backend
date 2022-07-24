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

imgUrlRouter.delete("/:id", async (request, response) => {
  const imgUrl = await ImgUrl.findById(request.params.id);
  if (!imgUrl) {
    return response.status(400).json({ error: "requested blog to delete does not exist" });
  }
  const res = await ImgUrl.findByIdAndRemove(request.params.id);

  return res;
});

module.exports = imgUrlRouter;
