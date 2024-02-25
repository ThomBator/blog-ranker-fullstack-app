import React from "react";
import { useEffect } from "react";
import Blog from "./components/Blog";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import Users from "./components/Users";
import Notification from "./components/Notifications";
import User from "./components/User";
import { Routes, Route, Link } from "react-router-dom";
import { useUser, useInitUser, useLogout } from "./contexts/userContext";
import styles from "./App.module.css";

const App = () => {
  const user = useUser();
  const logout = useLogout();
  const initUser = useInitUser();

  const logOut = () => {
    logout();
  };

  //
  useEffect(() => {
    //grabs user from local stoarge if user is present
    initUser();
  }, []);

  return (
    <div className={styles.appContainer}>
      <div className={styles.navBackground}>
        <div className={styles.navContainer}>
          <nav className={styles.navGroup}>
            <Link
              className={`${styles.navElement} ${styles.interactiveNavElement}`}
              to="/"
            >
              Home
            </Link>
            <Link
              className={`${styles.navElement} ${styles.interactiveNavElement}`}
              to="/users"
            >
              Users
            </Link>
          </nav>
          {user && (
            <nav>
              <span className={styles.navElement}>
                {user.username} is logged in{" "}
              </span>
              <button
                className={`${styles.logoutButton} zero ttsecondaryButton`}
                type="button"
                onClick={logOut}
              >
                Logout
              </button>
            </nav>
          )}

          {!user && (
            <nav>
              <span className={styles.navElement}>
                You are currently logged out
              </span>
              <Link to="/login" className={styles.navElement}>
                <button
                  className={`${styles.logoutButton} secondaryButton`}
                  type="button"
                >
                  Login to post, vote & comment
                </button>
              </Link>
            </nav>
          )}
        </div>
      </div>
      <div className={styles.mainContainer}>
        <Notification />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs/:id" element={<Blog />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<User />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
        </Routes>
      </div>

      <br />
    </div>
  );
};

export default App;
