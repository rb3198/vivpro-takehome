import React, {
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Track } from "../../types/track";
import styles from "./styles.module.scss";
import Loader from "../../components/loader";
import { Tools } from "../../components/tools";
import { Rating } from "../../components/rating";
import { formatDuration } from "../../utils";
import { BsArrowUp } from "react-icons/bs";
import { GlobalDataContext } from "../../contexts/global_data_context";

export const TracksTable: React.FC = () => {
  const { fetchTracks } = useContext(GlobalDataContext);
  const [activePage, setActivePage] = useState(0);
  const [searchTitle, setSearchTitle] = useState("");
  const [sortedByKey, setSortedByKey] = useState<keyof Track>("idx");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const searchSongs = () => {
    fetchTracks(searchTitle);
    setActivePage(0);
    setSortOrder("asc");
    setSortedByKey("idx");
  };

  const renderTable = () => {
    return (
      <div id={styles.table_and_page_opts}>
        <Suspense fallback={<Loader />}>
          <Table
            activePage={activePage}
            sortedByKey={sortedByKey}
            sortOrder={sortOrder}
            setSortedByKey={setSortedByKey}
            setSortOrder={setSortOrder}
            setActivePage={setActivePage}
          />
        </Suspense>
      </div>
    );
  };

  const renderBody = () => {
    return (
      <>
        <Tools
          searchTitle={searchTitle}
          setSearchTitle={setSearchTitle}
          searchSongs={searchSongs}
        />
        {renderTable() || <></>}
      </>
    );
  };

  return <div id={styles.container}>{renderBody()}</div>;
};

type TableProps = {
  sortedByKey: keyof Track;
  sortOrder: "asc" | "desc";
  activePage: number;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  setSortedByKey: React.Dispatch<React.SetStateAction<keyof Track>>;
  setActivePage: React.Dispatch<React.SetStateAction<number>>;
};

const Table: React.FC<TableProps> = (props) => {
  const {
    sortedByKey,
    sortOrder,
    activePage,
    setSortOrder,
    setSortedByKey,
    setActivePage,
  } = props;
  const { columnNameMap } = Track;
  const stickyIndices = new Set([1]);
  const { tracks: trackResource, updateTracks } = useContext(GlobalDataContext);
  const tracks = trackResource.read();

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
    // Update tracks.
    tracks.sort((t1, t2) => {
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
    });
    updateTracks([...tracks]);
  };

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
        updateTracks([...tracks]);
      }
    },
    [tracks, updateTracks]
  );

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

  if (!pages) return;
  const tracksToRender = pages[activePage] || [];

  const renderPageOpts = () => {
    return (
      <div id={styles.page_opts_container}>
        <p id={styles.page_opts_label}>Page:</p>
        <div id={styles.page_opts}>
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
      </div>
    );
  };

  return (
    <>
      <table id={styles.track_table}>
        <thead>
          <tr>
            {Object.keys(columnNameMap).map((key, idx) => (
              <th
                key={key}
                className={(stickyIndices.has(idx) && styles.hor_fixed) || ""}
                onClick={() => sortByKey(key as keyof Track)}
                data-selected={sortedByKey === key}
              >
                {columnNameMap[key as keyof Omit<Track, "userRating">]}
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
          {tracksToRender.map((track) => {
            const { id, rating, duration, userRating, idx: trackIdx } = track;
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
                          userRating={userRating}
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
      {renderPageOpts()}
    </>
  );
};
