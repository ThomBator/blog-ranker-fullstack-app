import React from "react";
import { createContext, useReducer, useContext } from "react";
import PropTypes from "prop-types";
/*
Additional actions you might consider adding: 
  CREATED
  INVALID_CREDENTIALS
  LOGIN_SUCCESS
*/

const emptyNotification = { message: null };

const notificationReducer = (state, action) => {
  if (action.type === "SET") {
    return { message: action.message };
  }
  if (action.type === "CLEAR") {
    return emptyNotification;
  }

  return state;
};

//the context is used to pass state around the application
const NotificationContext = createContext();

//This is the component that can wrap the app to manage state
//It is basically ust a more clean way to deliver the provider component provided by createContext

export const NotificationContextProvider = ({ children }) => {
  const [notification, notificationDispatch] = useReducer(
    notificationReducer,
    null
  );

  return (
    <NotificationContext.Provider value={[notification, notificationDispatch]}>
      {children}
    </NotificationContext.Provider>
  );
};

//Can be used to display current state in other components
export const useNotificationValue = () => {
  const [notification] = useContext(NotificationContext);
  if (!NotificationContext) {
    throw new Error(
      "useNotificationValue must be used within a NotificationContextProvider"
    );
  }
  return notification;
};

//Can be used to modify current state from other components.
export const useNotificationDispatch = () => {
  const [, dispatch] = useContext(NotificationContext);

  if (!NotificationContext) {
    throw new Error(
      "useNotificationDispatch must be used within a NotificationContextProvider"
    );
  }

  return (message) => {
    console.log("MESSAGE IS:", message);
    dispatch({ message, type: "SET" });
    setTimeout(() => {
      dispatch({ type: "CLEAR" });
    }, 5000);
  };
};

NotificationContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationContext;
