import React from "react";

import { useNotificationValue } from "../contexts/notificationContext";
const Notification = () => {
  const notification = useNotificationValue();
  const color = notification?.color;
  const message = notification?.message;

  if (!message) {
    return;
  }

  return (
    <p
      id="notification"
      style={{
        border: `2px solid ${color}`,
        color: color,
        borderRadius: "10px",
        padding: "1rem",
        backgroundColor: "lightgray",
      }}
    >
      {message}
    </p>
  );
};

export default Notification;
