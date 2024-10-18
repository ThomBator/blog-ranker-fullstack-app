import React from "react";
import { createContext, useReducer, useContext } from "react";
import PropTypes from "prop-types";
import loginService from "../services/login";
import userService from "../services/users";
import storageService from "../services/storage";
import checkIfTokenIsExpired from "../services/token";

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
export const UserContextProvider = ({ children }) => {
  const [user, userDispatch] = useReducer(loginReducer, null);

  return (
    <UserContext.Provider value={[user, userDispatch]}>
      {/*The UserContex component created above is used here to wrap all child components in the context*/}
      {children}
    </UserContext.Provider>
  );
};

//allows a component to use a user if that state is held in the UserContext
export const useUser = () => {
  const [user, dispatch] = useContext(UserContext);

  if (user) {
    const isTokenExpired = checkIfTokenIsExpired(user.token);

    if (isTokenExpired) {
      dispatch({
        type: "CLEAR",
      });
      storageService.removeUser();
      return null;
    }
  }

  return user;
};

export const useLogin = () => {
  const [, dispatch] = useContext(UserContext);
  return async (credentials) => {
    const user = await loginService.login(credentials);
    //Append a time to user to ensure that users are auto logged out in alignment with time the token will expire on sever
    if (user) {
      user.loginTime = Date.now();
      dispatch({
        type: "SET",
        payload: user,
      });
    }

    storageService.saveUser(user);
  };
};

export const useSignUp = () => {
  //Probably should add some error handling and validation here?
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
      const isTokenExpired = checkIfTokenIsExpired(user.token);
      if (!isTokenExpired) {
        dispatch({
          type: "SET",
          payload: user,
        });
      } else {
        dispatch({
          type: "CLEAR",
        });
        storageService.removeUser();
      }
    }
  };
};

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserContext;
