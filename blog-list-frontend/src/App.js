import React from "react";
import { useEffect, useRef } from "react";
import Blog from "./components/Blog";
import Blogs from "./components/BlogList";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Users from "./components/Users";
import Notification from "./components/Notifications";
import Toggleable from "./components/Toggleable";
import User from "./components/User";
import { Routes, Route, Link } from "react-router-dom";
import { useUser, useInitUser, useLogout } from "./contexts/userContext";
import styles from "./App.module.css";

const App = () => {
  const user = useUser();
  const logout = useLogout();
  const initUser = useInitUser();

  const blogFormRef = useRef();

  const logOut = () => {
    logout();
  };

  //
  useEffect(() => {
    //grabs user from local stoarge if user is present
    initUser();
  }, []);

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className={styles.appContainer}>
      <div className={styles.navBackground}>
        <div className={styles.navContainer}>
          <nav>
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
          <nav>
            <span className={styles.navElement}>
              {user.name} is logged in{" "}
              <button
                className={`${styles.logoutButton} secondaryButton`}
                type="button"
                onClick={logOut}
              >
                Logout
              </button>
            </span>
          </nav>
        </div>
      </div>
      <div className={styles.mainContainer}>
        <header>
          <h1>Blog Ranker</h1>
          <p className={`subheading`}>
            The perfect place to share your favourite blogs from around the web.
            Blogs with the most likes get top ranking!
          </p>
        </header>

        <Notification />
        <div>
          <Toggleable buttonLabel="Share a new blog" ref={blogFormRef}>
            <BlogForm />
          </Toggleable>
        </div>

        <Routes>
          <Route path="/" element={<Blogs />} />
          <Route path="/blogs/:id" element={<Blog />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<User />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </div>

      <br />
    </div>
  );
};

export default App;
