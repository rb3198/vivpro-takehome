import React, { Suspense, useCallback, useContext, useMemo } from "react";
import styles from "./styles.module.scss";
import { BiSearch } from "react-icons/bi";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { Track } from "../../types/track";
import { GlobalDataContext } from "../../contexts/global_data_context";

export interface ToolProps {
  searchTitle: string;
  setSearchTitle: (searchTitle: string) => any;
  searchSongs: () => any;
}

export const Tools: React.FC<ToolProps> = ({
  searchTitle,
  setSearchTitle,
  searchSongs,
}) => {
  const { tracks: trackResource } = useContext(GlobalDataContext);
  const Search = useMemo(() => {
    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      setSearchTitle(e.target.value);
    };
    return (
      <div id={styles.search_container}>
        <div id={styles.search_box}>
          <BiSearch />
          <input
            placeholder="Search for a song by title..."
            value={searchTitle || ""}
            onChange={onChange}
          />
        </div>
        <button className={styles.button} onClick={searchSongs}>
          Get Song
        </button>
      </div>
    );
  }, [searchTitle, setSearchTitle]);

  const constructAndDownloadCsv = useCallback(() => {
    const tracks = trackResource.read();
    if (!tracks || !tracks.length) {
      return;
    }
    const rows: string[] = [];
    rows.push(Object.keys(Track.columnNameMap).join(","));
    tracks.forEach((track) => {
      rows.push(
        Object.keys(Track.columnNameMap)
          .map((key) => track[key as keyof Track])
          .join(",")
      );
    });
    const toWrite = rows.join("\n");
    const blob = new Blob([toWrite], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playlist.csv";
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }, [trackResource]);

  return (
    <div id={styles.container}>
      {Search}
      <Suspense fallback={null}>
        <DownloadButton constructAndDownloadCsv={constructAndDownloadCsv} />
      </Suspense>
    </div>
  );
};

interface DownloadButtonProps {
  constructAndDownloadCsv: () => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  constructAndDownloadCsv,
}) => {
  const { tracks: trackResource } = useContext(GlobalDataContext);
  const tracks = trackResource.read();
  return tracks.length ? (
    <button
      id={styles.download}
      className={styles.button}
      onClick={constructAndDownloadCsv}
    >
      <FaCloudDownloadAlt />
      Download CSV
    </button>
  ) : (
    <></>
  );
};
