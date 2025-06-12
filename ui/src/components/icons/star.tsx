import React, { useId } from "react";

interface StarProps extends React.SVGProps<SVGSVGElement> {
  rating: number;
  fillPercentage: number;
  filledClassName: string;
  emptyClassName: string;
  setRating: (rating: number) => any;
  setHoveredRating: (rating: number) => any;
  disabled?: boolean;
}

export const Star: React.FC<StarProps> = (props) => {
  const {
    rating,
    fillPercentage,
    filledClassName,
    emptyClassName,
    disabled,
    setHoveredRating,
    setRating,
  } = props;
  const forbiddenKeys = new Set([
    "fill",
    "rating",
    "setRating",
    "setHoveredRating",
    "onMouseOver",
    "onMouseOut",
    "onClick",
    "className",
    "filledClassName",
    "emptyClassName",
    "disabled",
    "fillPercentage",
  ]);
  const svgProps = Object.keys(props)
    .filter((key) => !forbiddenKeys.has(key))
    .reduce((obj: { [key: string]: any }, key) => {
      obj[key] = props[key as keyof typeof props];
      return obj;
    }, {});

  const onMouseOver = () => !disabled && setHoveredRating(rating);
  const onMouseOut = () => setHoveredRating(-1);
  const handleClick = () => !disabled && setRating(rating);
  const id = useId();
  return (
    <svg
      {...svgProps}
      viewBox="-50 -48 100 96"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      style={{ cursor: disabled ? "default" : "pointer" }}
      onClick={handleClick}
    >
      <defs>
        <clipPath id={id}>
          <rect x="-50" y="-48" width={fillPercentage} height="96" />
        </clipPath>
      </defs>

      {/* Background star (empty/outline) */}
      <polygon
        points="0,-40 12.36,-12.36 40,-12.36 18.18,4.55 24.72,31.8 0,18.18 -24.72,31.8 -18.18,4.55 -40,-12.36 -12.36,-12.36"
        className={emptyClassName}
        strokeWidth="2"
        fill="none"
        stroke="currentColor"
      />

      {/* Filled portion */}
      <polygon
        points="0,-40 12.36,-12.36 40,-12.36 18.18,4.55 24.72,31.8 0,18.18 -24.72,31.8 -18.18,4.55 -40,-12.36 -12.36,-12.36"
        className={filledClassName}
        strokeWidth="2"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
};
