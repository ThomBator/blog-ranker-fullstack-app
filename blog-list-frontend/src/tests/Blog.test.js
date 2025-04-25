// src/tests/Blog.test.js
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom"; // <-- import so .toBeInTheDocument() etc. work
import PropTypes from "prop-types";

import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

// ----- Mock services and contexts
import blogService from "../services/blogs";
import * as userContext from "../contexts/userContext";
import * as notificationContext from "../contexts/notificationContext";

// Provide a QueryClient and Router wrapper for rendering
const queryClient = new QueryClient();
function Wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

// ----- Our Blog component
import Blog from "../components/Blog";

// ----- blogService is a default export with these methods
// We'll define them in the manual mock below, or here in jest.mock:
jest.mock("../services/blogs", () => ({
  __esModule: true,
  default: {
    getOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addComment: jest.fn(),
    removeComment: jest.fn(),
  },
}));

// Mock userContext usage
jest.mock("../contexts/userContext", () => ({
  useUser: jest.fn(),
}));

// Mock notificationContext usage
jest.mock("../contexts/notificationContext", () => ({
  useNotificationValue: jest.fn(),
  useNotificationDispatch: jest.fn(),
}));

// ----- Sample Data
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

const mockUser = {
  token: "mock-token",
  username: "Thomas",
  id: "1",
};

// ----- Setup / Teardown
beforeEach(() => {
  jest.clearAllMocks();

  // Mock service calls
  blogService.getOne.mockResolvedValue(mockBlog);
  blogService.addComment.mockResolvedValue({});
  blogService.remove.mockResolvedValue({});
  blogService.update.mockResolvedValue({});
  blogService.removeComment.mockResolvedValue({});

  // Mock contexts
  userContext.useUser.mockReturnValue(mockUser);
  notificationContext.useNotificationValue.mockReturnValue(null);
  notificationContext.useNotificationDispatch.mockReturnValue(jest.fn());
});

describe("Blog component", () => {
  it("renders blog title and author", async () => {
    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    // The link containing 'Test'
    // This avoids the multiple element problem
    const titleLink = await screen.findByRole("link", { name: "Test" });
    expect(titleLink).toBeInTheDocument();

    // Check that "Posted on" text is present
    expect(screen.getByText(/Posted on:/i)).toBeInTheDocument();
  });

  it("shows upvote and downvote buttons for logged-in user", async () => {
    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    // They might not appear immediately if there's loading,
    // but let's assume the fetch is quick
    // If needed: await screen.findByRole('button', { name: /Upvote/i });
    const upvote = screen.getByRole("button", { name: /Upvote/i });
    const downvote = screen.getByRole("button", { name: /Downvote/i });

    expect(upvote).toBeInTheDocument();
    expect(downvote).toBeInTheDocument();
  });

  it("disables upvote button if user already voted up", async () => {
    // By default, user '1' has vote=1, so the upvote should be disabled
    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    const upvoteBtn = await screen.findByRole("button", { name: /Upvote/i });
    expect(upvoteBtn).toBeDisabled();
  });

  it("disables downvote button if user already voted down", async () => {
    const updatedBlog = {
      ...mockBlog,
      votes: {
        users: [
          { id: "1", vote: -1 },
          { id: "2", vote: 1 },
        ],
      },
    };

    blogService.getOne.mockResolvedValue(updatedBlog);

    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    const upvoteButton = await screen.findByRole("button", { name: /Upvote/i });
    const downvoteButton = screen.getByRole("button", { name: /Downvote/i });

    // Use waitFor in case there's a state transition before final button state
    await waitFor(() => {
      expect(upvoteButton).not.toBeDisabled();
      expect(downvoteButton).toBeDisabled();
    });
  });

  it("does not disable any buttons if user has not voted", async () => {
    const updatedBlog = {
      ...mockBlog,
      votes: {
        users: [
          { id: "1", vote: 0 },
          { id: "2", vote: 1 },
        ],
      },
    };

    blogService.getOne.mockResolvedValue(updatedBlog);

    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    const upvoteButton = await screen.findByRole("button", { name: /Upvote/i });
    const downvoteButton = await screen.findByRole("button", {
      name: /Downvote/i,
    });

    await waitFor(() => {
      expect(upvoteButton.disabled).toBe(false);
      expect(downvoteButton.disabled).toBe(false);
    });
  });

  it("adds a comment when form is submitted", async () => {
    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    const textarea = screen.getByRole("textbox");
    const addCommentButton = screen.getByRole("button", {
      name: /Add Comment/i,
    });

    await userEvent.type(textarea, "Great blog post!");
    fireEvent.submit(addCommentButton);

    await waitFor(() => {
      expect(blogService.addComment).toHaveBeenCalledWith(
        mockBlog.id,
        "Great blog post!",
        mockUser
      );
    });
  });

  it("shows 'Log in to vote' prompt if user is not logged in", async () => {
    // Overwrite user mock so there's no user
    userContext.useUser.mockReturnValue(null);

    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    // Wait for the fetch to finish
    await waitFor(() => {
      expect(blogService.getOne).toHaveBeenCalled();
    });

    // 1) Grab the element by class name:
    const loginPromptEl = document.querySelector(".loginPrompt");
    // Or, if you have a data-testid, e.g. data-testid="loginPrompt", you could do:
    // const loginPromptEl = screen.getByTestId('loginPrompt');

    // 2) Make sure it's there:
    expect(loginPromptEl).toBeInTheDocument();

    // 3) Check that it has the text we expect:
    expect(loginPromptEl).toHaveTextContent("(Log in to vote and comment!)");

    // Also optionally check that the link is present:
    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
  });

  it("allows user to delete blog post they created", async () => {
    const updatedBlog = {
      ...mockBlog,
      user: { username: "Thomas", id: "1" }, // same as mockUser
    };

    blogService.getOne.mockResolvedValueOnce(updatedBlog);
    blogService.remove.mockResolvedValueOnce({});

    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    const deleteButton = await screen.findByRole("button", {
      name: /delete blog/i,
    });
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(blogService.remove).toHaveBeenCalledWith(updatedBlog.id);
      expect(
        screen.getByText(/This Blog post has been deleted successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("does not show delete blog button for other users", async () => {
    const updatedBlog = {
      ...mockBlog,
      user: { username: "OtherUser", id: "999" },
    };

    blogService.getOne.mockResolvedValueOnce(updatedBlog);

    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /delete blog/i })).toBeNull();
    });
  });

  it("does not show delete blog button for other users", async () => {
    const updatedBlog = {
      ...mockBlog,
      user: { username: "OtherUser", id: "999" },
    };

    blogService.getOne.mockResolvedValueOnce(updatedBlog);

    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /delete blog/i })).toBeNull();
    });
  });

  it("does not show delete comment button for other users' comments", async () => {
    const updatedBlog = {
      ...mockBlog,
      comments: [
        {
          id: "xyz789",
          comment: "Another comment",
          createdAt: "2025-02-17T19:09:37.835Z",
          user: { username: "OtherUser", id: "999" },
        },
      ],
    };

    blogService.getOne.mockResolvedValueOnce(updatedBlog);

    await act(async () => {
      render(<Blog />, { wrapper: Wrapper });
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /delete comment/i })
      ).toBeNull();
    });
  });
});
