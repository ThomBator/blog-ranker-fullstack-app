import React from "react";
import userService from "../services/users";
import blogService from "../services/blogs";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import BlogLink from "./BlogLink";
import styles from "../styles/User.module.css";

const User = () => {
  const id = useParams().id;

  const { data: user } = useQuery(["users", id], () => userService.getOne(id));
  const { data: allBlogs } = useQuery(["blogs", id], () =>
    blogService.getAll()
  );

  if (!user) {
    return null;
  }

  const userBlogs = allBlogs
    ? allBlogs.filter((blog) => blog.user.id === id)
    : [];

  return (
    <div className="pageContainer">
      {user && (
        <h1 className={styles.userPageHeader}>
          {" "}
          Posts shared by {user.username}
        </h1>
      )}

      <ul className={styles.list}>
        {userBlogs &&
          userBlogs.map((blog) => (
            <li className={styles.listItem} key={blog.id}>
              <BlogLink blog={blog} />
            </li>
          ))}
      </ul>

      {userBlogs.length === 0 && <p>no blogs created yet</p>}
    </div>
  );
};

export default User;
