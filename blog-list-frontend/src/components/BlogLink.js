import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "./BlogLink.module.css";
import { useUser } from "../contexts/userContext";

function BlogLink({ blog }) {
  const user = useUser();

  let shortURL = "";

  try {
    const fullURL = new URL(blog.url);
    shortURL = fullURL.hostname.replace(/^www\./, "");
  } catch {
    shortURL = blog.url;
  }
  return (
    <div className={styles.blogLinkContainer}>
      <div className={styles.linkInfo}>
        <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        <p>({shortURL})</p>
      </div>

      <div className={styles.voteInfo}>
        <p>Votes: {blog.likes}</p>
        <button>Upvote</button>
        <button>Downvote</button>
      </div>
      <div className={styles.userInfo}>
        <p>posted by {blog.user.username}</p>
        {user && user.id === blog.user.id && <Link to="#">delete</Link>}
      </div>
    </div>
  );
}

BlogLink.propTypes = {
  blog: {
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    comments: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
  },
};

export default BlogLink;
