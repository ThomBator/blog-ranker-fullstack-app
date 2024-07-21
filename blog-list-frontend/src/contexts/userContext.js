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
//In this app we are wrapping the entire tree in index.js, but there may be cases where the context only includes part of the tree
export const UserContextProvider = (props) => {
  const [user, userDispatch] = useReducer(loginReducer, null);

  return (
    <UserContext.Provider value={[user, userDispatch]}>
      {/*The UserContex component created above is used here to wrap all child components in the context*/}
      {props.children}
    </UserContext.Provider>
  );
};

//Ensuring type saftey for our UserContextProvider component
UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

//allows a component to use a user if that state is held in the UserContext
export const useUser = () => {
  const [value] = useContext(UserContext);
  if (!UserContext) {
    throw new Error(
      "useUserValue must be used within UserContextProvider portion of the component tree"
    );
  }
  if (value.loginTime) {
    //Check whether user's token will still be validated on server side
    //The token expires sever-side after 1 hour (3600 seconds)
    const currentTime = Date.now();

    if (currentTime / 1000 - value.loginTime / 1000 > 3600) {
      return null;
    }
  }

  return value;
};

export const useLogin = () => {
  const [, dispatch] = useContext(UserContext);
  return async (credentials) => {
    const user = await loginService.login(credentials);
    //Append a time to user to ensure that users are auto logged out in alignment with time the token will expire on sever
    user.loginTime = Date.now();
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
    //Append a time to user to ensure that users are auto logged out in alignment with time the token will expire on sever
    user.loginTime = Date.now();

    if (user) {
      dispatch({
        type: "SET",
        payload: user,
      });
    }
  };
};

export default UserContext;
