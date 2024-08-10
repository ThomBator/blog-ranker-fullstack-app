import { useEffect, useState } from "react";
import blogService from "../services/blogs";

const useField = (type) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return { type, value, onChange };
};

const useVotes = (blog, currentUser) => {
  //The total votes for this blog and the user's current vote will be recalcualted in this hook
  const [totalVotesValue, setTotalVotesValue] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const allUsers = blog.votes.users;

  //useEffect will make sure that certain aggregate recalcuations only happen when the blog or current user have changed
  useEffect(() => {
    let initialTotalVotes = 0;

    if (allUsers.length > 0) {
      allUsers.forEach((user) => (initialTotalVotes += user.vote));

      const userVoteObj = allUsers.find(
        (user) => user.id.toString() === currentUser.id.toString()
      );

      if (userVoteObj) {
        setUserVote(userVoteObj.vote);
      }

      setTotalVotesValue(initialTotalVotes);
    }
  }, [blog, currentUser]);

  const handleVote = (newVote) => {
    //user has already upvoted in the past
    if (userVote === 1 && newVote === -1) {
      setUserVote(-1);
      setTotalVotesValue(totalVotesValue - 1);
      upDateUsers("existing");
      //user has already downvoted in the past, so they are allowed to upvote
    } else if (userVote === -1 && newVote === 1) {
      setUserVote(1);
      setTotalVotesValue(totalVotesValue + 1);
      upDateUsers("existing");
    }

    // user has never voted
    else if (userVote === 0) {
      setUserVote(newVote);
      setTotalVotesValue(totalVotesValue + newVote);
      upDateUsers("new");
    }

    const upDateUsers = (type) => {
      if (type === "new") {
        allUsers.push = { id: currentUser.id, vote: newVote };
        blog.votes.users = allUsers;
      } else if (type === "existing") {
        const newAllUsers = allUsers.map((user) => {
          if (user.id.toString() === currentUser.id.toString()) {
            user.vote = newVote;
          }
          return user;
        });

        blog.votes.users = newAllUsers;
      }

      blogService.update(blog.id, blog);
    };
  };
};

export default { useField, useVotes };
