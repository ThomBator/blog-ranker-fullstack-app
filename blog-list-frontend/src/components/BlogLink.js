import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "./BlogLink.module.css";
import { useUser } from "../contexts/userContext";
import blogService from "../services/blogs";
import { useMutation, useQueryClient } from "react-query";
import { useNotificationDispatch } from "../contexts/notificationContext";
import { useVotes } from "../hooks/index";

const BlogLink = ({ blog }) => {
  const user = useUser();
  const remove = blogService.remove;
  const notifyWith = useNotificationDispatch();
  const { totalVotesValue, userVote, handleVote } = useVotes(blog);

  let shortURL = "";

  try {
    const fullURL = new URL(blog.url);
    shortURL = fullURL.hostname.replace(/^www\./, "");
  } catch {
    shortURL = blog.url;
  }
  //actually invaludates the the cache data so it can be refreshed from server
  const queryClient = useQueryClient();

  //This is the hook that will allow for the cache to be invalidated, but only if the REST API call is succesful
  const removeBlogMutation = useMutation(([id]) => remove(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      notifyWith("Blog post successfully deleted");
    },
    onError: (error) => {
      notifyWith("Blog deletion error. Contact site administrator");
      console.log("Blog Deletion Error: ", error);
    },
  });

  const handleDelete = () => {
    removeBlogMutation.mutate([blog.id]);
  };

  return (
    <div className={styles.blogLinkContainer}>
      <div className={styles.linkInfo}>
        <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        <p>({shortURL})</p>
      </div>

      <div className={styles.voteInfo}>
        {/*remember that blog.votes is an object that contains user metadata so we can limit the number of votes an individual user can make. So the actual votes value is at blog.votes.totalVotes*/}
        <p>Votes: {totalVotesValue}</p>
        {user && (
          <>
            <button onClick={() => handleVote(1)} disabled={userVote === 1}>
              Upvote
            </button>
            <button onClick={() => handleVote(-1)} disabled={userVote === -1}>
              Downvote
            </button>
          </>
        )}

        {!user && <p>(Log in to vote on posts!)</p>}
      </div>
      <div className={styles.userInfo}>
        <p>posted by {blog.user.username}</p>
        {user && user.id === blog.user.id && (
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete()}
          >
            delete
          </button>
        )}
      </div>
    </div>
  );
};

BlogLink.propTypes = {
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    votes: PropTypes.shape({
      users: PropTypes.array.isRequired,
    }),
    comments: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default BlogLink;
