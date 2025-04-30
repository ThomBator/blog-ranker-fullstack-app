const mongoose = require("mongoose");

//Defines schema for blog document type
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    url: { type: String, required: true },
    //My goal with the construction of the votes part of the schema is to limit the number of votes each user can make.
    //Front-end logic will ensure that users can only hold a value of 1, 0 or -1 so that users can only upvote or downvote once essentially.
    votes: {
      users: [
        {
          _id: false, // Prevent subdocument _id generation
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
          },
          vote: { type: Number, required: true, enum: [-1, 0, 1] },
        },
      ],
    },

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

//Takes off __v because it is not needed
//Converts id to a string because string ids are more commonly used by different libraries and platforms

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    if (returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
    }
    delete returnedObject.__v;
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
