const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);
const ImgUrl = require("../models/imgUrl");

const initialImgUrls = [
  {
    url: "https://test-focobcn-compressed.s3.amazonaws.com/2022-8-2-20-52-0-61.jpg",
  },
  {
    url: "https://test-focobcn-compressed.s3.amazonaws.com/2022-8-4-20-57-31-481.jpg",
  },
];

// Ensure database is in same state before each test
beforeEach(async () => {
  await ImgUrl.deleteMany({});

  // Create array of mongoose objects
  const imgUrlObjects = initialImgUrls.map((imgUrl) => new ImgUrl(imgUrl));
  // Create array of promises
  const promiseArray = imgUrlObjects.map((imgUrl) => imgUrl.save());
  // Wait for all promises to resolve
  await Promise.all(promiseArray);
});

test("imgUrls are returned as json", async () => {
  await api
    .get("/api/imgurls")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("one of the urls is image 2022-8-2-20-52-0-61", async () => {
  const response = await api.get("/api/imgurls");
  const contents = response.body.map((imgUrl) => imgUrl.url);
  expect(contents).toContain(
    "https://test-focobcn-compressed.s3.amazonaws.com/2022-8-2-20-52-0-61.jpg"
  );
});

test("all imgUrls are returned", async () => {
  const response = await api.get("/api/imgurls");
  expect(response.body.length).toBe(initialImgUrls.length);
});

test("the unique identifier is named id", async () => {
  const response = await api.get("/api/imgurls");
  const contents = response.body.map((imgUrl) => imgUrl.id)[0];
  expect(contents).toBeDefined();
});

test("the unique identifier is not named _id", async () => {
  const response = await api.get("/api/imgurls");
  // eslint-disable-next-line no-underscore-dangle
  const contents = response.body.map((imgUrl) => imgUrl._id)[0];
  expect(contents).not.toBeDefined();
});

test("a new url can be added", async () => {
  const newImgUrl = {
    url: "https://test-focobcn-compressed.s3.amazonaws.com/2022-8-2-20-52-0-67.jpg",
  };
  await api
    .post("/api/imgurls")
    .send(newImgUrl)
    .expect(200)
    .expect("Content-Type", /application\/json/);
  const response = await api.get("/api/imgurls");
  const contents = response.body.map((imgUrl) => imgUrl.url);
  expect(response.body.length).toBe(initialImgUrls.length + 1);
  expect(contents).toContain(
    "https://test-focobcn-compressed.s3.amazonaws.com/2022-8-2-20-52-0-67.jpg"
  );
}, 5000);

test("documents in focobcn.imgurls only contain url and id properties", async () => {
  const response = await api.get("/api/imgurls");
  const contents = response.body.map((imgUrl) => Object.keys(imgUrl));
  contents.forEach((element) => {
    expect(element).toEqual(["url", "id"]);
  });
}, 5000);

afterAll(() => {
  mongoose.connection.close();
});
