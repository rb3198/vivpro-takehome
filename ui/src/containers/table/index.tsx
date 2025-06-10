import React, { useCallback, useMemo, useState } from "react";
import { Track } from "../../types/track";
import styles from "./styles.module.scss";
import Loader from "../../components/loader";
import { Tools } from "../../components/tools";
import { Rating } from "../../components/rating";
import { formatDuration } from "../../utils";
import { BsArrowUp } from "react-icons/bs";

export interface TableProps {
  tracks?: Track[];
  loadingTracks?: boolean;
  errorLoadingTracks?: boolean;
  setTracks: (tracks: Track[]) => any;
  fetchTracks: (title?: string) => void;
}

export const Table: React.FC<TableProps> = ({
  tracks,
  loadingTracks,
  fetchTracks,
  errorLoadingTracks,
  setTracks,
}) => {
  const [activePage, setActivePage] = useState(0);
  const [searchTitle, setSearchTitle] = useState("");
  const [sortedByKey, setSortedByKey] = useState<keyof Track>("idx");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleRating = useCallback(
    (rating: number, id: string, idx: number) => {
      if (!tracks) {
        return;
      }
      const trackIdx = tracks.findIndex(
        (track) => track.id === id && track.idx === idx
      );
      if (trackIdx > -1) {
        tracks[trackIdx].rating = rating;
        setTracks([...tracks]);
      }
    },
    [tracks, setTracks]
  );

  const searchSongs = () => {
    fetchTracks(searchTitle);
    setActivePage(0);
    setSortOrder("asc");
    setSortedByKey("idx");
  };

  const pages = useMemo(() => {
    if (!tracks || !tracks.length) {
      return [];
    }
    const pageSize = 10;
    const arr: Track[][] = [];
    let curArr: Track[] = [];
    for (let i = 0; i < tracks.length; i++) {
      curArr.push(tracks[i]);
      if (i !== 0 && (i + 1) % pageSize === 0) {
        arr.push(curArr);
        curArr = [];
        continue;
      }
    }
    curArr.length && arr.push(curArr);
    return arr;
  }, [tracks]);

  const sortByKey = (key: keyof Track) => {
    if (!tracks) {
      return;
    }
    let newSortOrder = sortOrder;
    if (sortedByKey === key) {
      newSortOrder = newSortOrder === "asc" ? "desc" : "asc";
      // change the direction of sort
      setSortOrder(newSortOrder);
    }
    setSortedByKey(key);
    setTracks(
      [...tracks].sort((t1, t2) => {
        const sortBy = key;
        if (typeof t1[sortBy] === "number" && typeof t2[sortBy] === "number") {
          return newSortOrder === "asc"
            ? t1[sortBy] - t2[sortBy]
            : t2[sortBy] - t1[sortBy];
        }
        if (typeof t1[sortBy] === "string" && typeof t2[sortBy] === "string") {
          return newSortOrder === "asc"
            ? t1[sortBy].localeCompare(t2[sortBy])
            : t2[sortBy].localeCompare(t1[sortBy]);
        }
        return 0;
      })
    );
  };

  const renderTable = () => {
    const { columnNameMap } = Track;
    const stickyIndices = new Set([1]);
    if (!pages) return;
    const tracks = pages[activePage] || [];
    return (
      <table id={styles.track_table}>
        <thead>
          <tr>
            {Object.keys(columnNameMap).map((key, idx) => (
              <th
                key={key}
                className={(stickyIndices.has(idx) && styles.hor_fixed) || ""}
                onClick={() => sortByKey(key as keyof Track)}
              >
                {columnNameMap[key as keyof Track]}
                {(sortedByKey === key && (
                  <BsArrowUp
                    className={styles.sort_arrow}
                    data-sort-order={sortOrder}
                  />
                )) || <></>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => {
            const { id, rating, duration, idx: trackIdx } = track;
            return (
              <tr key={id}>
                {Object.keys(columnNameMap).map((key, idx) => {
                  return (
                    <td
                      key={key}
                      data-title={key === "title"}
                      className={
                        (stickyIndices.has(idx) && styles.hor_fixed) || ""
                      }
                    >
                      {key === "rating" ? (
                        <Rating
                          id={id}
                          idx={trackIdx}
                          rating={rating}
                          setRating={handleRating}
                        />
                      ) : key === "duration" ? (
                        formatDuration(duration)
                      ) : (
                        track[key as keyof Track]
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderPageOpts = () => {
    return (
      <div id={styles.page_opts}>
        <p id={styles.page_opts_label}>Page:</p>
        {pages.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setActivePage(idx)}
            className={styles.page_no}
            data-selected={activePage === idx}
          >
            {idx + 1}
          </div>
        ))}
      </div>
    );
  };

  const renderBody = () => {
    return (
      <>
        <Tools
          tracks={tracks}
          searchTitle={searchTitle}
          setSearchTitle={setSearchTitle}
          searchSongs={searchSongs}
        />
        {(pages && (
          <>
            {renderTable()}
            {renderPageOpts()}
          </>
        )) || <></>}
      </>
    );
  };

  const renderError = () => {
    return (
      <div id={styles.error_container}>
        <h3>Error encountered while fetching the tracks.</h3>
        <button onClick={searchSongs}>Try Again</button>
      </div>
    );
  };
  return (
    <div id={styles.container} data-loading={loadingTracks}>
      {loadingTracks && <Loader />}
      {!loadingTracks && !errorLoadingTracks && renderBody()}
      {errorLoadingTracks && renderError()}
    </div>
  );
};
