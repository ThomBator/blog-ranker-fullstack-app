import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useUser } from "../contexts/userContext";
import { useVotes } from "../contexts/votesContext";
import blogService from "../services/blogs";

const Blog = () => {
  const id = useParams().id;
  const queryClient = useQueryClient();
  const user = useUser();
  const { setVotes, updateVote, useVotesValues } = useVotes();
  const [comment, setComment] = useState("");

  // Fetch blog data using react-query
  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery(["blogs", id], () => blogService.getOne(id), {
    onSuccess: (data) => {
      if (data && data.votes) {
        setVotes(data.id, data.votes); // Set votes in context
      }
    },
  });

  // Mutation to update the blog on the server
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
    const newVote = { id: user.id, vote: voteValue };

    // 1. Update the local vote state
    updateVote(blog.id, newVote);

    // 2. Prepare the updated blog with new votes
    const updatedBlog = {
      ...blog,
      votes: [...blog.votes.filter((v) => v.id !== user.id), newVote],
    };

    // 3. Trigger the mutation to update the blog on the server
    updateBlogMutation.mutate([blog.id, updatedBlog]);
  };

  const addCommentMutation = useMutation(
    ([id, comment, user]) => blogService.addComment(id, comment, user),
    {
      onSuccess: () => queryClient.invalidateQueries(["blogs"]),
      onError: (error) => console.error("Error adding comment:", error),
    }
  );

  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate([blog.id, comment, user]);
      setComment(""); // Clear input after submission
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !blog)
    return <div>Error loading blog, or blog not found.</div>;

  const [totalVotesValue, userVote] = useVotesValues(blog.id); // Access vote values from context

  return (
    <div
      style={{
        paddingTop: 10,
        paddingLeft: 10,
        border: "solid",
        borderWidth: 1,
        marginBottom: 5,
      }}
    >
      <h2>{blog.title}</h2>
      <p>Author: {blog.author}</p>
      <p>URL: {blog.url}</p>

      <div>
        <p>Votes: {totalVotesValue}</p>
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

      {user && (
        <>
          <form onSubmit={handleAddComment}>
            <label>Add a comment</label>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Add Comment</button>
          </form>
          <h3>Comments</h3>
          {(!blog.comments || blog.comments.length === 0) && (
            <p>No comments yet. Please add one!</p>
          )}
          <ul>
            {blog.comments.map((comment) => (
              <li key={comment._id}>{comment.comment}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Blog;
