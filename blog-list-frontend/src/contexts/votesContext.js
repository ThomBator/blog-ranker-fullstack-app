import React, { createContext, useReducer, useContext } from "react";
import PropTypes from "prop-types";

const initialState = {
  votes: {},
  totalVotes: {},
};

// Action types
const SET = "SET";
const UPDATE = "UPDATE";

const votesReducer = (state, action) => {
  switch (action.type) {
    case SET: {
      return {
        ...state,
        votes: {
          ...state.votes,
          [action.payload.blogId]: action.payload.votes,
        },
        totalVotes: {
          ...state.totalVotes,
          [action.payload.blogId]: action.payload.totalVotes,
        },
      };
    }
    case UPDATE: {
      const { blogId, newVote } = action.payload;

      const updatedVotes = state.votes[blogId].map((userVote) =>
        userVote.id === newVote.id ? newVote : userVote
      );

      const newTotalVotes = updatedVotes.reduce(
        (total, vote) => total + vote.vote,
        0
      );

      return {
        ...state,
        votes: {
          ...state.votes,
          [blogId]: updatedVotes,
        },
        totalVotes: {
          ...state.totalVotes,
          [blogId]: newTotalVotes,
        },
      };
    }
    default: {
      return state;
    }
  }
};

const VotesContext = createContext();

export const VotesContextProvider = ({ children }) => {
  const [votesObj, dispatch] = useReducer(votesReducer, initialState);

  // Set initial votes state when a blog is retrieved from database
  const setVotes = (blogId, votes) => {
    const totalVotes = votes.reduce((total, vote) => total + vote.vote, 0);
    dispatch({ type: SET, payload: { blogId, votes, totalVotes } });
  };

  // Update votes when user votes
  const updateVote = (blogId, newVote) => {
    dispatch({ type: UPDATE, payload: { blogId, newVote } });
  };

  const useVotesValues = (blogId) => {
    const totalVotes = votesObj.totalVotes[blogId] || 0; // Default to 0 if undefined
    const userVote = votesObj.votes[blogId] || []; // Default to empty array if undefined

    return [totalVotes, userVote];
  };

  return (
    <VotesContext.Provider value={[setVotes, updateVote, useVotesValues]}>
      {children}
    </VotesContext.Provider>
  );
};

VotesContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useVotes = () => useContext(VotesContext);
