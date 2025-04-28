import React, { useRef } from "react";
import { useQuery } from "react-query";
import blogService from "../services/blogs";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";
import BlogForm from "./BlogForm";
import BlogLink from "./BlogLink";
import Toggleable from "./Toggleable";
import { useUser } from "../contexts/userContext";

const Home = () => {
  const user = useUser();

  //remember you aren't calling the function, you're passing it
  const result = useQuery("blogs", blogService.getAll);
  const blogFormRef = useRef();

  if (result.isLoading) {
    return <div>loading.data</div>;
  }

  const blogs = result.data;

  const byLikes = (b1, b2) => b2.likes - b1.likes;

  return (
    <div className="pageContainer">
      <header className={styles.homeHeader}>
        <div className={styles.headerText}>
          <h1>Story Ranker</h1>
          <p className={styles.subheading}>
            Share your favourite blogs and sites from around the web. Vote on
            posts you love to help them climb the rankings!
          </p>
          {!user && (
            <p className={styles.loginPrompt}>
              (<Link to="/login">Log in</Link> to post, vote and comment.)
            </p>
          )}
        </div>
        <div className={styles.headerImgContainer}>
          <img
            alt="A cartoon image of anthropomorphic books standing on a podium"
            src="storyRankerHeroV4.webp"
          />
        </div>
      </header>

      {user && (
        <div>
          <Toggleable buttonLabel="Share a post" ref={blogFormRef}>
            <BlogForm />
          </Toggleable>
        </div>
      )}

      <main>
        {blogs &&
          blogs.sort(byLikes).map((blog) => (
            <div className={styles.listItem} key={blog.id}>
              <BlogLink blog={blog} />
            </div>
          ))}
      </main>
    </div>
  );
};

export default Home;
