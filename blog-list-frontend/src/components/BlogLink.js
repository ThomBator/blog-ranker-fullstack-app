import { React, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "../styles/BlogLink.module.css";
import { useUser } from "../contexts/userContext";
import { useMutation, useQueryClient } from "react-query";
import blogService from "../services/blogs";
import { useNotificationDispatch } from "../contexts/notificationContext";

const BlogLink = ({ blog }) => {
  console.log("Blog in blogLink:", blog);
  const user = useUser();
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const queryClient = useQueryClient();
  const notifyWith = useNotificationDispatch();
  const location = useLocation();
  const isUserPage = location.pathname.includes("/users");

  const shortURL = (() => {
    try {
      const fullURL = new URL(blog.url);
      return fullURL.hostname.replace(/^www\./, "");
    } catch {
      return blog.url;
    }
  })();

  //This hook updates the blog entity when votes change
  const updateBlogMutation = useMutation(
    ([id, updatedBlog]) => blogService.update(id, updatedBlog),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["blogs"]); // Re-fetch blog data
      },
      onError: (error) => {
        console.error("Error updating blog:", error);
      },
    }
  );

  const deleteBlogMutation = useMutation(([id]) => blogService.remove(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]); // Re-fetch blog data
      notifyWith("Your blog has been deleted successfully.");
    },
    onError: (error) => {
      console.error("Error updating blog:", error);
    },
  });

  const handleVote = (voteValue) => {
    const existingBlogVotes = blog.votes.users;
    //goal with the logic here was to make sure we do not allow double voting
    //to create the updated blog votes I need to check if the user has already voted using .some()
    //if they have then we replace their previous vote with map, else we add the new vote to the existing votes
    const newBlogVotes = existingBlogVotes.some((vote) => vote.id === user.id)
      ? existingBlogVotes.map((vote) =>
          vote.id === user.id ? { ...vote, vote: voteValue } : vote
        )
      : [...existingBlogVotes, { id: user.id, vote: voteValue }];

    setUserVote(voteValue);

    const updatedBlog = { ...blog, votes: { users: newBlogVotes } };

    updateBlogMutation.mutate([updatedBlog.id, updatedBlog]);
  };

  useEffect(() => {
    if (blog?.votes?.users) {
      const initialVotes = blog.votes.users.reduce((total, voteUser) => {
        if (user) {
          if (voteUser.id === user.id) {
            setUserVote(voteUser.vote);
          }
        }

        return total + voteUser.vote;
      }, 0);

      const votesForDisplay = initialVotes > 0 ? initialVotes : 0;

      setTotalVotes(votesForDisplay);
    }
  }, [blog]);

  return (
    <div className={styles.blogLinkContainer}>
      <div className={styles.linkInfo}>
        <a href={blog.url} target="_blank" rel="noreferrer">
          {blog.title}
        </a>

        <p className={styles.blogDomain}>({shortURL})</p>
      </div>
      <Link to={`/blogs/${blog.id}`}>View Comments</Link>

      <div className={styles.voteInfo}>
        <p>
          {totalVotes === 1 ? "Vote: " : "Votes: "} {totalVotes}
        </p>
        {user ? (
          <>
            <button
              className="voteArrow"
              onClick={() => handleVote(1)}
              disabled={userVote === 1}
              aria-label="Upvote"
            >
              &#11014;
            </button>
            <button
              className="voteArrow"
              onClick={() => handleVote(-1)}
              disabled={userVote === -1}
              aria-label="Downvote"
            >
              &#11015;
            </button>
          </>
        ) : (
          <p>
            (<Link to="/login">Log in</Link> to vote on posts!)
          </p>
        )}
      </div>

      <div className={styles.userInfo}>
        {!isUserPage && (
          <p>
            {" "}
            Posted by{" "}
            <Link to={`/users/${blog.user.id}`}>{blog.user.username}</Link>
          </p>
        )}

        {user && user.id === blog.user.id && (
          <button
            className="deleteButton"
            onClick={() => deleteBlogMutation.mutate([blog.id])}
            aria-label="Delete blog"
          >
            &#128465;
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
    comments: PropTypes.arrayOf(PropTypes.string.isRequired),
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default BlogLink;
