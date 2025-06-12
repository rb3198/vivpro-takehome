export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;

  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    // Less than 1 hour
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  } else {
    // 1 hour or more
    return `${hours}:${remainingMinutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
};
