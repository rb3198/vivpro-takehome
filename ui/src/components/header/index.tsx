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

export interface HeaderProps extends ThemedProps {}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(GlobalDataContext);
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
              <li>
                {user.username}
                <p>Logout</p>
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
