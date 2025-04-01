const mongoose = require("mongoose");


// This is a Mongoose schema for comments on blog posts
// It defines the structure of the comment document in the MongoDB database
// The schema includes fields for the comment text, user ID, and blog post ID
// It also includes timestamps for when the comment was created and last updated
// and a method to transform the document when converting it to JSON
const commentSchema = new mongoose.Schema(
  {
    comment: { type: String, maxLength: 255, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
  },
  { timestamps: true }
);

commentSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    if (returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
    }
    delete returnedObject.__v;
    delete returnedObject.__v;
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
