import React from "react";
import styles from "./DesktopNav.module.css";
import { Link } from "react-router-dom";
import { useUser, useLogout } from "../contexts/userContext";

const DesktopNav = () => {
  const user = useUser();
  const logout = useLogout();

  const logOut = () => {
    logout();
  };
  return (
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
  );
};

export default DesktopNav;
