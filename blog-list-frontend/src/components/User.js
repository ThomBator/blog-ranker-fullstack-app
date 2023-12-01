import React from "react";
import userService from "../services/users";
import blogService from "../services/blogs";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
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
    <div>
      {user && <h2> {user.name}</h2>}

      <h3>added blogs</h3>
      <ul>
        {userBlogs &&
          userBlogs.map((blog) => <li key={blog.id}>{blog.title}</li>)}
      </ul>

      {userBlogs.length === 0 && <p>no blogs created yet</p>}
    </div>
  );
};

export default User;
