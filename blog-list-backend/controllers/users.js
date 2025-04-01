const bycrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
//Add a new user
usersRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  console.log("username in signup post request: ", username);
  console.log("password in signup post request: ", password);
  console.log("request.body in signup post request: ", request.body);

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

  //saltRounds ensures that the password is hashed securely
  //The higher the number, the more secure, but also more time-consuming
  const saltRounds = 10;
  const passwordHash = await bycrypt.hash(password, saltRounds);

  const user = new User({
    username,
    passwordHash,
  });

  const savedUser = await user.save();

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  //signing the token with the user's username and id
  //The token is signed with the secret key stored in the environment variable SECRET
  //The token expires in 1 hour
  //The token is used to authenticate the user in subsequent requests
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60,
  });

  response.status(200).send({
    token,
    username: savedUser.username,
    name: savedUser.name,
    id: savedUser.id,
  });
});

//returns a list of all users
usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
    _id: 1,
  });

  response.json(users);
});

//returns a specific user
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
