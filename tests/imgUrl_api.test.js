const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");

const api = supertest(app);
const ImgUrl = require("../models/imgUrl");

// Ensure database is in same state before each test
beforeEach(async () => {
  await ImgUrl.deleteMany({});
  await ImgUrl.insertMany(helper.initialImgUrls);
});

describe("When there are initially some imgUrls saved:", () => {
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
    expect(response.body.length).toBe(helper.initialImgUrls.length);
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
    expect(response.body.length).toBe(helper.initialImgUrls.length + 1);
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
});

describe("Getting a specific imgUrl:", () => {
  test("succeeds with a valid id", async () => {
    const imgUrlsAtStart = await helper.imgUrlsInDb();
    const imgUrlToGet = imgUrlsAtStart[0];
    const result = await api
      .get(`/api/imgurls/${imgUrlToGet.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(result.body).toEqual(imgUrlToGet);
  }, 5000);

  test("fails with status code 404 if imgUrl does not exist", async () => {
    const invalidId = await helper.nonExistingId();
    await api.get(`/api/imgurls/${invalidId}`).expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const invalidId = "ksjnfksjfdnsfpaiu";
    await api.get(`/api/imgurls/${invalidId}`).expect(400);
  });
});

describe("Adding a new imgUrl:", () => {
  test("succeeds with valid data", async () => {
    const newImgUrl = {
      url: "https://test-focobcn-compressed.s3.amazonaws.com/test_string.jpg",
    };
    await api
      .post("/api/imgurls")
      .send(newImgUrl)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const imgUrlsAtEnd = await helper.imgUrlsInDb();
    expect(imgUrlsAtEnd.length).toBe(helper.initialImgUrls.length + 1);
    const contents = imgUrlsAtEnd.map((imgUrl) => imgUrl.url);
    expect(contents).toContain("https://test-focobcn-compressed.s3.amazonaws.com/test_string.jpg");
  }, 5000);

  test("fails with status code 400 if url is missing", async () => {
    const newImgUrl = {
      url: "",
    };
    await api.post("/api/imgurls").send(newImgUrl).expect(400);
  });
});

describe("Deleting an imgUrl:", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const imgUrlsAtStart = await helper.imgUrlsInDb();
    const imgUrlToDelete = imgUrlsAtStart[0];
    await api.delete(`/api/imgurls/${imgUrlToDelete.id}`).expect(204);
    const imgUrlsAtEnd = await helper.imgUrlsInDb();
    expect(imgUrlsAtEnd.length).toBe(helper.initialImgUrls.length - 1);
    const contents = imgUrlsAtEnd.map((imgUrl) => imgUrl.url);
    expect(contents).not.toContain(imgUrlToDelete.url);
  });

  test("fails with status code 404 if id is invalid", async () => {
    const invalidId = await helper.nonExistingId();
    await api.delete(`/api/imgurls/${invalidId}`).expect(404);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
