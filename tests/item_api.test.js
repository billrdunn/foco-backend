const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const Item = require("../models/item");

jest.setTimeout(10000);

// Before each test, clear the database
beforeEach(async () => {
  await Item.deleteMany({});

  // Create array of Mongoose objects
  const itemObjects = helper.initialItems.map(item => new Item(item));
  // Create array of promises
  const promiseArray = itemObjects.map(item => item.save());
  // Await all promises
  await Promise.all(promiseArray);
});

// api is a superagent object
const api = supertest(app);

describe("Returning all items", () => {
  test("the correct number of items is returned", async () => {
    const response = await api.get("/api/items");
    expect(response.body).toHaveLength(helper.initialItems.length);
  });

  test("items are returned as json", async () => {
    await api
    .get("/api/items")
    .expect(200)
    .expect("Content-Type", /application\/json/);
  });
  test("the items contain Marasmius oreades", async () => {
    const response = await api.get("/api/items");
  
    // Create an array containing the latin name of every item returned by the API
    const latinNames = response.body.map((item) => item.latin);
  
    expect(latinNames).toContain("Marasmius oreades");
  });
})


describe("GET requests to individual items", () => {
  test("a GET request with the appropriate id returns the corresponding item", async () => {
    const response = await api.get("/api/items/625fc34d5965f5afa2a08e07");
  
    expect(response.body.latin).toEqual(helper.initialItems[1].latin);
  });
  
  test("a GET request to an unknown item responds with status 404 ", async () => {
    await api.get("/api/items/525fc34d5965f5afa2a08e07").expect(404);
  });
})

afterAll(() => {
  mongoose.connection.close();
});
