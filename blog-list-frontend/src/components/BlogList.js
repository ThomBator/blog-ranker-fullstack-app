import React from "react";
import { useQuery } from "react-query";
import blogService from "../services/blogs";
import { Link } from "react-router-dom";
import styles from "./BlogList.module.css";

const Blogs = () => {
  //remember you aren't calling the function, you're passing it
  const result = useQuery("blogs", blogService.getAll);

  if (result.isLoading) {
    return <div>loading.data</div>;
  }

  const blogs = result.data;

  console.log("Blogs", blogs);

  const byLikes = (b1, b2) => b2.likes - b1.likes;

  console.log(byLikes);
  return (
    <div>
      {blogs.sort(byLikes).map((blog) => (
        <div className={styles.listItem} key={blog.id}>
          <Link to={`/blogs/${blog.id}`}>
            {blog.title} by {blog.author}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Blogs;
