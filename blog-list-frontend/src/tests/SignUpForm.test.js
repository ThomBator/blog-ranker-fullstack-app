import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SignUpForm from "../components/SignUpForm";
import { UserContextProvider } from "../contexts/userContext";
import { NotificationContextProvider } from "../contexts/notificationContext";
import { MemoryRouter } from "react-router-dom";
import Notifications from "../components/Notifications";

// Replace `require` with ES6 import for mocking
import { signUp } from "../services/users";

jest.mock("../services/users", () => ({
  signUp: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter>
      <NotificationContextProvider>
        <Notifications />
        <UserContextProvider>{ui}</UserContextProvider>
      </NotificationContextProvider>
    </MemoryRouter>
  );
};

describe("<SignUpForm />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign-up form correctly", () => {
    renderWithProviders(<SignUpForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("shows an error when passwords do not match", async () => {
    renderWithProviders(<SignUpForm />);

    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/enter/i);
    const reEnterPasswordInput = screen.getByPlaceholderText(/confirm/i);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.type(reEnterPasswordInput, "password456");
    await user.click(signUpButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/passwords do not match/i);
  });

  it("shows an error when username already exists", async () => {
    signUp.mockRejectedValue(new Error("Username already exists"));

    renderWithProviders(<SignUpForm />);

    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/enter/i);
    const reEnterPasswordInput = screen.getByPlaceholderText(/confirm/i);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(usernameInput, "existinguser");
    await user.type(passwordInput, "password123");
    await user.type(reEnterPasswordInput, "password123");
    await user.click(signUpButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/user already exists/i);
  });

  it("shows success notification on successful sign-up", async () => {
    signUp.mockResolvedValue({ username: "newuser" });

    renderWithProviders(<SignUpForm />);

    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/enter/i);
    const reEnterPasswordInput = screen.getByPlaceholderText(/confirm/i);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(usernameInput, "newuser");
    await user.type(passwordInput, "password123");
    await user.type(reEnterPasswordInput, "password123");
    await user.click(signUpButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/sign up successful/i);
  });
});
