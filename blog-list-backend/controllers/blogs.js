const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

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
  const blog = await Blog.findById(request.params.id).populate("user");

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

  if (body.title && body.url && body.author) {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      votes: 0,
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
  const comment = request.body;

  const blog = await Blog.findById(request.params.id);

  console.log(blog);

  blog.comments = blog.comments.concat(comment);

  await blog.save();

  response.json(blog);
});

blogRouter.put("/:id", async (request, response) => {
  const body = request.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    votes: body.votes,
  };

  console.log("BLOGS FROM PUT ROUTE", request);
  //new: true ensures you get the updated post, not the pre-updated version returned
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  response.json(updatedBlog);
});

blogRouter.delete("/:id", async (request, response) => {
  const deletedBlog = await Blog.findByIdAndRemove(request.params.id);
  console.log(deletedBlog);

  const user = await User.findById(deletedBlog.user);

  console.log("User ", user);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  user.blogs = user.blogs.filter((blog) => !blog._id.equals(deletedBlog._id));

  await user.save();

  response.status(204).end();
});

module.exports = blogRouter;
