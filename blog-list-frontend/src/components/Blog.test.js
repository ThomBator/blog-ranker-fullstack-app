import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";
import blogService from "../services/blogs";

jest.mock("../services/blogs");

// Initialize your variables
let blog;
let user;

beforeEach(() => {
  // Reset or assign your variables here
  blog = {
    title: "example title",
    author: "example author",
    url: "example.com",
    likes: 1,
  };

  user = {
    name: "Tony",
  };
});

afterEach(() => {
  // Here you can clear or reset your variables if needed
  blog = null;
  user = null;
});

test("renders blog title and author, but not url or number of likes", () => {
  render(<Blog blog={blog} user={user} />);

  const element = screen.getByText("example author", { exact: false });

  expect(element).toHaveTextContent("example author");
  expect(element).toHaveTextContent("example title");
  expect(element).not.toHaveTextContent("example.com");
});

test("checks that url and likes are shown when show button is clicked", async () => {
  render(<Blog blog={blog} user={user} />);

  const button = screen.getByText("show");
  await userEvent.click(button);
  const element = screen.getByText("example author", { exact: false });
  expect(element).toHaveTextContent("example.com");
  expect(element).toHaveTextContent("1");
});

test("check that the like button event handler is called for every click", async () => {
  render(<Blog blog={blog} user={user} />);
  blogService.update = jest.fn();
  const button = screen.getByText("show");
  await userEvent.click(button);
  const likeButton = screen.getByText("like");
  await userEvent.click(likeButton);
  await userEvent.click(likeButton);

  const totalLikes = blog.likes + 2;

  expect(blogService.update.mock.calls).toHaveLength(2);
  expect(screen.getByText(totalLikes, { exact: false })).toBeInTheDocument();
});
