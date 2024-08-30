import { useEffect, useState } from "react";
import blogService from "../services/blogs";
import { useNotificationDispatch } from "../contexts/notificationContext";
import { useUser } from "../contexts/userContext";
import { useMutation, useQueryClient } from "react-query";

const useField = (type) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return { type, value, onChange };
};

const useVotes = (blog) => {
  //The total votes for this blog and the user's current vote will be recalcualted in this hook
  const [totalVotesValue, setTotalVotesValue] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const notifyWith = useNotificationDispatch();
  const queryClient = useQueryClient();
  const currentUser = useUser();

  const updateVoteMutation = useMutation(
    (updatedBlog) => blogService.update(updatedBlog.id, updatedBlog),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      },
      onError: () => {
        notifyWith("Updating blog votes failed");
      },
    }
  );

  //useEffect will make sure that certain aggregate recalcuations only happen when the blog or current user have changed
  useEffect(() => {
    const allUsers = blog.votes.users;
    let initialTotalVotes = 0;

    if (allUsers.length > 0) {
      allUsers.forEach((user) => (initialTotalVotes += user.vote));

      if (currentUser) {
        const userVoteObj = allUsers.find(
          (user) => user.id.toString() === currentUser.id.toString()
        );

        if (userVoteObj) {
          setUserVote(userVoteObj.vote);
        }
      }

      setTotalVotesValue(initialTotalVotes);
    }
  }, [blog, currentUser]);

  const handleVote = (newVote) => {
    const allUsers = blog.votes.users;
    const updateUsers = (type) => {
      if (currentUser) {
        if (type === "new") {
          allUsers.push({ id: currentUser.id, vote: newVote });
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

        updateVoteMutation.mutate(blog);
      }
    };

    //user has already upvoted in the past
    if (userVote === 1 && newVote === -1) {
      setUserVote(-1);
      //vote is decremented by 2 because we need to take away the upvote that was made previously(-1), then downvote (-1).
      setTotalVotesValue(totalVotesValue - 2);
      updateUsers("existing");
      //user has already downvoted in the past, so they are allowed to upvote
    } else if (userVote === -1 && newVote === 1) {
      setUserVote(1);
      //vote is incremented by 2 becuase we need to erase the downvote that was made previously (+1) and then upvote (+1)
      setTotalVotesValue(totalVotesValue + 2);
      updateUsers("existing");
    }

    // user has never voted
    else if (userVote === 0) {
      setUserVote(newVote);
      //this will handle either an upvote or downvote depending on the value passed in
      setTotalVotesValue(totalVotesValue + newVote);
      updateUsers("new");
    }
  };

  return { totalVotesValue, userVote, handleVote };
};

export { useField, useVotes };
