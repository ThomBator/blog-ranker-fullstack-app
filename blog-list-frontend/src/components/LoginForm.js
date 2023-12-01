import React from "react";

import { useLogin } from "../contexts/userContext";
import { useField } from "../hooks/index";
import { useNotificationDispatch } from "../contexts/notificationContext";
import styles from "./LoginForm.module.css";

const LoginForm = () => {
  //doLogin takes a user object to pass to backend for authentication
  const doLogin = useLogin();
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

  return (
    <div className={styles.loginContainer}>
      <h1>Welcome to Blog Ranker</h1>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.loginPrompt}>
          <h2>Sign in</h2>
        </div>
        <div>
          <input id="username" placeholder="Username" {...username} />
        </div>
        <div>
          <input id="password" placeholder="Password" {...password} />
        </div>
        <div>
          <button id="login-button" type="submit">
            login
          </button>
        </div>
        <div className={styles.logoutPrompt}>
          <p>Don&apos;t have an account? Sign up here.</p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
