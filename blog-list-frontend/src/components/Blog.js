import blogService from "../services/blogs";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useUser } from "../contexts/userContext";
//import { useNotificationDispatch } from "../contexts/notificationContext";
import { useVotes } from "../hooks";

import { Link } from "react-router-dom";

const Blog = () => {
  const id = useParams().id;
  const user = useUser();
  const result = useQuery(["blogs", id], () => blogService.getOne(id));
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  //const remove = blogService.remove;
  //const update = blogService.update;
  //const notifyWith = useNotificationDispatch();
  // was getting an infinite loop when useVotes was called before blog was available

  //new comment being added to blog

  //existing comments already appended to blog

  //const update = blogService.update;
  const addComment = blogService.addComment;

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 10,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  // const updateBlogMutation = useMutation(
  //   ([id, updatedBlog]) => update(id, updatedBlog),
  //   {
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["blogs"] });
  //       notifyWith("Blog post successfully updated");
  //     },
  //     onError: (error) => {
  //       notifyWith("Error updating blog:", error);
  //     },
  //   }
  // );

  // const removeBlogMutation = useMutation((id) => blogService.remove(id), {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["blogs"] });
  //   },
  // });

  const addCommentMutation = useMutation(
    ([id, comment, user]) => addComment(id, comment, user),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      },
      onError: (error) => {
        console.log("error: ", error);
      },
    }
  );

  // const handleRemove = () => {
  //   if (window.confirm("Are you sure you want to delete this blog?")) {
  //     removeBlogMutation.mutate(blog.id);
  //   }
  // };

  const handleAddComment = () => {
    console.log("user in blog component handleAddComment: ", user);
    addCommentMutation.mutate([blog.id, comment, user]);
  };

  if (result.isLoading) {
    console.log(result);
    return <div>loading.data</div>;
  }

  const blog = result.data;

  console.log(blog);

  const totalVotes = 11;

  const comments = blog?.comments || null;

  return (
    <div style={blogStyle}>
      <h2>{blog.title}</h2>

      <p>Author: {blog.author}</p>

      <p>URL: {blog.url} </p>

      {
        <div>
          {<p>Votes: {totalVotes}</p>}
          {/*user && (
            <>
              <button onClick={() => updateVote(1)} disabled={userVote === 1}>
                Upvote
              </button>
              <button onClick={() => updateVote(-1)} disabled={userVote === -1}>
                Downvote
              </button>
            </>
          )*/}
          {!user && (
            <p>
              (<Link to="/login">Log in</Link> to vote on posts!)
            </p>
          )}
        </div>
      }

      {/* {user.id === blog.user.id && (
        <div>
          <button type="button" onClick={handleRemove}>
            delete
          </button>
        </div>
      )} */}

      {!user && <p>Login to post a comment!</p>}

      {user && (
        <>
          {" "}
          <form onSubmit={handleAddComment}>
            <label>Add a comment</label>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Add Comment</button>
          </form>
          <h3>Comments</h3>
          {(!comments || comments.length === 0) && (
            <p>No comments yet. Please add one!</p>
          )}
          <ul>
            {comments &&
              comments.length > 0 &&
              comments.map((comment) => (
                <li key={comment._id}>{comment.comment}</li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Blog;
