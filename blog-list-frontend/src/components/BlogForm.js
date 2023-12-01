import React, { useState } from "react";
import { useNotificationDispatch } from "../contexts/notificationContext";
import { useMutation, useQueryClient } from "react-query";
import blogService from "../services/blogs";
import { useLogout, useUser } from "../contexts/userContext";
import styles from "./BlogForm.module.css";

const BlogForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const notifyWith = useNotificationDispatch();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const user = useUser();
  const token = user ? user.token : null;
  console.log("Token, ", user.token);

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
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">title:</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="author">author:</label>
          <input
            id="author"
            name="author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="url">url:</label>
          <input
            id="url"
            name="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
        <div>
          <button className={styles.buttonStyle} id="blogSubmit" type="submit">
            add
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
