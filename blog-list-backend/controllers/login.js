const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  //request body is an object with username and password
  const { username, password } = request.body;

  //Mongoose method to find a user with a matching name in your Mongo db
  const user = await User.findOne({ username });
  //Boolean will return true if the hashed input password matches the users existing passwordHash
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: "invalid username or password" });
  }

  //If user and password are valid we create a new user object to pass to the token
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  //The token is then created and sent as a response
  //SECRET can be any string in your ENV file
 //Increment expected by expiresIn is seconds
  
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60,
  });

  response
    .status(200)
    .send({ token, username: user.username, name: user.name, id: user.id });
});

module.exports = loginRouter;
