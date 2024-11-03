import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogin, useUser } from "../contexts/userContext";
import { useField } from "../hooks/index";
import { useNotificationDispatch } from "../contexts/notificationContext";
import { Link } from "react-router-dom";
import styles from "../styles/LoginForm.module.css";

const LoginForm = () => {
  //doLogin takes a user object to pass to backend for authentication
  const doLogin = useLogin();
  const user = useUser();
  //used to redirect the page if a user is already logged in
  const navigate = useNavigate();
  //custom hook to manage and update state for input fields
  const username = useField("text");
  const password = useField("password");
  //dispatch notifications
  const notifyWith = useNotificationDispatch();
  //useLogin customhook is async as it communicates with server
  //so the handler has to be async as well
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await doLogin({
        username: username.value,
        password: password.value,
      });
      notifyWith("Login Successful");
    } catch (error) {
      notifyWith("Error. Invalid credentials");
    }
  };

  if (user) {
    return navigate("/");
  }

  return (
    <div className={styles.loginContainer}>
      <h1>Welcome to Story Ranker</h1>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.loginPrompt}>
          <h2>Sign in</h2>
        </div>
        <div>
          <input
            id="username"
            placeholder="Username"
            {...username}
            autoComplete="username"
          />
        </div>
        <div>
          <input
            id="password"
            placeholder="Password"
            {...password}
            autoComplete="current-password"
          />
        </div>
        <div>
          <button id="login-button" className="secondaryButton" type="submit">
            login
          </button>
        </div>
        <div className={styles.signUpPrompt}>
          <p>
            Don&apos;t have an account? <Link to="/signup">Sign up here.</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
