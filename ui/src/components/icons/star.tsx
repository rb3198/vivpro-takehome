import React from "react";

interface StarProps extends React.SVGProps<SVGSVGElement> {
  rating: number;
  setRating: (rating: number) => any;
  setHoveredRating: (rating: number) => any;
}

export const Star: React.FC<StarProps> = (props) => {
  const { rating, className, setHoveredRating, setRating } = props;
  const forbiddenKeys = new Set([
    "fill",
    "rating",
    "setRating",
    "setHoveredRating",
    "onMouseOver",
    "onMouseOut",
    "onClick",
    "className",
  ]);
  const svgProps = Object.keys(props)
    .filter((key) => !forbiddenKeys.has(key))
    .reduce((obj: { [key: string]: any }, key) => {
      obj[key] = props[key as keyof typeof props];
      return obj;
    }, {});

  const onMouseOver = () => setHoveredRating(rating);
  const onMouseOut = () => setHoveredRating(-1);
  const handleClick = () => {
    setRating(rating);
  };
  return (
    <svg
      {...svgProps}
      viewBox="-50 -48 100 96"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      style={{ cursor: "pointer" }}
      onClick={handleClick}
    >
      <polygon
        points="0,-40 12.36,-12.36 40,-12.36 18.18,4.55 24.72,31.8 0,18.18 -24.72,31.8 -18.18,4.55 -40,-12.36 -12.36,-12.36"
        className={className}
        strokeWidth="2"
      />
    </svg>
  );
};
