from typing import Literal, Union
from songs.entities import Song
from connection_pool import connection_pool
from dataclasses import fields

async def insert_songs(songs: list[Song]):
    columns = [
        (f.name, f.metadata.get('db', {}).get('name'))
        for f in fields(Song)
        if f.metadata.get('db', {}).get('insert') is True
    ]
    attr_names, column_names = zip(*columns)
    col_str = ', '.join(column_names)
    col_params = ', '.join(['?'] * len(column_names))
    sql = f'''
        INSERT OR IGNORE INTO songs ({col_str}) VALUES ({col_params})
    '''
    values = [
        [getattr(song, attr) for attr in attr_names] for song in songs
    ]
    async with connection_pool.connection() as conn:
        conn.executemany(sql, values)
        conn.commit()

async def get_songs(title: Union[str, None], order_by: str, order: Literal['asc', 'desc'], offset: int, limit: int):
    column_mapping = { f.name: f.metadata['db']['name'] for f in fields(Song) }
    values = []
    sql = f'''
    SELECT idx,
    id,
    title,
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
    class as song_class,
	ROUND(COALESCE(avg_rating, 0), 1) as rating
    FROM songs LEFT JOIN avg_ratings ON songs.id = avg_ratings.song_id AND songs.idx = avg_ratings.song_idx
    '''
    if title:
        sql += f'''
        WHERE title LIKE ?
        '''
        values.append(f'%{title}%')
    sql += f'''
        ORDER BY {column_mapping[order_by]} {order.upper()}
        LIMIT ?
        OFFSET ?
    '''
    values.extend([limit, offset])
    async with connection_pool.connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, values)
        rows = cur.fetchall()
        songs: list[Song] = list()
        for (
            idx, 
            id, 
            res_title, 
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
            rating
        ) in rows:
            songs.append(
                Song(
                    idx,
                    id,
                    res_title,
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
                    song_class
                )
            )
        return songs
