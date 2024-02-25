import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

function BlogLink({ blog }) {
  return (
    <div>
      <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
      <p>{blog.url}</p>
      <p>{blog.likes} likes</p>
      <p>posted by {blog.user.username}</p>
      <button>Upvote</button>
      <button>Downvote</button>
      <p>Votes {blog.likes}</p>
    </div>
  );
}

BlogLink.propTypes = {
  blog: {
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    comments: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
  },
};

export default BlogLink;
