import React from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp, useUser } from "../contexts/userContext";
import { useField } from "../hooks/index";
import { useNotificationDispatch } from "../contexts/notificationContext";
import { Link } from "react-router-dom";
import styles from "../styles/LoginForm.module.css";

const SignUpForm = () => {
  //doSignUp takes a user object to pass to backend for authentication
  const doSignUp = useSignUp();
  const user = useUser();
  //used to redirect the page if a user is already logged in
  const navigate = useNavigate();
  //custom hook to manage and update state for input fields
  const username = useField("text");
  const password = useField("password");
  const reEnterPassword = useField("password");
  //dispatch notifications
  const notifyWith = useNotificationDispatch();
  //useLogin customhook is async as it communicates with server
  //so the handler has to be async as well
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.value != reEnterPassword.value) {
      notifyWith("Error. Passwords do not match");
    } else {
      try {
        await doSignUp({
          username: username.value,
          password: password.value,
        });
        notifyWith("Sign Up Successful", "green");
      } catch (error) {
        notifyWith(
          "A user already exists with your inputted username, please try again",
          "red"
        );
      }
    }
  };

  if (user) {
    return navigate("/");
  }

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.loginPrompt}>
          <h2>Sign up</h2>
        </div>
        <div className="formInput">
          <label htmlFor="username">Username</label>
          <input id="username" placeholder="Username" {...username} />
        </div>
        <div className="formInput">
          <label htmlFor="password">Password</label>
          <input
            id="enterPassword"
            placeholder="Enter Password"
            {...password}
          />
        </div>
        <div className="formInput">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            placeholder="Confirm Password"
            {...reEnterPassword}
          />
        </div>
        <div>
          <button id="login-button" className="secondaryButton" type="submit">
            Sign Up
          </button>
        </div>
        <div className={styles.signUpPrompt}>
          <p>
            Already have an account? <Link to="/login">Login.</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
