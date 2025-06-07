from songs.dal import insert_songs
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
            )
        songs.append(song)
    await insert_songs(songs)