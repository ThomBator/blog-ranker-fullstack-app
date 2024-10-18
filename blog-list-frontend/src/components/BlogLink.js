import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "../styles/BlogLink.module.css";
import { useUser } from "../contexts/userContext";
import blogService from "../services/blogs";
import { useMutation, useQueryClient } from "react-query";
import { useNotificationDispatch } from "../contexts/notificationContext";

const BlogLink = ({ blog }) => {
  console.log("Blog in BlogLink: ", blog);
  const user = useUser();
  const queryClient = useQueryClient();
  const notifyWith = useNotificationDispatch();

  const shortURL = (() => {
    try {
      const fullURL = new URL(blog.url);
      return fullURL.hostname.replace(/^www\./, "");
    } catch {
      return blog.url;
    }
  })();

  const removeBlogMutation = useMutation((id) => blogService.remove(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]);
      notifyWith("Blog successfully deleted");
    },
    onError: (error) => {
      notifyWith("Error deleting blog");
      console.error("Blog Deletion Error:", error);
    },
  });

  const handleDelete = () => {
    removeBlogMutation.mutate(blog.id);
  };

  return (
    <div className={styles.blogLinkContainer}>
      <div className={styles.linkInfo}>
        <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        <p>({shortURL})</p>
      </div>

      <div className={styles.userInfo}>
        <p>Posted by {blog.user?.username}</p>
        {user && user.id === blog.user?.id && (
          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

BlogLink.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    votes: PropTypes.shape({
      users: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          vote: PropTypes.number.isRequired,
        })
      ).isRequired,
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default BlogLink;
