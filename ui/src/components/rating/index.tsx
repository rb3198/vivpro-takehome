import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import { Star } from "../icons/star";
import { useFetch } from "../../hooks/useFetch";
import { TRACKS_ENDPOINT } from "../../constants/endpoints";
import { RiLoader3Line } from "react-icons/ri";
import { GlobalDataContext } from "../../contexts/global_data_context";
import { Tooltip } from "react-tooltip";

export interface RatingProps {
  rating: number;
  userRating: number;
  id: string;
  idx: number;
  setRating: (rating: number, id: string, idx: number) => any;
}

export const Rating: React.FC<RatingProps> = (props) => {
  const { fetchResult: rate, data, error, loading } = useFetch();
  const { user, removeUser, openNotifPopup } = useContext(GlobalDataContext);
  const { rating, id, idx, userRating, setRating } = props;
  const initRating = useRef(userRating || rating);
  const [hoveredRating, setHoveredRating] = useState(-1);

  const handleClick = async (rating: number) => {
    setRating(rating, id, idx);
    try {
      const res = await rate(
        `${TRACKS_ENDPOINT}${idx}/${id}/rating`,
        "put",
        JSON.stringify({
          rating,
        })
      );
      if (res.ok) {
        setRating(rating, id, idx);
        initRating.current = rating;
        return;
      }
      switch (res.status) {
        case 401:
          removeUser();
          openNotifPopup({
            duration: 3000,
            message: "Session Expired. Please login again.",
            visible: true,
          });
          break;
        default:
          openNotifPopup({
            duration: 3000,
            message: "Something went wrong. Please login again.",
            visible: true,
          });
          break;
      }
      setRating(initRating.current, id, idx);
    } catch (err) {}
  };

  useEffect(() => {
    if (error) {
      setRating(initRating.current, id, idx);
    }
  }, [error, id, idx]);

  const getFillPercentage = (r: number) => {
    if (hoveredRating > 0) {
      return r <= hoveredRating ? 100 : 0;
    }
    const finalRating = userRating || rating;
    if (r <= finalRating) {
      return 100;
    }
    if (Math.floor(finalRating) === r - 1) {
      const fraction = finalRating - Math.floor(finalRating);
      return fraction * 100;
    }
    return 0;
  };
  return (
    <>
      <div id={styles.container} data-tooltip-id={"unable_rate_tooltip"}>
        {[1, 2, 3, 4, 5].map((r) => {
          return (
            <Star
              key={r}
              rating={r}
              fillPercentage={getFillPercentage(r)}
              setHoveredRating={setHoveredRating}
              setRating={handleClick}
              width={"1.309rem"}
              emptyClassName={styles.empty}
              filledClassName={styles.filled}
              disabled={!user}
            />
          );
        })}
        <RiLoader3Line
          className={`${styles.loader} ${styles.hidden} ${
            (loading && styles.none) || ""
          }`}
        />
        {loading && <RiLoader3Line className={styles.loader} />}
      </div>
      {!user && (
        <Tooltip
          id="unable_rate_tooltip"
          place="bottom"
          content="Please login to rate this song!"
          variant="dark"
        />
      )}
    </>
  );
};
