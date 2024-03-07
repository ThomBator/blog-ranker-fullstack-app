import blogService from "../services/blogs";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
// import { useUser } from "../contexts/userContext";

const Blog = () => {
  const id = useParams().id;
  console.log("Id ", id);
  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery(["blogs", id], () => blogService.getOne(id));
  const [likes, setLikes] = useState(blog ? blog.likes : 0);
  //new comment being added to blog
  const [comment, setComment] = useState("");
  //existing comments already appended to blog
  const comments = blog?.comments || null;
  // const user = useUser();
  const update = blogService.update;
  const addComment = blogService.addComment;
  const queryClient = useQueryClient();

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 10,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  // const removeBlogMutation = useMutation((id) => blogService.remove(id), {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["blogs"] });
  //   },
  // });

  const updateBlogMutation = useMutation(([id, blog]) => update(id, blog), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setLikes(likes + 1);
    },
    onError: (error) => {
      console.log("error: ", error);
    },
  });

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

  const handleAddLike = () => {
    updateBlogMutation.mutate([blog.id, { ...blog, likes: likes + 1 }]);
  };

  const handleAddComment = () => {
    addCommentMutation.mutate([blog.id, comment]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !blog) {
    return <div>Error loading blog, or blog not found</div>;
  }

  return (
    <div style={blogStyle}>
      <h2>{blog.title}</h2>

      <p>Author: {blog.author}</p>

      <p>URL: {blog.url} </p>

      <div id="likes">
        {" "}
        <p>
          Likes: {likes}{" "}
          <button type="button" onClick={handleAddLike}>
            like
          </button>{" "}
        </p>
      </div>

      {/* {user.id === blog.user.id && (
        <div>
          <button type="button" onClick={handleRemove}>
            delete
          </button>
        </div>
      )} */}

      <br />

      <form onSubmit={handleAddComment}>
        <label>Add a comment</label>
        <input value={comment} onChange={(e) => setComment(e.target.value)} />
        <button type="submit">Add Comment</button>
      </form>
      <h3>Comments</h3>

      {!comments ||
        (comments.length === 0 && <p>No comments yet. Please add one!</p>)}
      <ul>
        {comments.length > 0 &&
          comments.map((comment) => (
            <li key={comment._id}>{comment.comment}</li>
          ))}
      </ul>
    </div>
  );
};

//Remember the propTypes property is lowercase, but the PropTypes object used inside is uppdercase.

export default Blog;
