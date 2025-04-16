import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import BlogLink from "../components/BlogLink";

import blogService from "../services/blogs";
import * as userContext from "../contexts/userContext";
import * as notificationContext from "../contexts/notificationContext";

// Provide QueryClient and Router context
const queryClient = new QueryClient();
function Wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

// Mock blogService (only update and remove needed for BlogLink)
jest.mock("../services/blogs", () => ({
  __esModule: true,
  default: {
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("../contexts/userContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("../contexts/notificationContext", () => ({
  useNotificationDispatch: jest.fn(),
}));

// Mock data
const mockUser = {
  token: "mock-token",
  username: "Thomas",
  id: "1",
};

const mockBlog = {
  id: "67b3897181f0ca266c366ac8",
  title: "Test",
  author: "test",
  url: "https://www.test.com/",
  comments: [],
  votes: {
    users: [
      { id: "1", vote: 1 },
      { id: "2", vote: -1 },
    ],
  },
  user: { username: "Thomas", id: "1" },
  createdAt: "2025-02-17T19:09:37.835Z",
  updatedAt: "2025-03-29T23:18:15.966Z",
};

beforeEach(() => {
  jest.clearAllMocks();

  userContext.useUser.mockReturnValue(mockUser);
  notificationContext.useNotificationDispatch.mockReturnValue(jest.fn());

  blogService.update.mockResolvedValue({});
  blogService.remove.mockResolvedValue({});
});

describe("BlogLink component", () => {
  it("renders blog title and domain", () => {
    render(<BlogLink blog={mockBlog} />, { wrapper: Wrapper });

    expect(screen.getByRole("link", { name: "Test" })).toBeInTheDocument();
    expect(screen.getByText("(test.com)")).toBeInTheDocument();
  });

  it("shows vote buttons when logged in", () => {
    render(<BlogLink blog={mockBlog} />, { wrapper: Wrapper });

    expect(screen.getByRole("button", { name: "Upvote" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Downvote" })
    ).toBeInTheDocument();
  });

  it("disables upvote if user already voted up", async () => {
    render(<BlogLink blog={mockBlog} />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Upvote" })).toBeDisabled();
    });
  });

  it("does not show delete button for other users", () => {
    const otherUserBlog = {
      ...mockBlog,
      user: { id: "999", username: "Other" },
    };
    render(<BlogLink blog={otherUserBlog} />, { wrapper: Wrapper });

    expect(screen.queryByRole("button", { name: /delete blog/i })).toBeNull();
  });

  it("shows delete button for blog owner", () => {
    render(<BlogLink blog={mockBlog} />, { wrapper: Wrapper });

    expect(
      screen.getByRole("button", { name: /delete blog/i })
    ).toBeInTheDocument();
  });

  it("shows login prompt if user is not logged in", () => {
    userContext.useUser.mockReturnValueOnce(null);
    render(<BlogLink blog={mockBlog} />, { wrapper: Wrapper });

    const logInLink = screen.getByRole("link", { name: /log in/i });
    expect(logInLink).toBeInTheDocument();
    expect(screen.getByText(/to vote on posts/i)).toBeInTheDocument();
  });

  it("calls vote mutation when voting", async () => {
    render(<BlogLink blog={mockBlog} />, { wrapper: Wrapper });

    const downvoteBtn = screen.getByRole("button", { name: /Downvote/i });
    userEvent.click(downvoteBtn);

    await waitFor(() => {
      expect(blogService.update).toHaveBeenCalled();
    });
  });

  it("calls delete mutation when delete button clicked", async () => {
    render(<BlogLink blog={mockBlog} />, { wrapper: Wrapper });

    const deleteBtn = screen.getByRole("button", { name: /delete blog/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(blogService.remove).toHaveBeenCalledWith(mockBlog.id);
    });
  });
});
