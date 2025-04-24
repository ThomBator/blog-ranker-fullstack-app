import React from "react";
import styles from "../styles/MobileNav.module.css";
import { Link } from "react-router-dom";
import { useUser, useLogout } from "../contexts/userContext";
import { push as Menu } from "react-burger-menu";
import hamburgerStyles from "../styles/hamburgerStyles";
import Notification from "./Notifications";
const MobileNav = () => {
  const user = useUser();
  const logout = useLogout();

  const logOut = () => {
    logout();
  };
  return (
    <div className={styles.mobileNavBackground}>
      <Menu styles={hamburgerStyles}>
        <div className={`${styles.mobileNavContainer}`}>
          <nav className={styles.navGroup}>
            <Link className={styles.navElement} to="/">
              Home
            </Link>
            <Link className={styles.navElement} to="/users">
              Users
            </Link>
            {user && (
              <Link className={styles.navElement} onClick={logOut} to="/">
                Logout
              </Link>
            )}
            {!user && (
              <>
                <Link to="/login" className={styles.navElement}>
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </Menu>
      <div className={styles.mobileNavNotification}>
        <Notification />
      </div>
    </div>
  );
};

export default MobileNav;
