import React, {
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import { Track } from "../types/track";
import { SongResponse } from "../types/song_response";
import { TRACKS_ENDPOINT } from "../constants/endpoints";

type Resource<T> = {
  read: () => T;
};

const wrapPromise = <T,>(promise: Promise<T>): Resource<T> => {
  let status = "pending";
  let result: T;

  const suspender = promise.then(
    (data) => {
      status = "success";
      result = data;
    },
    (error) => {
      status = "error";
      result = error;
    }
  );

  return {
    read() {
      if (status === "pending") throw suspender;
      if (status === "error") throw result;
      return result;
    },
  };
};

const emptyTracksPromise = wrapPromise<Track[]>(
  new Promise((resolve) => resolve([]))
);

export const GlobalDataContext = createContext<{
  tracks: Resource<Track[]>;
  fetchTracks: (title?: string) => void;
  updateTracks: (newTracks: Track[]) => void;
}>({
  tracks: emptyTracksPromise,
  fetchTracks: () => {},
  updateTracks: () => {},
});

export const GlobalDataContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [trackResource, setTrackResource] =
    useState<Resource<Track[]>>(emptyTracksPromise);
  //   const [settingsResource, setSettingsResource] = useState(null);

  useEffect(() => {
    fetchTracks();
    // setUserResource(wrapPromise(userPromise));
  }, []);

  const fetchTracks = (title?: string) => {
    const queryString = `?offset=0&limit=100${
      (title && `&title=${title}`) || ""
    }`;
    const trackPromise = fetch(TRACKS_ENDPOINT + queryString)
      .then(async (res) => {
        if (res.ok) {
          const songResponses = (await res.json()) as SongResponse[];
          if (songResponses && songResponses.length) {
            const tracks = songResponses.map((response) =>
              Track.fromSongResponse(response)
            );
            return tracks;
          }
          return [];
        } else {
          console.error(
            "Received invalid response while fetching songs:",
            res.text(),
            res.statusText
          );
          throw new Error(
            "Failed to fetch tracks. Something went wrong, please try again."
          );
        }
      })
      .catch((err) => {
        console.error(err);
        throw new Error(
          "Failed to fetch tracks. Something went wrong, please try again."
        );
      });
    setTrackResource(wrapPromise(trackPromise));
  };

  const updateTracks = (tracks: Track[]) => {
    setTrackResource(wrapPromise(Promise.resolve(tracks)));
  };

  const value = {
    tracks: trackResource,
    fetchTracks,
    updateTracks,
  };

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};
