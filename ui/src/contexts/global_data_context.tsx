import React, {
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useRef,
} from "react";
import { Track } from "../types/track";
import { SongResponse } from "../types/song_response";
import { SESSION_ENDPOINT, TRACKS_ENDPOINT } from "../constants/endpoints";
import { USER_STORAGE_KEY } from "../constants/storage";
import { UserInfo } from "../types/user_info";
import { useFetch } from "../hooks/useFetch";
import { HttpCodes } from "../types/enum/http_codes";

type Resource<T> = {
  read: () => T;
};

type NotifPopupConfig = {
  visible: boolean;
  message: string;
  duration: number;
};

const DEFUALT_NOTIF_POPUP_DURATION = 3000;

const defaultNotifPopupConfig = {
  visible: false,
  message: "",
  duration: DEFUALT_NOTIF_POPUP_DURATION,
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
  user?: UserInfo;
  notifPopupConfig: NotifPopupConfig;
  fetchTracks: (title?: string) => void;
  updateTracks: (newTracks: Track[]) => void;
  setUser: (user: UserInfo) => void;
  removeUser: () => void;
  openNotifPopup: (config: NotifPopupConfig) => void;
  login: (
    username: string,
    password: string,
    onSuccess?: () => unknown,
    onFailure?: (message: string) => unknown
  ) => Promise<void>;
  logout: () => Promise<void>;
}>({
  tracks: emptyTracksPromise,
  notifPopupConfig: defaultNotifPopupConfig,
  fetchTracks: () => {},
  updateTracks: () => {},
  setUser: () => {},
  removeUser: () => {},
  openNotifPopup: () => {},
  login: () => new Promise((resolve) => resolve()),
  logout: () => new Promise((resolve) => resolve()),
});

export const GlobalDataContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [trackResource, setTrackResource] =
    useState<Resource<Track[]>>(emptyTracksPromise);
  const { fetchResult } = useFetch();
  const [user, setUserState] = useState<UserInfo>();
  const [notifPopupConfig, setNotifPopupConfig] = useState(
    defaultNotifPopupConfig
  );
  const notifPopupTimeoutRef = useRef<number>();
  useEffect(() => {
    getUserFromStorage();
    fetchTracks();
    return () => {
      const timeout = notifPopupTimeoutRef.current;
      typeof timeout === "number" && clearTimeout(timeout);
    };
  }, []);

  const getUserFromStorage = () => {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      const user: UserInfo = JSON.parse(userJson);
      setUserState(user);
    }
  };

  const setUser = (user: UserInfo) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setUserState(user);
  };

  const removeUser = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUserState(undefined);
  };

  const fetchTracks = (title?: string) => {
    const queryString = `?offset=0&limit=100${
      (title && `&title=${title}`) || ""
    }`;
    const trackPromise: Promise<Track[]> = fetchResult(
      TRACKS_ENDPOINT + queryString,
      "get"
    )
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
          if (res.status === HttpCodes.Unauthorized) {
            removeUser();
            // Retry without user
            fetchTracks();
            return [];
          }
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

  const openNotifPopup = ({
    message,
    duration = DEFUALT_NOTIF_POPUP_DURATION,
  }: NotifPopupConfig) => {
    setNotifPopupConfig({ visible: true, message, duration });
    clearTimeout(notifPopupTimeoutRef.current);
    notifPopupTimeoutRef.current = setTimeout(() => {
      setNotifPopupConfig(defaultNotifPopupConfig);
    }, duration);
  };

  const login = async (
    username: string,
    password: string,
    onSuccess?: () => unknown,
    onFailure?: (message: string) => unknown
  ) => {
    try {
      const res = await fetchResult(
        SESSION_ENDPOINT,
        "post",
        JSON.stringify({ username, password })
      );
      if (res.ok) {
        setUser({
          username,
          name: "",
        });
        onSuccess && onSuccess();
        fetchTracks();
      } else {
        if (res.headers.get("Content-Type") === "application/json") {
          const error = await res.json();
          "message" in error && onFailure && onFailure(error.message);
        } else {
          onFailure &&
            onFailure(
              res.status === HttpCodes.Unauthorized
                ? "Invalid Credentials"
                : "An unknown error"
            );
        }
      }
    } catch (error) {
      console.error(error);
      if (typeof error === "object" && error && onFailure) {
        const message =
          "message" in error && typeof error.message === "string"
            ? error.message
            : "Something went wrong, Please try again.";
        onFailure(message);
      }
    }
  };

  const logout = async () => {
    const onError = () => {
      openNotifPopup({
        duration: 1000,
        message: "Something went wrong. Please try again.",
        visible: true,
      });
    };
    try {
      openNotifPopup({ duration: 1000, message: "Logging out", visible: true });
      const res = await fetchResult(SESSION_ENDPOINT, "delete");
      if (res.ok) {
        removeUser();
        openNotifPopup({
          duration: 1000,
          message: "Logged out!",
          visible: true,
        });
        fetchTracks();
      } else {
        onError();
      }
    } catch (error) {
      onError();
    }
  };

  const value = {
    user,
    tracks: trackResource,
    notifPopupConfig,
    fetchTracks,
    updateTracks,
    setUser,
    removeUser,
    openNotifPopup,
    login,
    logout,
  };

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};
