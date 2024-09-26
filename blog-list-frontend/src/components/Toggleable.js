import React, { useState, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import styles from "../styles/Toggleable.module.css";

const Toggleable = forwardRef((props, refs) => {
  const [visible, setVisible] = useState(false);

  const hideWhenVisible = { display: visible ? "none" : "" };
  const showWhenVisible = { display: visible ? "" : "none" };

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  useImperativeHandle(refs, () => {
    return {
      toggleVisibility,
    };
  });

  return (
    <div className={styles.toggleableContainer}>
      <div style={hideWhenVisible}>
        <button
          className={`${styles.shareButtonStyle} primaryButton`}
          onClick={toggleVisibility}
        >
          {props.buttonLabel}
        </button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button
          className={`${styles.cancelButtonStyle}`}
          onClick={toggleVisibility}
        >
          close
        </button>
      </div>
    </div>
  );
});

Toggleable.propTypes = {
  buttonLabel: PropTypes.string,
  children: PropTypes.node,
};

Toggleable.forwardRef = "Toggleable";

export default Toggleable;
