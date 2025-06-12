import React, { useMemo, useState } from "react";
import styles from "./styles.module.scss";
import { Login } from "./login";
import { Register } from "./register";

export const AuthController: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<"login" | "register">("login");

  const Toggle = useMemo(() => {
    const onLoginClick = () => setActiveRoute("login");
    const onRegisterClick = () => setActiveRoute("register");
    return (
      <div id={styles.toggle_container}>
        <div
          className={styles.toggle_content}
          data-active={activeRoute === "login"}
          onClick={onLoginClick}
        >
          Login
        </div>
        <div
          className={styles.toggle_content}
          data-active={activeRoute === "register"}
          onClick={onRegisterClick}
        >
          Register
        </div>
      </div>
    );
  }, [activeRoute]);

  const renderForm = () => {
    return (
      <div
        className={styles.card_3d_wrapper}
        data-rotated={activeRoute === "register"}
      >
        <div className={styles.card_front}>
          <Login />
        </div>
        <div className={styles.card_back}>
          <Register />
        </div>
      </div>
    );
  };

  return (
    <div id={styles.container}>
      {Toggle}
      <div className={styles.card}>{renderForm()}</div>
    </div>
  );
};
