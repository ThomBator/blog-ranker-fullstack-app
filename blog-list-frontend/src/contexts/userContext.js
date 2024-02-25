import React from "react";
import { createContext, useReducer, useContext } from "react";
import PropTypes from "prop-types";
import loginService from "../services/login";
import userService from "../services/users";
import storageService from "../services/storage";

//The reducer is structured to update state based on specified actions.
const loginReducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "CLEAR":
      return null;
  }
};

//Contexts allow you to manage state across all or part of your component tree in one central location. They take a reducer as an argument.

const UserContext = createContext();

//create ContextProvider
//Context Providers wrap parts of your component tree and make the state from that context available in that portion of the component tree.

export const UserContextProvider = (props) => {
  const [user, userDispatch] = useReducer(loginReducer, null);

  return (
    <UserContext.Provider value={[user, userDispatch]}>
      {props.children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

//these are called "context hooks"
export const useUser = () => {
  const [value] = useContext(UserContext);
  if (!UserContext) {
    throw new Error(
      "useUserValue must be used within UserContextProvider portion of the component tree"
    );
  }
  return value;
};

export const useLogin = () => {
  const [, dispatch] = useContext(UserContext);
  return async (credentials) => {
    const user = await loginService.login(credentials);
    dispatch({
      type: "SET",
      payload: user,
    });
    storageService.saveUser(user);
  };
};

export const useSignUp = () => {
  //use context returns the current state and the dispatch function to change the state.
  //In this use case only the dispatch function is needed.
  const [, dispatch] = useContext(UserContext);
  return async (credentials) => {
    const user = await userService.signUp(credentials);
    dispatch({
      type: "SET",
      payload: user,
    });
    storageService.saveUser(user);
  };
};
//This one doesn't actually need to be async as it just accesses localStorage. But it is my understanding that it is better to make it async in case I need to add server-side interactions in the future.
export const useLogout = () => {
  const [, dispatch] = useContext(UserContext);
  return async () => {
    dispatch({ type: "CLEAR" });
    storageService.removeUser();
  };
};

export const useInitUser = () => {
  const [, dispatch] = useContext(UserContext);
  return async () => {
    const user = await storageService.loadUser();
    if (user) {
      dispatch({
        type: "SET",
        payload: user,
      });
    }
  };
};

export default UserContext;
