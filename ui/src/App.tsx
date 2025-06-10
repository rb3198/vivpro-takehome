import { withTheme } from "./hocs/withTheme";
import { ThemedProps } from "./types/interfaces/themed_props";
import styles from "./app.module.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./Root";
import { Table } from "./containers/table";
import { Analysis } from "./containers/analysis";
import { useFetch } from "./hooks/useFetch";
import { Track } from "./types/track";
import { useEffect, useState } from "react";
import { TRACKS_ENDPOINT } from "./constants/endpoints";
import { SongResponse } from "./types/song_response";

interface AppProps extends ThemedProps {}
const App: React.FC<AppProps> = (props) => {
  const { theme, toggleTheme } = props;
  const [tracks, setTracks] = useState<Track[]>([]);
  const {
    fetch: fetchTracksHook,
    data,
    error,
    loading: loadingTracks,
  } = useFetch<SongResponse[]>();

  const fetchTracks = (title?: string) => {
    fetchTracksHook(
      `${TRACKS_ENDPOINT}?${title ? `title=${title}` : ""}${
        title ? "&" : ""
      }offset=0&limit=100`,
      "get"
    );
  };

  useEffect(() => {
    fetchTracks();
  }, []);
  useEffect(() => {
    if (data) {
      const tracks = [];
      for (let song of data) {
        tracks.push(Track.fromSongResponse(song));
      }
      setTracks(tracks);
    }
  }, [data]);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root theme={theme} toggleTheme={toggleTheme} />,
      children: [
        {
          path: "",
          element: (
            <Table
              tracks={tracks}
              errorLoadingTracks={error}
              loadingTracks={loadingTracks}
              setTracks={setTracks}
              fetchTracks={fetchTracks}
            />
          ),
        },
        {
          path: "analysis",
          element: <Analysis tracks={tracks} />,
        },
      ],
    },
  ]);
  return (
    <div id={styles.root}>
      <RouterProvider router={router} />
    </div>
  );
};

export default withTheme(App);
