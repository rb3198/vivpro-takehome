import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import { Star } from "../icons/star";
import { useFetch } from "../../hooks/useFetch";
import { TRACKS_ENDPOINT } from "../../constants/endpoints";
import { RiLoader3Line } from "react-icons/ri";

export interface RatingProps {
  rating: number;
  userRating: number;
  id: string;
  idx: number;
  setRating: (rating: number, id: string, idx: number) => any;
}

export const Rating: React.FC<RatingProps> = (props) => {
  const { fetch: rate, data, error, loading } = useFetch();
  const { rating, id, idx, userRating, setRating } = props;
  const initRating = useRef(userRating || rating);
  const [hoveredRating, setHoveredRating] = useState(-1);

  const handleClick = async (rating: number) => {
    setRating(rating, id, idx);
    await rate(
      `${TRACKS_ENDPOINT}${idx}/${id}`,
      "put",
      JSON.stringify({
        rating,
      })
    );
  };

  useEffect(() => {
    if (data) {
      setRating(rating, id, idx);
      initRating.current = rating;
    }
  }, [data, rating, id, idx]);

  useEffect(() => {
    if (error) {
      setRating(initRating.current, id, idx);
    }
  }, [error, id, idx]);

  const getClasses = (r: number) => {
    if (hoveredRating > 0) {
      return r <= hoveredRating ? styles.filled : styles.empty;
    }
    return r <= rating ? styles.filled : styles.empty;
  };
  return (
    <div id={styles.container}>
      {[1, 2, 3, 4, 5].map((r) => {
        return (
          <Star
            key={r}
            rating={r}
            setHoveredRating={setHoveredRating}
            setRating={handleClick}
            width={"1.309rem"}
            className={getClasses(r)}
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
  );
};
