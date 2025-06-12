import React, { useContext, useState } from "react";
import { ThemedProps } from "../../types/interfaces/themed_props";
import styles from "./styles.module.scss";
import { Logo } from "../logo";
import { ThemeToggle } from "../theme_toggle";
import { TbMenuDeep } from "react-icons/tb";
import { BiX } from "react-icons/bi";
import { Theme } from "../../theme";
import { Link, useLocation } from "react-router-dom";
import { GlobalDataContext } from "../../contexts/global_data_context";
import { useFetch } from "../../hooks/useFetch";
import { LOGIN_ENDPOINT } from "../../constants/endpoints";

export interface HeaderProps extends ThemedProps {}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const { user, removeUser, openNotifPopup } = useContext(GlobalDataContext);
  const { fetchResult } = useFetch();
  const { pathname } = useLocation();
  const toggleMenuOpen = () => {
    setMenuOpen((prevState) => {
      const newState = !prevState;
      const [root] = document.getElementsByClassName(
        theme === Theme.Light ? "theme--light" : "theme--dark"
      );
      if (root) {
        root.setAttribute("data-nav-menu-open", newState.toString());
      }
      return newState;
    });
  };

  const toggleLogoutOpen = () => {
    setLogoutVisible((prev) => !prev);
  };

  const onLogoutClick = async () => {
    try {
      openNotifPopup({ duration: 1000, message: "Logging out", visible: true });
      const res = await fetchResult(LOGIN_ENDPOINT, "delete");
      if (res.ok) {
        removeUser();
        openNotifPopup({
          duration: 1000,
          message: "Logged out!",
          visible: true,
        });
      }
    } catch (error) {
      openNotifPopup({
        duration: 1000,
        message: "Something went wrong. Please try again.",
        visible: true,
      });
    }
  };
  const renderMenu = () => {
    return (
      <>
        <TbMenuDeep id={styles.hamburger} size={24} onClick={toggleMenuOpen} />
        <nav id={styles.nav} data-open={menuOpen}>
          <div id={styles.close_container}>
            <BiX size={32} onClick={toggleMenuOpen} />
          </div>
          <ul>
            <li data-active={pathname === "/"} onClick={toggleMenuOpen}>
              <Link to={"/"} className={styles.link}>
                Database
              </Link>
            </li>
            <li data-active={pathname === "/analysis"} onClick={toggleMenuOpen}>
              <Link to={"/analysis"} className={styles.link}>
                Analysis
              </Link>
            </li>
            {!!user ? (
              <li
                className={styles.link}
                onClick={toggleLogoutOpen}
                data-active={logoutVisible}
              >
                <p>{user.username}</p>
                <span
                  id={styles.logout}
                  data-visible={logoutVisible}
                  onClick={onLogoutClick}
                >
                  Logout
                </span>
              </li>
            ) : (
              <li data-active={pathname === "/auth"} onClick={toggleMenuOpen}>
                <Link to={"/auth"} className={styles.link}>
                  Login
                </Link>
              </li>
            )}
          </ul>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </nav>
      </>
    );
  };
  return (
    <div id={styles.container}>
      <Logo theme={theme} />
      {renderMenu()}
    </div>
  );
};
