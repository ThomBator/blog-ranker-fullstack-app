import React from "react";
import { createContext, useReducer, useContext } from "react";
import PropTypes from "prop-types";
/*
Actions needed
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

export const NotificationContextProvider = (props) => {
  const [notification, notificationDispatch] = useReducer(
    notificationReducer,
    null
  );

  return (
    <NotificationContext.Provider value={[notification, notificationDispatch]}>
      {props.children}
    </NotificationContext.Provider>
  );
};

//
NotificationContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

//Can be used to display current state in other components
export const useNotificationValue = () => {
  const notificationAndDisptach = useContext(NotificationContext);
  if (!NotificationContext) {
    throw new Error(
      "useNotificationValue must be used within a NotificationContextProvider"
    );
  }
  return notificationAndDisptach[0];
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

export default NotificationContext;
