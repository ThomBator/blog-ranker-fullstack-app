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
      const { blogId, votes } = action.payload;

      // Ensure votes are an array and totalVotes is calculated safely
      const validVotes = Array.isArray(votes) ? votes : [];
      const totalVotes = validVotes.reduce(
        (total, vote) => total + vote.vote,
        0
      );

      return {
        ...state,
        votes: {
          ...state.votes,
          [blogId]: validVotes,
        },
        totalVotes: {
          ...state.totalVotes,
          [blogId]: totalVotes,
        },
      };
    }

    case UPDATE: {
      const { blogId, newVote } = action.payload;
      const existingVotes = state.votes[blogId] || [];

      const updatedVotes = existingVotes.some((vote) => vote.id === newVote.id)
        ? existingVotes.map((vote) => (vote.id === newVote.id ? newVote : vote))
        : [...existingVotes, newVote];

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

    default:
      return state;
  }
};

const VotesContext = createContext();

export const VotesContextProvider = ({ children }) => {
  const [votesObj, dispatch] = useReducer(votesReducer, initialState);

  const setVotes = (blogId, votes) => {
    dispatch({ type: SET, payload: { blogId, votes } });
  };

  const updateVote = (blogId, newVote) => {
    dispatch({ type: UPDATE, payload: { blogId, newVote } });
  };

  const useVotesValues = (blogId) => {
    const totalVotes = votesObj.totalVotes[blogId] || 0;
    const userVotes = votesObj.votes[blogId] || [];
    return [totalVotes, userVotes];
  };

  return (
    <VotesContext.Provider value={{ setVotes, updateVote, useVotesValues }}>
      {children}
    </VotesContext.Provider>
  );
};

VotesContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useVotes = () => {
  const context = useContext(VotesContext);
  if (!context) {
    throw new Error("useVotes must be used within a VotesContextProvider");
  }
  return context;
};
