import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import BlogForm from "../components/BlogForm";
import { NotificationContextProvider } from "../contexts/notificationContext";
import { UserContextProvider } from "../contexts/userContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { act } from "react-dom/test-utils";
import { create as mockCreate } from "../services/blogs";

jest.mock("../services/blogs", () => ({
  create: jest.fn(),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationContextProvider>
        <UserContextProvider>{ui}</UserContextProvider>
      </NotificationContextProvider>
    </QueryClientProvider>
  );
};

describe("<BlogForm />", () => {
  it("renders the form correctly", () => {
    renderWithProviders(<BlogForm />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("handles user input correctly", async () => {
    renderWithProviders(<BlogForm />);

    const titleInput = screen.getByLabelText(/title/i);
    const authorInput = screen.getByLabelText(/author/i);
    const urlInput = screen.getByLabelText(/url/i);

    await userEvent.type(titleInput, "Test Blog Title");
    await userEvent.type(authorInput, "Test Author");
    await userEvent.type(urlInput, "http://testurl.com");

    expect(titleInput).toHaveValue("Test Blog Title");
    expect(authorInput).toHaveValue("Test Author");
    expect(urlInput).toHaveValue("http://testurl.com");
  });

  it("submits the form and calls the mutation", async () => {
    renderWithProviders(<BlogForm />);

    const titleInput = screen.getByLabelText(/title/i);
    const authorInput = screen.getByLabelText(/author/i);
    const urlInput = screen.getByLabelText(/url/i);
    const submitButton = screen.getByRole("button", { name: /add/i });

    await act(async () => {
      await userEvent.type(titleInput, "Test Blog Title");
      await userEvent.type(authorInput, "Test Author");
      await userEvent.type(urlInput, "http://testurl.com");
      fireEvent.click(submitButton);
    });

    expect(mockCreate).toHaveBeenCalledWith(
      {
        title: "Test Blog Title",
        author: "Test Author",
        url: "http://testurl.com",
      },
      null
    );
  });
});
