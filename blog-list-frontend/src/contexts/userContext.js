import React from "react";
import { createContext, useReducer, useContext } from "react";
import PropTypes from "prop-types";
import loginService from "../services/login";
import storageService from "../services/storage";

//create reducer
const loginReducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "CLEAR":
      return null;
  }
};

//create context
const UserContext = createContext();

//create ContextProvider

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

//create and useUser custom hook
export const useUser = () => {
  const [value] = useContext(UserContext);
  if (!UserContext) {
    throw new Error(
      "useUserValue must be used within UserContextProvider portio of the component tree"
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

//I am unclear why this function would be async. There is no talking to the server.
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
