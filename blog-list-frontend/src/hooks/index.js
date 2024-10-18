import { useEffect, useState } from "react";

import { useUser } from "../contexts/userContext";

const useField = (type) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return { type, value, onChange };
};

const useVotes = (votes = { users: [] }) => {
  const [totalVotesValue, setTotalVotesValue] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const currentUser = useUser();

  const allUsers = votes.users || [];

  useEffect(() => {
    let initialTotalVotes = 0;

    if (allUsers.length > 0) {
      allUsers.forEach((user) => (initialTotalVotes += user.vote));

      if (currentUser) {
        const userVoteObj = allUsers.find(
          (user) => user.id.toString() === currentUser.id.toString()
        );

        if (userVoteObj) {
          setUserVote(userVoteObj.vote);
        } else {
          setUserVote(0); // Reset if user vote not found
        }
      }
      setTotalVotesValue(initialTotalVotes);
    }
  }, [allUsers, currentUser]);

  const handleVote = (newVote) => {
    const newAllUsers = [...allUsers]; // Spread to avoid mutation

    if (currentUser) {
      const existingUserIndex = newAllUsers.findIndex(
        (user) => user.id.toString() === currentUser.id.toString()
      );

      if (existingUserIndex !== -1) {
        // Existing user found
        newAllUsers[existingUserIndex] = {
          ...newAllUsers[existingUserIndex],
          vote: newVote,
        };
      } else {
        // New user vote
        newAllUsers.push({ id: currentUser.id, vote: newVote });
      }
    }

    // Calculate new total votes and update the vote of the current user
    const newTotalVotes = newAllUsers.reduce(
      (total, user) => total + user.vote,
      0
    );

    // Optimistically update state
    setUserVote(newVote);
    setTotalVotesValue(newTotalVotes);

    // Create updated blog object with new votes
    return { users: newAllUsers };
  };

  return { totalVotesValue, userVote, handleVote };
};

export { useField, useVotes };
