import React from "react";
import styles from "../styles/DesktopNav.module.css";
import { Link } from "react-router-dom";
import { useUser, useLogout } from "../contexts/userContext";

const DesktopNav = () => {
  const user = useUser();
  const logout = useLogout();

  const logOut = () => {
    logout();
  };
  return (
    <div className={styles.desktopNavBackground}>
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
              className={`${styles.loginLogoutButton} secondaryButton`}
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
                className={`${styles.loginLogoutButton} secondaryButton`}
                type="button"
              >
                Login
              </button>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
};

export default DesktopNav;
