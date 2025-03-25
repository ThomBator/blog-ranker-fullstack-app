import React from "react";
import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <div className={styles.footerContainer}>
      <p className={styles.footerParagraph}>
        &copy; {new Date().getFullYear()}{" "}
        <a href="https://github.com/ThomBator/">Thom Bator</a>
      </p>
    </div>
  );
};

export default Footer;
