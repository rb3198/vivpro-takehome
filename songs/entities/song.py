from dataclasses import dataclass, field

@dataclass
class Song:
    idx: int = field(metadata={ 'db': { 'insert': True, 'name': 'idx' }})
    id: str = field(metadata={ 'db': { 'insert': True, 'name': 'id' }})
    title: str = field(metadata={ 'db': { 'insert': True, 'name': 'title' }})
    rating: float = field(metadata={ 'db': { 'insert': False, 'name': 'rating' }})
    user_rating: float = field(metadata={ 'db': { 'insert': False, 'name': 'user_rating' }})
    danceability: float = field(metadata={ 'db': { 'insert': True, 'name': 'danceability' }})
    energy: float = field(metadata={ 'db': { 'insert': True, 'name': 'energy' }})
    key: float = field(metadata={ 'db': { 'insert': True, 'name': 'key' }})
    loudness: float = field(metadata={ 'db': { 'insert': True, 'name': 'loudness' }})
    mode: float = field(metadata={ 'db': { 'insert': True, 'name': 'mode' }})
    acousticness: float = field(metadata={ 'db': { 'insert': True, 'name': 'acousticness' }})
    instrumentalness: float = field(metadata={ 'db': { 'insert': True, 'name': 'instrumentalness' }})
    liveness: float = field(metadata={ 'db': { 'insert': True, 'name': 'liveness' }})
    valence: float = field(metadata={ 'db': { 'insert': True, 'name': 'valence' }})
    tempo: float = field(metadata={ 'db': { 'insert': True, 'name': 'tempo' }})
    duration_ms: int = field(metadata={ 'db': { 'insert': True, 'name': 'duration_ms' }})
    time_signature: int = field(metadata={ 'db': { 'insert': True, 'name': 'time_signature' }})
    num_bars: int = field(metadata={ 'db': { 'insert': True, 'name': 'num_bars' }})
    num_sections: int = field(metadata={ 'db': { 'insert': True, 'name': 'num_sections' }})
    num_segments: int = field(metadata={ 'db': { 'insert': True, 'name': 'num_segments' }})
    song_class: int = field(metadata={ 'db': { 'insert': True, 'name': 'class' }})
    def __init__(
        self,
        idx: int,
        id: str,
        title: str,
        rating: float,
        user_rating: float,
        danceability: float,
        energy: float,
        key: float,
        loudness: float,
        mode: float,
        acousticness: float,
        instrumentalness: float,
        liveness: float,
        valence: float,
        tempo: float,
        duration: int,
        time_signature: int,
        num_bars: int,
        num_sections: int,
        num_segments: int,
        song_class: int
    ):
        self.idx = idx
        self.id = id
        self.title = title
        self.rating = rating
        self.user_rating = user_rating
        self.danceability = danceability
        self.energy = energy
        self.key = key
        self.loudness = loudness
        self.mode = mode
        self.acousticness = acousticness
        self.instrumentalness = instrumentalness
        self.liveness = liveness
        self.valence = valence
        self.tempo = tempo
        self.duration_ms = duration
        self.time_signature = time_signature
        self.num_bars = num_bars
        self.num_sections = num_sections
        self.num_segments = num_segments
        self.song_class = song_class