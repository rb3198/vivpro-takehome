from typing import Literal, Union
from songs.dal import insert_songs, get_songs as get_songs_dl, get_song_ratings, rate_song as rate_song_dl, get_song_by_idx_id as get_song_by_idx_id_dl
from songs.entities import PlaylistInput
from songs.entities import Song


async def load_playlist(playlist: PlaylistInput):
    '''
    Maps playlist data to songs.
    '''
    songs: list[Song] = list()
    playlist_dict = dict(playlist)
    for idx in playlist_dict['id'].keys():
        song = Song(
            id=str(playlist_dict['id'][idx]),
            title=str(playlist_dict['title'][idx]),
            idx=int(idx),
            duration=int(playlist_dict['duration_ms'][idx]),
            time_signature=int(playlist_dict['time_signature'][idx]),
            num_segments=int(playlist_dict['num_segments'][idx]),
            num_bars=int(playlist_dict['num_bars'][idx]),
            num_sections=int(playlist_dict['num_sections'][idx]),
            song_class=int(playlist_dict['class'][idx]),
            acousticness=float(playlist_dict['acousticness'][idx]),
            danceability=float(playlist_dict['danceability'][idx]),
            energy=float(playlist_dict['energy'][idx]),
            instrumentalness=float(playlist_dict['instrumentalness'][idx]),
            liveness=float(playlist_dict['liveness'][idx]),
            key=float(playlist_dict['key'][idx]),
            loudness=float(playlist_dict['loudness'][idx]),
            mode=float(playlist_dict['mode'][idx]),
            tempo=float(playlist_dict['tempo'][idx]),
            valence=float(playlist_dict['valence'][idx]),
            rating=0,
            user_rating=0
            )
        songs.append(song)
    await insert_songs(songs)

async def get_songs(title: Union[str, None], user_id:str = '', order_by: str = 'idx', order: Literal['asc', 'desc'] = 'asc', offset: int = 0, limit: int = 10):
    order_by_rating = order_by == 'rating' or order_by == 'user_rating'
    if order_by_rating:
        # Joined column
        order_by = 'idx'
    songs = await get_songs_dl(title, order_by, order, offset, limit)
    if songs:
        song_mapping = await get_song_ratings([(song.idx, song.id) for song in songs], user_id)
        for song in songs:
            mapping_key = f'{song.id}_{song.idx}'
            if mapping_key in song_mapping:
                song.rating = song_mapping[mapping_key]['avg_rating']
                song.user_rating = song_mapping[mapping_key]['user_rating']
    if order_by_rating:
        songs.sort(key= lambda x : (x.rating, x.user_rating), reverse=order == 'desc')
    return songs

async def rate_song(song_idx: int, song_id: str, user_id: str, rating: float):
    return await rate_song_dl(song_idx, song_id, user_id, rating)

async def get_song_by_idx_id(idx: int, id: str):
    return await get_song_by_idx_id_dl(idx, id)