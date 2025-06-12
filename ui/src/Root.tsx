import React from "react";
import { ThemedProps } from "./types/interfaces/themed_props";
import { Header } from "./components/header";
import { Outlet } from "react-router-dom";

export const Root: React.FC<ThemedProps> = ({ theme, toggleTheme }) => {
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <Outlet />
    </>
  );
};
