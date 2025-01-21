const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },

  passwordHash: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

userSchema.plugin(uniqueValidator);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    //added this check due to an error I was getting on a nested populate call in /controllers/blogs.js
    //It seems that somehow the nested populate was returning comment users that already had _id transformed to id, then trying to transform it again and throwing an error
    //At least that is by best guess
    if (returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
    }
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
