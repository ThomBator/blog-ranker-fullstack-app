const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe("when there are initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blog")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all initial blogs are returned", async () => {
    const response = await api.get("/api/blog");
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test("blogs have a unique identifier property named id", async () => {
    const response = await api.get("/api/blog");
    const blogs = response.body;
    blogs.forEach((blog) => {
      expect(blog.id).toBeDefined();
      expect(blog._id).toBeUndefined();
    });
  });
});

describe("viewing a specific blog", () => {
  test("succeeds with a valid id", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blog/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultBlog.body).toEqual(JSON.parse(JSON.stringify(blogToView)));
  });

  test("fails with statuscode 404 if blog does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();

    // Log the ID and query result for debugging
    console.log("Testing with non-existing ID:", validNonexistingId);
    const blogInDb = await Blog.findById(validNonexistingId);
    console.log("Query result for non-existing ID:", blogInDb);

    // Ensure the blog is truly deleted before querying
    expect(blogInDb).toBeNull();

    await api.get(`/api/blog/${validNonexistingId}`).expect(404);
  });

  test("fails with statuscode 400 if id is invalid", async () => {
    const invalidId = "12345";

    await api.get(`/api/blog/${invalidId}`).expect(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
