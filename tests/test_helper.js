const ImgUrl = require("../models/imgUrl");

const initialImgUrls = [
  {
    url: "https://test-focobcn-compressed.s3.amazonaws.com/2022-8-2-20-52-0-61.jpg",
  },
  {
    url: "https://test-focobcn-compressed.s3.amazonaws.com/2022-8-4-20-57-31-481.jpg",
  },
];

const imgUrlsInDb = async () => {
  const imgUrls = await ImgUrl.find({});
  return imgUrls.map((note) => note.toJSON());
};

const nonExistingId = async () => {
  const imgUrl = new ImgUrl({
    url: "https://test-focobcn-compressed.s3.amazonaws.com/2013-4-3-93-65-32-333.jpg",
  });
  await imgUrl.save();
  await imgUrl.remove();

  return imgUrl.id.toString();
};

module.exports = { initialImgUrls, imgUrlsInDb, nonExistingId };
