import React, { useState, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import styles from "../styles/Toggleable.module.css";

const Toggleable = forwardRef((props, refs) => {
  const [visible, setVisible] = useState(false);

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
      <div className={visible ? styles.hidden : ""}>
        <button
          className={`${styles.shareButtonStyle} primaryButton`}
          onClick={toggleVisibility}
        >
          {props.buttonLabel}
        </button>
      </div>
      <div
        className={`${styles.content} ${
          visible ? styles.visible : styles.hidden
        }`}
      >
        {props.children}
        <button
          className={`${styles.cancelButtonStyle}`}
          onClick={toggleVisibility}
        >
          collapse form
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
