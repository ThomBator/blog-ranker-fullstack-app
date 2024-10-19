import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useUser } from "../contexts/userContext";

import blogService from "../services/blogs";

const Blog = () => {
  const id = useParams().id;
  const queryClient = useQueryClient();
  const user = useUser();
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [comment, setComment] = useState("");

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

  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery(["blogs", id], () => blogService.getOne(id), {
    onSuccess: (data) => {
      console.log("Data in Blog.js onSuccess:", data);

      if (data?.votes?.users) {
        console.log("users array: ", data.votes.users);
        const initialVotes = data.votes.users.reduce(
          (total, vote) => total + vote.vote,
          0
        );

        const initialUserVote =
          data.votes.users.find((vote) => vote.id === user.id)?.vote ?? 0;

        setUserVote(initialUserVote);

        setTotalVotes(initialVotes);
      }
    },
    onError: (error) => {
      console.log("Error fetching blog data in Blog.js: ", error);
    },
  });
  if (isError) return <div>Error loading blog content</div>;
  if (isLoading) return <div>Loading...</div>;
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
      <p>Votes: {totalVotes}</p>

      <div>
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
