const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const helper = require("./test_helper");
const app = require("../app");
const User = require("../models/user");

const api = supertest(app);

jest.setTimeout(10000);

const login = async () => {
  const credentials = {
    username: "billrdunn",
    password: "testPassword123",
  };

  const loginResponse = await api
    .post("/api/login")
    .send(credentials)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  return loginResponse.body.token;
};

describe("When there is initially one user in db", () => {
  beforeEach(async () => {
    const item0 = helper.initialItems[0];

    const passwordHash = await bcrypt.hash("testPassword123", 10);
    const user = new User({
      username: "billrdunn",
      name: "Bill Dunn",
      passwordHash,
      items: [item0],
    });

    await user.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "testUsername",
      name: "Test Name",
      password: "test-password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "billrdunn",
      name: "Test Name",
      password: "test-password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username must be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("an item can be added to the user", async () => {
    const usersAtStart = await helper.usersInDb();
    const items1 = helper.initialItems[1];
    const user = usersAtStart[0];

    const newUser = {
      username: user.username,
      name: user.name,
      passwordHash: user.passwordHash,
      items: user.items.concat(items1),
    };

    const token = await login();

    await api
      .put(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    const userAfter = usersAtEnd.find((u) => u.id === user.id);
    expect(userAfter.items).toHaveLength(usersAtStart[0].items.length + 1);
  });
  test("adding an item to a user fails with status 401 if incorrect token given", async () => {
    const usersAtStart = await helper.usersInDb();
    const items1 = helper.initialItems[1];
    const user = usersAtStart[0];

    const newUser = {
      username: user.username,
      name: user.name,
      passwordHash: user.passwordHash,
      items: user.items.concat(items1),
    };

    await api
      .put(`/api/users/${user.id}`)
      .set("Authorization", `Bearer not-a-token`)
      .send(newUser)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    const userAfter = usersAtEnd.find((u) => u.id === user.id);
    expect(userAfter.items).toHaveLength(usersAtStart[0].items.length);
  });
});

describe("Validating creating a user:", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });
  test("if username is missing, return status 400 with appropriate error", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: "Test Name",
      password: "test-password",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    expect(response.body.error).toBe("username missing");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
  test("if name is missing, return status 400 with appropriate error", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "testUsername",
      password: "test-password",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    expect(response.body.error).toBe("name missing");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
  test("if password is missing, return status 400 with appropriate error", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "testUsername",
      name: "Test Name",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    expect(response.body.error).toBe("password missing");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
  test("if username is too short, return status 400 with appropriate error", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "blah",
      name: "Test Name",
      password: "test-password",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    expect(response.body.error).toBe("username must be at least 5 characters long");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
  test("if name is too short, return status 400 with appropriate error", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "testUsername",
      name: "eh",
      password: "test-password",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    expect(response.body.error).toBe("name must be at least 3 characters long");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
  test("if password is too short, return status 400 with appropriate error", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "testUsername",
      name: "Test Name",
      password: "testPas",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    expect(response.body.error).toBe("password must be at least 8 characters long");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
