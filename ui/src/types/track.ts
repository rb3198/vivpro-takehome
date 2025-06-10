import { SongResponse } from "./song_response";

export class Track {
  idx: number;
  id: string;
  title: string;
  userRating: number;
  rating: number;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  /**
   * Duration of the track in ms.
   */
  duration: number;
  timeSignature: number;
  numBars: number;
  numSections: number;
  numSegments: number;
  class: number;

  constructor({
    idx,
    id,
    title,
    rating,
    userRating,
    danceability,
    energy,
    key,
    loudness,
    mode,
    acousticness,
    instrumentalness,
    liveness,
    valence,
    tempo,
    duration,
    timeSignature,
    numBars,
    numSections,
    numSegments,
    class: trackClass,
  }: Track) {
    this.idx = idx;
    this.id = id;
    this.title = title;
    this.rating = rating;
    this.danceability = danceability;
    this.energy = energy;
    this.key = key;
    this.loudness = loudness;
    this.mode = mode;
    this.acousticness = acousticness;
    this.instrumentalness = instrumentalness;
    this.liveness = liveness;
    this.valence = valence;
    this.tempo = tempo;
    this.duration = duration;
    this.timeSignature = timeSignature;
    this.numBars = numBars;
    this.numSections = numSections;
    this.numSegments = numSegments;
    this.class = trackClass;
    this.userRating = userRating;
  }

  static columnNameMap: Record<keyof Track, string> = {
    idx: "Index",
    title: "Title",
    rating: "Rating",
    duration: "Duration",
    id: "ID",
    class: "Class",
    acousticness: "Acousticness",
    danceability: "Danceability",
    energy: "Energy",
    instrumentalness: "Instrumentalness",
    key: "Key",
    liveness: "Liveliness",
    loudness: "Loudness",
    mode: "Mode",
    numBars: "# of Bars",
    numSections: "# of Sections",
    numSegments: "# of Segments",
    tempo: "Tempo",
    timeSignature: "Signature",
    valence: "Valence",
    userRating: "",
  };

  static fromSongResponse = (response: SongResponse) => {
    const {
      idx,
      id,
      title,
      rating,
      danceability,
      energy,
      key,
      loudness,
      mode,
      acousticness,
      instrumentalness,
      liveness,
      valence,
      tempo,
      duration_ms,
      time_signature,
      num_bars,
      num_sections,
      num_segments,
      song_class,
      user_rating,
    } = response;
    return new Track({
      idx,
      id,
      title,
      rating,
      danceability,
      energy,
      key,
      loudness,
      mode,
      acousticness,
      instrumentalness,
      liveness,
      valence,
      tempo,
      duration: duration_ms,
      timeSignature: time_signature,
      numBars: num_bars,
      numSections: num_sections,
      numSegments: num_segments,
      class: song_class,
      userRating: user_rating,
    })
  }
}
