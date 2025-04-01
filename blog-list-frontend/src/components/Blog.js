import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useUser } from "../contexts/userContext";
import { useNotificationDispatch } from "../contexts/notificationContext";
import Notification from "./Notifications";
import blogService from "../services/blogs";
import styles from "../styles/Blog.module.css";
import createLocalDate from "../utils/createLocalDate";
import shortURL from "../utils/shortUrl";

const Blog = () => {
  const id = useParams().id;
  const queryClient = useQueryClient();
  const user = useUser();
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [comment, setComment] = useState("");
  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
  const notifyWith = useNotificationDispatch();
  const navigate = useNavigate();

  //updates blog when votes change with upvote or downvote
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

  const addCommentMutation = useMutation(
    ([id, comment, user]) => blogService.addComment(id, comment, user),
    {
      onSuccess: () => queryClient.invalidateQueries(["blogs"]),
      onError: (error) => console.error("Error adding comment:", error),
    }
  );

  const deleteBlogMutation = useMutation(([id]) => blogService.remove(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]); // Re-fetch blog data
      setHasBeenDeleted(true);
      notifyWith("Your blog has been successfully deleted");
    },
    onError: (error) => {
      console.error("Error updating blog:", error);
    },
  });

  const deleteCommentMutation = useMutation(
    ([blogId, commentId]) => blogService.removeComment(blogId, commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["blogs"]); // Re-fetch blog data
        notifyWith("Your comment has been successfully deleted");
      },
      onError: (error) => {
        console.error("Error updating blog:", error);
      },
    }
  );

  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate([blog.id, comment, user]);
      setComment(""); // Clear input after submission
    }
  };

  const handleVote = (voteValue) => {
    if (user) {
      const existingBlogVotes = blog.votes.users;

      //to create the updated blog votes I need to check if the user has already voted using .some()
      //if they have then we replace their previous vote with map, else we add the new vote to the existing votes
      const newBlogVotes = existingBlogVotes.some((vote) => vote.id === user.id)
        ? existingBlogVotes.map((vote) =>
            vote.id === user.id ? { ...vote, vote: voteValue } : vote
          )
        : [...existingBlogVotes, { id: user.id, vote: voteValue }];

      const updatedBlog = { ...blog, votes: { users: newBlogVotes } };

      updateBlogMutation.mutate([updatedBlog.id, updatedBlog]);
    }
  };

  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery(["blogs", id], () => blogService.getOne(id), {
    onError: (error) => {
      console.error("Error fetching blog data in Blog.js: ", error);
    },
  });

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
    if (hasBeenDeleted) {
      const timer = setTimeout(() => {
        navigate("/");
        clearTimeout(timer);
      }, 5000);
    }
  }, [navigate, hasBeenDeleted, blog]);

  if (isError) return <div>Error loading blog content</div>;
  if (isLoading) return <div>Loading...</div>;

  if (hasBeenDeleted) {
    return (
      <div className="pageContainer">
        This Blog post has been deleted successfully. If you are not returned to
        the home page in 5 seconds click the link below
        <Link to="/">Return to Homepage</Link>
      </div>
    );
  }

  console.log(blog);

  return (
    <div className="pageContainer">
      <h1 className={styles.blogHeader}>
        {" "}
        <a href={blog.url} target="_blank" rel="noreferrer">
          {blog.title}
        </a>{" "}
        ({shortURL(blog.url)})
      </h1>
      <div className={styles.postDetails}>
        <p>
          {" "}
          {totalVotes} {totalVotes === 1 ? "vote. " : "votes. "} Posted on:{" "}
          {createLocalDate(blog.createdAt)} by:{" "}
          <Link to={`/users/${blog.user.id}`}>{blog.user.username}</Link>{" "}
        </p>
        {user && (
          <div className={styles.voteButtons}>
            {" "}
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
          </div>
        )}
        {!user && (
          <p className={styles.loginPrompt}>
            (<Link to="/login">Log in</Link> to vote and comment!)
          </p>
        )}
      </div>
      <div>
        {user && (
          <>
            <div>
              {user.id === blog.user.id && (
                <button
                  className="deleteButton"
                  onClick={() => deleteBlogMutation.mutate([blog.id])}
                  aria-label="Delete blog"
                >
                  &#128465;
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {user && (
        <div className={styles.commentContainer}>
          <form onSubmit={handleAddComment}>
            <label>Add a comment</label>
            <textarea
              className={styles.commentTextArea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="secondaryButton" type="submit">
              Add Comment
            </button>
          </form>{" "}
        </div>
      )}
      <h3>Comments</h3>
      {(!blog.comments || blog.comments.length === 0) &&
        (user ? (
          <p>No comments yet. Please add one!</p>
        ) : (
          <p>No comments yet. Log in to add one!</p>
        ))}
      <ul>
        {blog.comments.map((comment) => (
          <li key={comment.id}>
            <p>{comment.comment}</p>
            <p>
              Posted by{" "}
              <Link to={`/users/${comment.user.id}`}>
                {comment.user.username}
              </Link>{" "}
              on {createLocalDate(comment.createdAt)}{" "}
            </p>

            {user && comment.user.id === user?.id && (
              <button
                onClick={() =>
                  deleteCommentMutation.mutate([blog.id, comment.id])
                }
                className="deleteButton"
                aria-label="Delete comment"
              >
                &#128465;
              </button>
            )}
          </li>
        ))}
      </ul>
      <Notification />
    </div>
  );
};

export default Blog;
