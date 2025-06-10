import { withTheme } from "./hocs/withTheme";
import { ThemedProps } from "./types/interfaces/themed_props";
import styles from "./app.module.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./Root";
import { Table } from "./containers/table";
import { Analysis } from "./containers/analysis";
import { Track } from "./types/track";
import { Suspense, lazy, Component } from "react";
import { TRACKS_ENDPOINT } from "./constants/endpoints";
import { SongResponse } from "./types/song_response";
import Loader from "./components/loader";

// Create a resource for data fetching
const createTracksResource = (title?: string) => {
  let data: Track[] | null = null;
  let error: Error | null = null;
  let promise: Promise<Track[]> | null = null;

  const fetchData = async (): Promise<Track[]> => {
    const url = TRACKS_ENDPOINT + "?" + (title ? `title=${title}` : "") + "offset=0&limit=100";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch tracks: ${response.statusText}`);
    }
    const songResponses: SongResponse[] = await response.json();
    return songResponses.map(song => Track.fromSongResponse(song));
  };

  return {
    read(): Track[] {
      if (error) {
        throw error;
      }
      if (data) {
        return data;
      }
      if (!promise) {
        promise = fetchData()
          .then(result => {
            data = result;
            return result;
          })
          .catch(err => {
            error = err;
            throw err;
          });
      }
      throw promise;
    },
    refetch(newTitle?: string) {
      data = null;
      error = null;
      promise = null;
      return createTracksResource(newTitle);
    }
  };
};

let tracksResource = createTracksResource();

// Lazy load components
const LazyTable = lazy(() => import("./containers/table").then(module => ({ default: module.Table })));
const LazyAnalysis = lazy(() => import("./containers/analysis").then(module => ({ default: module.Analysis })));

// Error Boundary component
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

// Suspense-aware Table component wrapper
const SuspenseTable: React.FC<{ fetchTracks: (title?: string) => void }> = ({ fetchTracks }) => {
  const tracks = tracksResource.read();
  
  return (
    <LazyTable
      tracks={tracks}
      errorLoadingTracks={undefined}
      loadingTracks={false}
      setTracks={() => {}} // No longer needed with Suspense
      fetchTracks={fetchTracks}
    />
  );
};

// Suspense-aware Analysis component wrapper
const SuspenseAnalysis: React.FC = () => {
  const tracks = tracksResource.read();
  return <LazyAnalysis tracks={tracks} />;
};

interface AppProps extends ThemedProps {}

const App: React.FC<AppProps> = (props) => {
  const { theme, toggleTheme } = props;

  const fetchTracks = (title?: string) => {
    tracksResource = tracksResource.refetch(title);
    // Force re-render by updating the router
    window.location.reload(); // Simple approach, or use state management
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Suspense fallback={<Loader />}>
          <Root theme={theme} toggleTheme={toggleTheme} />
        </Suspense>
      ),
      children: [
        {
          path: "",
          element: (
            <ErrorBoundary fallback={(error) => <div>Error loading tracks: {error.message}</div>}>
              <Suspense fallback={<Loader />}>
                <SuspenseTable fetchTracks={fetchTracks} />
              </Suspense>
            </ErrorBoundary>
          ),
        },
        {
          path: "analysis",
          element: (
            <ErrorBoundary fallback={(error) => <div>Error loading analysis: {error.message}</div>}>
              <Suspense fallback={<Loader />}>
                <SuspenseAnalysis />
              </Suspense>
            </ErrorBoundary>
          ),
        },
      ],
    },
  ]);

  return (
    <div id={styles.root}>
      <Suspense fallback={<div>Loading router...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
};

export default withTheme(App);
