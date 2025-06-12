/**
 * Response sent by the server
 */
export class SongResponse {
    idx: number;
    id: string;
    title: string;
    rating: number;
    user_rating: number;
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
    duration_ms: number;
    time_signature: number;
    num_bars: number;
    num_sections: number;
    num_segments: number;
    song_class: number;
  
    constructor({
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
    }: SongResponse) {
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
      this.duration_ms = duration_ms;
      this.time_signature = time_signature;
      this.num_bars = num_bars;
      this.num_sections = num_sections;
      this.num_segments = num_segments;
      this.song_class = song_class;
      this.user_rating = user_rating;
    }
  }