import { React, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "../styles/BlogLink.module.css";
import { useUser } from "../contexts/userContext";
import { useMutation, useQueryClient } from "react-query";

import blogService from "../services/blogs";

const BlogLink = ({ blog }) => {
  const user = useUser();
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const queryClient = useQueryClient();

  // Extract votes from the context using the blog ID

  const shortURL = (() => {
    try {
      const fullURL = new URL(blog.url);
      return fullURL.hostname.replace(/^www\./, "");
    } catch {
      return blog.url;
    }
  })();

  const updateBlogMutation = useMutation(
    ([id, updatedBlog]) => blogService.update(id, updatedBlog),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["blogs"]); // Re-fetch blog data
        console.log("Blog post successfully updated");
      },
      onError: (error) => {
        console.error("Error updating blog:", error);
      },
    }
  );

  const handleVote = (voteValue) => {
    const existingBlogVotes = blog.votes.users;

    console.log("Existing blog votes in hanldeVote: ", existingBlogVotes);
    //to create the updated blog votes I need to check if the user has already voted using .some()
    //if they have then we replace their previous vote with map, else we add the new vote to the existing votes
    const newBlogVotes = existingBlogVotes.some((vote) => vote.id === user.id)
      ? existingBlogVotes.map((vote) =>
          vote.id === user.id ? { ...vote, vote: voteValue } : vote
        )
      : [...existingBlogVotes, { id: user.id, vote: voteValue }];

    const updatedTotalVotes = newBlogVotes.reduce(
      (total, vote) => total + vote.vote,
      0
    );

    console.log("newBlogVotes in handleVote: ", newBlogVotes);

    setUserVote(voteValue);
    setTotalVotes(updatedTotalVotes);

    const updatedBlog = { ...blog, votes: { users: newBlogVotes } };

    console.log("updatedBlog in handleVotes:  ", updatedBlog);

    updateBlogMutation.mutate([updatedBlog.id, updatedBlog]);
  };
  useEffect(() => {
    if (blog?.votes?.users) {
      const initialVotes = blog.votes.users.reduce(
        (total, vote) => total + vote.vote,
        0
      );

      const initialUserVote =
        blog.votes.users.find((vote) => vote.id === user.id)?.vote ?? 0;

      setUserVote(initialUserVote);

      setTotalVotes(initialVotes);
    }
  }, [blog]);

  return (
    <div className={styles.blogLinkContainer}>
      <div className={styles.linkInfo}>
        <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        <p>({shortURL})</p>
      </div>

      <div className={styles.voteInfo}>
        <p>Votes: {totalVotes}</p>
        {user ? (
          <>
            <button onClick={() => handleVote(1)} disabled={userVote === 1}>
              Upvote
            </button>
            <button onClick={() => handleVote(-1)} disabled={userVote === -1}>
              Downvote
            </button>
          </>
        ) : (
          <p>
            (<Link to="/login">Log in</Link> to vote on posts!)
          </p>
        )}
      </div>

      <div className={styles.userInfo}>
        <p>Posted by {blog.user.username}</p>
        {user && user.id === blog.user.id && (
          <button className={styles.deleteButton}>Delete</button>
        )}
      </div>
    </div>
  );
};

BlogLink.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    votes: PropTypes.shape({
      users: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          vote: PropTypes.number.isRequired,
        })
      ).isRequired,
    }).isRequired,
    comments: PropTypes.arrayOf(PropTypes.object).isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default BlogLink;
