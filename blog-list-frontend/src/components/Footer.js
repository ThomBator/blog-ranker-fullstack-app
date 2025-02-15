import React from "react";
import styles from "../styles/Footer.module.css";

const date = new Date();

const year = date.getFullYear();

const Footer = () => {
  return (
    <div className={styles.footerContainer}>
      <p className={styles.footerParagraph}>
        &copy; {year} <a href="https://github.com/ThomBator/">Thom Bator</a>
      </p>
    </div>
  );
};

export default Footer;
