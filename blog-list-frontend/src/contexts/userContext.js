import React, {
  createContext,
  useReducer,
  useContext,
  useEffect, // Import useEffect
} from "react";
import PropTypes from "prop-types";
import loginService from "../services/login";
import userService from "../services/users";
import storageService from "../services/storage";
// Corrected the import for checkIfTokenIsExpired
import { checkIfTokenIsExpired } from "../services/token";

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

  // Effect to load user from storage and check token validity on initial mount
  useEffect(() => {
    const loggedUserJSON = storageService.loadUser();
    if (loggedUserJSON) {
      const isTokenExpired = checkIfTokenIsExpired(loggedUserJSON.token);
      if (isTokenExpired) {
        // If token is expired, clear it
        userDispatch({ type: "CLEAR" });
        storageService.removeUser();
      } else {
        // If token is valid, set the user
        userDispatch({ type: "SET", payload: loggedUserJSON });
      }
    } else {
      // Ensure user state is null if nothing in storage
      userDispatch({ type: "CLEAR" });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <UserContext.Provider value={[user, userDispatch]}>
      {/*The UserContex component created above is used here to wrap all child components in the context*/}
      {children}
    </UserContext.Provider>
  );
};

//allows a component to use a user if that state is held in the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  const [user, dispatch] = context;

  // Use useEffect to check token expiration after initial render/state setup
  useEffect(() => {
    if (user && user.token) {
      const isTokenExpired = checkIfTokenIsExpired(user.token);
      if (isTokenExpired) {
        // Dispatch clear action only if token is found to be expired
        dispatch({ type: "CLEAR" });
        storageService.removeUser();
      }
    }
    // Dependency array includes user object to re-run check if user changes
  }, [user, dispatch]);

  // Return the current user state
  // The effect will handle clearing it if the token is expired
  return user;
};

export const useLogin = () => {
  const [, dispatch] = useContext(UserContext);
  return async (credentials) => {
    const user = await loginService.login(credentials);
    //Append a time to user to ensure that users are auto logged out in alignment with time the token will expire on sever
    if (user) {
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
