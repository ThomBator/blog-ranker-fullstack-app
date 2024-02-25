const bycrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
//Add a new user
usersRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  if (!password || !username) {
    return response
      .status(400)
      .json({ error: "Username and password are required" });
  }

  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: "Password must be 3 or more characters" });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return response
      .status(400)
      .json({ error: "Username already exists. Please choose another." });
  }

  const saltRounds = 10;
  const passwordHash = await bycrypt.hash(password, saltRounds);

  const user = new User({
    username,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
    _id: 1,
  });

  response.json(users);
});

usersRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
    _id: 1,
  });
  response.json(user);
});

module.exports = usersRouter;
