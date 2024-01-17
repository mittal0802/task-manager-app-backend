const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

// this will run before each test case to clear the database
beforeEach(setupDatabase);

// afterEach(() => {
//   console.log("afterEach");
// });
test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "keshav",
      email: "keshav@gmail.com",
      password: "MyPass777!",
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "keshav",
      email: "keshav@gmail.com",
    },
    token: user.tokens[0].token,
  });

  // Assert that the password is not stored as plain text in the database
  expect(user.password).not.toBe("MyPass777!");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Assert that the database was changed correctly
  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login non existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "testnon@gmail.com",
      password: "testnon",
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // setting header
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // setting header
    .send()
    .expect(200);

  // Assert that the database was changed correctly
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // setting header
    .attach("avatar", "tests/fixtures/01.png")
    .expect(200);

  // Assert that the database was changed correctly
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

// test("Should not upload other than image", async () => {
//   await request(app)
//     .post("/users/me/avatar")
//     .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // setting header
//     .attach("avatar", "tests/fixtures/rent.pdf")
//     .expect(400)
//     .timeout(20000);
// });

test("Should update valid user fields", async () => {
  const name = "keshav";
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // setting header
    .send({
      name,
    })
    .expect(200);

  // Assert that the database was changed correctly
  const user = await User.findById(userOneId);
  expect(user.name).toEqual(name);
});

test("Should not update invalid user fields", async () => {
  const location = "keshav";
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // setting header
    .send({
      location,
    })
    .expect(400);
});
