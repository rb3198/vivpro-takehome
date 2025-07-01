from songs.entities import Song
import copy

playlist_data = {
    "id": {
        "0": "5vYA1mW9g2Coh1HUFUSmlb",
        "1": "2klCjJcucgGQysgH170npL",
        "2": "093PI3mdUvOSlvMYDwnV1e"
    },
    "title": {
        "0": "3AM",
        "1": "4 Walls",
        "2": "11:11"
    },
    "danceability": {
        "0": 0.521,
        "1": 0.735,
        "2": 0.445
    },
    "energy": {
        "0": 0.673,
        "1": 0.849,
        "2": 0.528
    },
    "key":{
        "0": 8,
        "1": 4,
        "2": 10
    },
    "loudness":{
        "0": -8.685,
        "1": -4.308,
        "2": -7.243
    },
    "mode":{
        "0": 1,
        "1": 0,
        "2": 1
    },
    "acousticness":{
        "0": 0.00573,
        "1": 0.212,
        "2": 0.677
    },
    "instrumentalness":{
        "0": 0.0,
        "1": 0.0000294,
        "2": 0.0
    },
    "liveness":{
        "0": 0.12,
        "1": 0.0608,
        "2": 0.155
    },
    "valence":{
        "0": 0.543,
        "1": 0.223,
        "2": 0.511
    },
    "tempo":{
        "0": 108.031,
        "1": 125.972,
        "2": 203.155
    },
    "duration_ms":{
        "0": 225947,
        "1": 207477,
        "2": 223452
    },
    "time_signature":{
        "0": 4,
        "1": 4,
        "2": 4
    },
    "num_bars":{
        "0": 100,
        "1": 107,
        "2": 187
    },
    "num_sections":{
        "0": 8,
        "1": 7,
        "2": 12
    },
    "num_segments":{
        "0": 830,
        "1": 999,
        "2": 776
    },
    "class":{
        "0": 1,
        "1": 1,
        "2": 1
    }
}

transformed_songs: list[Song] = [
    Song(
        idx=0,
        id='5vYA1mW9g2Coh1HUFUSmlb',
        title='3AM',
        rating=0,
        user_rating=0,
        danceability=0.521,
        energy=0.673,
        key=8.0,
        loudness=-8.685,
        mode=1.0,
        acousticness=0.00573,
        instrumentalness=0.0,
        liveness=0.12,
        valence=0.543,
        tempo=108.031,
        duration=225947,
        time_signature=4,
        num_bars=100,
        num_sections=8,
        num_segments=830,
        song_class=1
    ),
    Song(
        idx=1,
        id='2klCjJcucgGQysgH170npL',
        title='4 Walls',
        rating=0,
        user_rating=0,
        danceability=0.735,
        energy=0.849,
        key=4.0,
        loudness=-4.308,
        mode=0.0,
        acousticness=0.212,
        instrumentalness=2.94e-05,
        liveness=0.0608,
        valence=0.223,
        tempo=125.972,
        duration=207477,
        time_signature=4,
        num_bars=107,
        num_sections=7,
        num_segments=999,
        song_class=1
    ),
    Song(
        idx=2,
        id='093PI3mdUvOSlvMYDwnV1e',
        title='11:11',
        rating=0,
        user_rating=0,
        danceability=0.445,
        energy=0.528,
        key=10.0,
        loudness=-7.243,
        mode=1.0,
        acousticness=0.677,
        instrumentalness=0.0,
        liveness=0.155,
        valence=0.511,
        tempo=203.155,
        duration=223452,
        time_signature=4,
        num_bars=187,
        num_sections=12,
        num_segments=776,
        song_class=1
    )
]

songs_with_ratings_no_user = [
    Song(
        idx=0,
        id='5vYA1mW9g2Coh1HUFUSmlb',
        title='3AM',
        rating=3,
        user_rating=0,
        danceability=0.521,
        energy=0.673,
        key=8.0,
        loudness=-8.685,
        mode=1.0,
        acousticness=0.00573,
        instrumentalness=0.0,
        liveness=0.12,
        valence=0.543,
        tempo=108.031,
        duration=225947,
        time_signature=4,
        num_bars=100,
        num_sections=8,
        num_segments=830,
        song_class=1
    ),
    Song(
        idx=1,
        id='2klCjJcucgGQysgH170npL',
        title='4 Walls',
        rating=3.5,
        user_rating=0,
        danceability=0.735,
        energy=0.849,
        key=4.0,
        loudness=-4.308,
        mode=0.0,
        acousticness=0.212,
        instrumentalness=2.94e-05,
        liveness=0.0608,
        valence=0.223,
        tempo=125.972,
        duration=207477,
        time_signature=4,
        num_bars=107,
        num_sections=7,
        num_segments=999,
        song_class=1
    ),
    Song(
        idx=2,
        id='093PI3mdUvOSlvMYDwnV1e',
        title='11:11',
        rating=4,
        user_rating=0,
        danceability=0.445,
        energy=0.528,
        key=10.0,
        loudness=-7.243,
        mode=1.0,
        acousticness=0.677,
        instrumentalness=0.0,
        liveness=0.155,
        valence=0.511,
        tempo=203.155,
        duration=223452,
        time_signature=4,
        num_bars=187,
        num_sections=12,
        num_segments=776,
        song_class=1
    )
]

songs_with_ratings_user = [
    Song(
        idx=0,
        id='5vYA1mW9g2Coh1HUFUSmlb',
        title='3AM',
        rating=3,
        user_rating=1,
        danceability=0.521,
        energy=0.673,
        key=8.0,
        loudness=-8.685,
        mode=1.0,
        acousticness=0.00573,
        instrumentalness=0.0,
        liveness=0.12,
        valence=0.543,
        tempo=108.031,
        duration=225947,
        time_signature=4,
        num_bars=100,
        num_sections=8,
        num_segments=830,
        song_class=1
    ),
    Song(
        idx=1,
        id='2klCjJcucgGQysgH170npL',
        title='4 Walls',
        rating=3.5,
        user_rating=2,
        danceability=0.735,
        energy=0.849,
        key=4.0,
        loudness=-4.308,
        mode=0.0,
        acousticness=0.212,
        instrumentalness=2.94e-05,
        liveness=0.0608,
        valence=0.223,
        tempo=125.972,
        duration=207477,
        time_signature=4,
        num_bars=107,
        num_sections=7,
        num_segments=999,
        song_class=1
    ),
    Song(
        idx=2,
        id='093PI3mdUvOSlvMYDwnV1e',
        title='11:11',
        rating=4,
        user_rating=3,
        danceability=0.445,
        energy=0.528,
        key=10.0,
        loudness=-7.243,
        mode=1.0,
        acousticness=0.677,
        instrumentalness=0.0,
        liveness=0.155,
        valence=0.511,
        tempo=203.155,
        duration=223452,
        time_signature=4,
        num_bars=187,
        num_sections=12,
        num_segments=776,
        song_class=1
    )
]