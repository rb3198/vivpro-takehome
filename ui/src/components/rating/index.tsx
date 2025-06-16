import React, { useContext, useRef, useState } from "react";
import styles from "./styles.module.scss";
import { Star } from "../icons/star";
import { useFetch } from "../../hooks/useFetch";
import { TRACKS_ENDPOINT } from "../../constants/endpoints";
import { RiLoader3Line } from "react-icons/ri";
import { GlobalDataContext } from "../../contexts/global_data_context";
import { Tooltip } from "react-tooltip";
import { HttpCodes } from "../../types/enum/http_codes";

export interface RatingProps {
  rating: number;
  userRating: number;
  id: string;
  idx: number;
  setRating: (rating: number, id: string, idx: number) => any;
}

export const Rating: React.FC<RatingProps> = (props) => {
  const { fetchResult: rate, loading } = useFetch();
  const { user, removeUser, openNotifPopup } = useContext(GlobalDataContext);
  const { rating, id, idx, userRating, setRating } = props;
  const initRating = useRef(userRating || rating);
  const [hoveredRating, setHoveredRating] = useState(-1);

  const handleClick = async (rating: number) => {
    setRating(rating, id, idx);
    const defaultErrorHandler = () => {
      openNotifPopup({
        duration: 3000,
        message: "Something went wrong. Please try again.",
        visible: true,
      });
    };
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
        case HttpCodes.Unauthorized:
          removeUser();
          openNotifPopup({
            duration: 3000,
            message: "Session Expired. Please login again.",
            visible: true,
          });
          break;
        default:
          defaultErrorHandler();
          break;
      }
      setRating(initRating.current, id, idx);
    } catch (err) {
      defaultErrorHandler();
      setRating(initRating.current, id, idx);
    }
  };

  const finalRating = userRating || rating;
  const getFillPercentage = (r: number) => {
    if (hoveredRating > 0) {
      return r <= hoveredRating ? 100 : 0;
    }
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
        <RiLoader3Line className={styles.loader} data-visible={loading} />
        {[1, 2, 3, 4, 5].map((r) => {
          return (
            <Star
              key={r}
              rating={r}
              fillPercentage={getFillPercentage(r)}
              setHoveredRating={setHoveredRating}
              setRating={handleClick}
              width={"1.309rem"}
              height={"1.309rem"}
              emptyClassName={styles.empty}
              filledClassName={
                finalRating === userRating || hoveredRating >= r
                  ? styles.user_filled
                  : styles.filled
              }
              disabled={!user}
              svgClassName={styles.star}
            />
          );
        })}
        <p
          className={styles.you_rated_label}
          data-present={userRating > 0 && userRating === finalRating}
        >
          {(userRating === finalRating && "You Rated") || ""}
        </p>
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
