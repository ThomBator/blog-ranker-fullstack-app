import React, { createContext, useReducer, useEffect, useContext } from "react";
import userService from "../services/users";
import PropTypes from "prop-types";

const usersReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      return action.payload;
    case "CLEAR_USERS":
      return [];
    default:
      return state;
  }
};

const UsersContext = createContext();

export const UsersContextProvider = ({ children }) => {
  const [users, dispatch] = useReducer(usersReducer, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await userService.getAll();
      dispatch({ type: "SET_USERS", payload: userList });
    };

    fetchUsers();
  }, []); // Fetch users only once when the provider mounts

  return (
    <UsersContext.Provider value={[users, dispatch]}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const [users, dispatch] = useContext(UsersContext);

  return {
    users,
    setUsers: (userList) => dispatch({ type: "SET_USERS", payload: userList }),
    clearUsers: () => dispatch({ type: "CLEAR_USERS" }),
  };
};

UsersContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
