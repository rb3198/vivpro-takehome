import { THEME_COOKIE } from "../constants/storage";
import { Theme } from "../theme";
import { useEffect, useState } from "react";

interface WithThemeProps {}

/**
 * Function to get default theme (dark / light) set in the browser.
 */
const getDefaultTheme = () => {
  const storedTheme = localStorage.getItem(THEME_COOKIE);
  if (storedTheme) {
    return parseInt(storedTheme) as Theme;
  }
  if (window.matchMedia("(prefers-color-scheme:dark").matches) {
    localStorage.setItem(THEME_COOKIE, Theme.Dark.toString());
    return Theme.Dark;
  }
  localStorage.setItem(THEME_COOKIE, Theme.Light.toString());
  return Theme.Light;
};

/**
 * Higher Order Component to add themed container to the app.
 * @param Component
 * @returns
 */
export const withTheme = <P extends Object>(
  Component: React.ComponentType<P>
) => {
  const WithTheme: React.FC<P & WithThemeProps> = (props) => {
    const [theme, setTheme] = useState(getDefaultTheme());

    useEffect(() => {
      const body = document.getElementsByTagName("body")[0];
      body.setAttribute("data-theme", theme.toString());
    }, [theme]);

    const toggleTheme = () => {
      const newTheme = theme === Theme.Dark ? Theme.Light : Theme.Dark;
      localStorage.setItem(THEME_COOKIE, newTheme.toString());
      setTheme(newTheme);
    };

    return (
      <div className={theme === Theme.Dark ? "theme--dark" : "theme--light"}>
        <Component {...props} toggleTheme={toggleTheme} theme={theme} />
      </div>
    );
  };
  return WithTheme;
};
