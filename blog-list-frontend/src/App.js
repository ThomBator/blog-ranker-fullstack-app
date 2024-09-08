import React from "react";
import { useEffect } from "react";
import Blog from "./components/Blog";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import Users from "./components/Users";
import DesktopNav from "./components/DesktopNav";
import MobileNav from "./components/MobileNav";
import Notification from "./components/Notifications";
import User from "./components/User";
import { Routes, Route } from "react-router-dom";
import { useInitUser } from "./contexts/userContext";
import styles from "./styles/App.module.css";

const App = () => {
  const initUser = useInitUser();

  //
  useEffect(() => {
    //grabs user from local stoarge if user is present
    initUser();
  }, []);

  return (
    <div className={styles.appContainer}>
      <MobileNav />
      <DesktopNav />
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
  );
};

export default App;
