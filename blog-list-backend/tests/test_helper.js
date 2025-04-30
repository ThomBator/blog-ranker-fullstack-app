const Blog = require("../models/blog");
const User = require("../models/user"); // Import User model
const jwt = require("jsonwebtoken");

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    votes: { totalVotes: 7, users: [] }, // Initialize users as empty array
    comments: [], // Initialize comments array
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    votes: { totalVotes: 5, users: [] }, // Initialize users as empty array
    comments: [], // Initialize comments array
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    votes: { totalVotes: 0, users: [] }, // Initialize users as empty array
    comments: [], // Initialize comments array
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html",
    votes: { totalVotes: 0, users: [] }, // Initialize users as empty array
    comments: [], // Initialize comments array
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    votes: { totalVotes: 0, users: [] }, // Initialize users as empty array
    comments: [], // Initialize comments array
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    votes: { totalVotes: 0, users: [] }, // Initialize users as empty array
    comments: [], // Initialize comments array
  },
];

// Helper to get users from DB
const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const generateToken = (user) => {
  const userForToken = {
    username: user.username,
    id: user._id, // Use _id from the user object
  };

  // Ensure process.env.SECRET is defined
  if (!process.env.SECRET) {
    throw new Error("SECRET environment variable is not defined");
  }

  return jwt.sign(userForToken, process.env.SECRET);
};

const nonExistingId = async () => {
  const blog = new Blog({
    title: "temp",
    author: "temp",
    url: "http://temp.com",
  });
  await blog.save();
  await blog.deleteOne(); // Remove the blog to ensure the ID no longer exists

  // Add a small delay to ensure the deletion is fully propagated
  await new Promise((resolve) => setTimeout(resolve, 500));

  return blog._id.toString();
};

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb, // Export usersInDb
  generateToken,
  nonExistingId,
};
