import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, act } from "@testing-library/react";
import BlogForm from "../components/BlogForm";

test("form calls handleAdd with correct data when submitted", async () => {
  const handleAdd = jest.fn();
  const { getByLabelText, getByText } = render(
    <BlogForm handleAdd={handleAdd} />
  );

  const titleInput = getByLabelText("title:");
  const authorInput = getByLabelText("author:");
  const urlInput = getByLabelText("url:");
  const addButton = getByText("add");

  await act(async () => {
    fireEvent.change(titleInput, { target: { value: "example title" } });
    fireEvent.change(authorInput, { target: { value: "example author" } });
    fireEvent.change(urlInput, { target: { value: "example.com" } });
    fireEvent.click(addButton);
  });

  expect(handleAdd).toHaveBeenCalledWith({
    title: "example title",
    author: "example author",
    url: "example.com",
  });
});
