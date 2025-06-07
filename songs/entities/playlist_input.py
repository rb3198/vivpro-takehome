from pydantic import BaseModel, Field

class PlaylistInput(BaseModel):
    '''
    Class representing the expected format of the input playlist.
    Pydantic-enabled, supporting validations.
    '''
    id: dict[str, str]
    title: dict[str, str]
    danceability: dict[str, float] 
    energy: dict[str, float]
    key: dict[str, int]
    loudness: dict[str, float]
    mode: dict[str, int]
    acousticness: dict[str, float]
    instrumentalness: dict[str, float]
    liveness: dict[str, float]
    valence: dict[str, float]
    tempo: dict[str, float]
    duration_ms: dict[str, int]
    time_signature: dict[str, int]
    num_bars: dict[str, int]
    num_sections: dict[str, int]
    num_segments: dict[str, int]
    class_: dict[str, int] = Field(alias='class')