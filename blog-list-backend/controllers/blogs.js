const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Middleware to extract token from request
// This function checks the request headers for a Bearer token and returns it
//Token is reformatted to remove the "Bearer " prefix
/// This token is used for authentication and authorization
// It allows us to verify the user's identity and permissions when making requests
// to protected routes, such as creating or deleting a blog post
const getTokenFrom = (request) => {
  const authorization = request.get("authorization");

  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};
//get all blogs
blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    name: 1,
    username: 1,
    _id: 1,
  });
  response.json(blogs);
});
//get specific blog
blogRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate("user")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "id username",
      },
    });

  if (!blog) {
    return response.status(404).json({ error: "Blog not found" });
  }

  response.json(blog);
});

//post new blog
blogRouter.post("/", async (request, response) => {
  const body = request.body;

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }

  const user = await User.findById(decodedToken.id);

  if (!user) {
    return response.status(404).json({ error: "user not found" });
  }

  if (body.title && body.url && body.author) {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      votes: { totalVotes: 0, users: [] },
      user: user._id,
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat({
      _id: savedBlog._id,
      votes: savedBlog.votes,
    });
    await user.save();

    response.status(201).json(savedBlog);
  } else {
    response.status(400).json({ error: "Blog post failed" });
  }
});

//post comment on blog

blogRouter.post("/:id/comments", async (request, response) => {
  const { comment, user } = request.body;

  try {
    const blog = await Blog.findById(request.params.id);

    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }

    if (!blog.comments) {
      blog.comments = [];
    }

    // Create a new comment
    const newComment = new Comment({
      comment: comment,
      user: user.id,
      blog: blog.id,
    });

    // Save the comment to the Comment collection
    const savedComment = await newComment.save();

    // Add the comment's ID to the blog's comments array
    blog.comments = blog.comments.concat(savedComment._id);

    // Save the updated blog document
    await blog.save();

    // Populate the comment with user details and send the response
    const populatedComment = await savedComment.populate("user", "username");

    response.json(populatedComment);
  } catch (error) {
    response.status(500).json({ error: "Something went wrong" });
  }
});

//delete comment from blog
blogRouter.delete("/:blogId/comments/:commentId", async (request, response) => {
  const deletedComment = await Comment.findByIdAndRemove(
    request.params.commentId
  );

  const user = await User.findById(deletedComment.user);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  //delete comment assocaition from assocaited user document
  user.comments = user.comments.filter(
    (comment) => !comment._id.equals(deletedComment._id)
  );

  await user.save();

  response.status(204).end();
});

//will be used for updating votes
blogRouter.put("/:id", async (request, response) => {
  const body = request.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    votes: body.votes,
  };

  //The "new: true" property ensures you get the updated post, not the pre-updated version returned
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  response.json(updatedBlog);
});

//Delete blog post
blogRouter.delete("/:id", async (request, response) => {
  const deletedBlog = await Blog.findByIdAndRemove(request.params.id);

  const user = await User.findById(deletedBlog.user);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  user.blogs = (user.blogs ?? []).filter(
    (blog) => !blog._id.equals(deletedBlog._id)
  );

  await user.save();

  response.status(204).end();
});

module.exports = blogRouter;
