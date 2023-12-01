const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blog")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("blogs have a unique id", async () => {
  const response = await api.get("/api/blog");
  const posts = response.body;
  expect(posts[0].id).toBeDefined();
});

test("can add a new blog with a post request", async () => {
  const newBlog = {
    title: "TDD harms architecture: Part 2",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 100,
  };

  await api
    .post("/api/blog")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);
  const response = await api.get("/api/blog");
  const newList = response.body;
  expect(newList).toHaveLength(helper.initialBlogs.length + 1);
});

//Should look into breaking this up at some point
//Unfortunately describe block does not allow async so this was easiest way to test both elements of delete
test("can delete a blog post", async () => {
  const getResponseBefore = await api.get("/api/blog");
  const initialBlogs = getResponseBefore.body;
  const blogToDelete = initialBlogs[0];
  await api.delete(`/api/blog/${blogToDelete.id}`);
  const getResponseAfter = await api.get("/api/blog");
  const blogsAfterDelete = getResponseAfter.body;
  expect(blogsAfterDelete).toHaveLength(initialBlogs.length - 1);
  const titles = blogsAfterDelete.map((blog) => blog.title);
  expect(titles).not.toContain(blogToDelete.title);
});

test("can update likes in blog post", async () => {
  const getResponseBefore = await api.get("/api/blog");
  const initialBlogs = getResponseBefore.body;
  const blogToUpdate = initialBlogs[0];
  blogToUpdate.likes += 1;
  await api.put(`/api/blog/${blogToUpdate.id}`).send(blogToUpdate);
  const getResponseAfter = await api.get("/api/blog");
  const blogAfterUpdate = getResponseAfter.body[0];
  console.log("LIKES BEFORE UPDATE ", blogToUpdate.likes);
  console.log("LIKES AFTER UPDATE ", blogAfterUpdate.likes);
  expect(blogAfterUpdate.likes).toEqual(blogToUpdate.likes);
});

afterAll(async () => {
  await mongoose.connection.close();
});
