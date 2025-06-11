import React, { useContext } from "react";
import styles from "./styles.module.scss";
import { GlobalDataContext } from "../../contexts/global_data_context";

export const NotificationPopup: React.FC = () => {
  const { notifPopupConfig } = useContext(GlobalDataContext);
  const { visible, message } = notifPopupConfig;
  return (visible && <div id={styles.container}>{message}</div>) || <></>;
};
