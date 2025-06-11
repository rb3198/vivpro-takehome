import { withTheme } from "./hocs/withTheme";
import { ThemedProps } from "./types/interfaces/themed_props";
import styles from "./app.module.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./Root";
import { TracksTable } from "./containers/table";
import { Analysis } from "./containers/analysis";
import { GlobalDataContextProvider } from "./contexts/global_data_context";
import ErrorBoundary from "./components/error_boundary";

interface AppProps extends ThemedProps {}
const App: React.FC<AppProps> = (props) => {
  const { theme, toggleTheme } = props;
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root theme={theme} toggleTheme={toggleTheme} />,
      children: [
        {
          path: "",
          element: (
            <ErrorBoundary>
              <TracksTable />,
            </ErrorBoundary>
          ),
        },
        {
          path: "analysis",
          element: <Analysis />,
        },
      ],
    },
  ]);
  return (
    <div id={styles.root}>
      <GlobalDataContextProvider>
        <RouterProvider router={router} />
      </GlobalDataContextProvider>
    </div>
  );
};

export default withTheme(App);
