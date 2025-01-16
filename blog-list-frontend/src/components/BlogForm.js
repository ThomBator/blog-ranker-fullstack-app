import React, { useState } from "react";
import { useNotificationDispatch } from "../contexts/notificationContext";
import { useMutation, useQueryClient } from "react-query";
import blogService from "../services/blogs";
import { useLogout, useUser } from "../contexts/userContext";
import styles from "../styles/BlogForm.module.css";

const BlogForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const notifyWith = useNotificationDispatch();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const user = useUser();
  const token = user ? user.token : null;

  const create = blogService.create;

  const newBlogMutation = useMutation(([blog, token]) => create(blog, token), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setTitle("");
      setAuthor("");
      setUrl("");
      notifyWith("New Blog Successfully Added");
    },
    onError: () => {
      notifyWith("Adding blog failed");
      logout();
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    newBlogMutation.mutate([{ title, author, url }, token]);
  };
  return (
    <div className={styles.blogFormContainer}>
      <form className={styles.blogForm} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formElement}>
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className={styles.formElement}>
            <label htmlFor="author">Author:</label>
            <input
              id="author"
              name="author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formElement}>
            <label htmlFor="url">URL:</label>
            <input
              id="url"
              name="url"
              value={url}
              type="url"
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
        </div>
        <div>
          <div>
            <button
              className={`${styles.buttonStyle} `}
              id="blogSubmit"
              type="submit"
            >
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
