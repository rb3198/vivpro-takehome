import React from "react";
import styles from "./styles.module.scss";
import { FaReact } from "react-icons/fa";

const Loader: React.FC = () => {
  return (
    <div id={styles.container}>
      <FaReact size={48} id={styles.icon} />
    </div>
  );
};

export default Loader;
