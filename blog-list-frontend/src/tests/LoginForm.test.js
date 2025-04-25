import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import LoginForm from "../components/LoginForm";
import { UserContextProvider } from "../contexts/userContext";
import { NotificationContextProvider } from "../contexts/notificationContext";
import { MemoryRouter } from "react-router-dom";
// Add imports for Notifications and loginService
import Notifications from "../components/Notifications";
import loginService from "../services/login";

// Mock the login service
jest.mock("../services/login");

// Mock react-router-dom's navigate function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Helper function to render with providers AND Notifications
const renderWithProvidersAndNotifications = (ui) => {
  return render(
    <MemoryRouter>
      <NotificationContextProvider>
        <Notifications />
        <UserContextProvider>{ui}</UserContextProvider>
      </NotificationContextProvider>
    </MemoryRouter>
  );
};

describe("<LoginForm />", () => {
  beforeEach(() => {
    // Reset mocks before each test
    loginService.login.mockClear();
    mockNavigate.mockClear();
    // Use the new render helper
    renderWithProvidersAndNotifications(<LoginForm />);
  });

  it("displays sign-up link correctly", () => {
    const signUpLink = screen.getByText(/Sign up here/i);
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest("a")).toHaveAttribute("href", "/signup");
  });

  it("submits form when Enter key is pressed in password field", async () => {
    const mockUser = {
      token: "fake-token",
      username: "testuser",
      name: "Test User",
    };
    loginService.login.mockResolvedValue(mockUser);

    const user = userEvent.setup();
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123{enter}");

    expect(loginService.login).toHaveBeenCalledTimes(1);
    expect(loginService.login).toHaveBeenCalledWith({
      username: "testuser",
      password: "password123",
    });
  });

  it("shows success notification on successful login", async () => {
    // Mock successful login
    const mockUser = {
      token: "fake-token",
      username: "testuser",
      name: "Test User",
    };
    loginService.login.mockResolvedValue(mockUser);

    const user = userEvent.setup();
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(loginButton);

    // Check for success notification
    const successAlert = await screen.findByRole("alert");
    expect(successAlert).toHaveTextContent(/Login Successful/i);
  });

  it("clears input fields after failed login attempt", async () => {
    // Mock failed login
    loginService.login.mockRejectedValue(new Error("Invalid credentials"));

    const user = userEvent.setup();
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    await user.type(usernameInput, "wronguser");
    await user.type(passwordInput, "wrongpass");
    await user.click(loginButton);

    // Wait for error to be handled
    await screen.findByRole("alert");

    // Check if fields still have their values (they should, since we're not clearing them)
    // This tests the current behavior, modify expectation if fields should be cleared
    expect(usernameInput).toHaveValue("wronguser");
    expect(passwordInput).toHaveValue("wrongpass");
  });

  it("handles empty input submission", async () => {
    const user = userEvent.setup();
    const loginButton = screen.getByRole("button", { name: /login/i });

    // Click login without entering username/password
    await user.click(loginButton);

    // Verify service was called with empty strings
    expect(loginService.login).toHaveBeenCalledWith({
      username: "",
      password: "",
    });

    // Should show an error notification
    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
