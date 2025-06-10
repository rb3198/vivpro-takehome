import React, { useCallback, useState } from "react";
import styles from "./styles.module.scss";
import { ThemedProps } from "../../types/interfaces/themed_props";
import { BsSun, BsMoonStars } from "react-icons/bs";
import { IconContext } from "react-icons";
import { Theme } from "../../theme";

interface ThemeToggleProps extends ThemedProps {}

const getIcon = (theme?: Theme) =>
  theme === Theme.Dark ? <BsMoonStars /> : <BsSun />;

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  toggleTheme,
}) => {
  const [activeIcon, setActiveIcon] = useState<JSX.Element>(getIcon(theme));
  const handleToggleClick = useCallback(() => {
    toggleTheme && toggleTheme();
    const newTheme = theme === Theme.Dark ? Theme.Light : Theme.Dark;
    setTimeout(() => {
      setActiveIcon(getIcon(newTheme));
    }, 100);
  }, [theme, toggleTheme]);
  return (
    <div className={styles.container} onClick={handleToggleClick}>
      <div className={styles.toggle} data-theme={theme?.toString()}>
        <div />
      </div>
      <IconContext.Provider
        value={{
          className: styles.iconContainer,
          // @ts-ignore
          attr: { "data-theme": theme?.toString() },
        }}
      >
        {activeIcon}
      </IconContext.Provider>
    </div>
  );
};
