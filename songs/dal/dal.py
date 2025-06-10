from typing import Literal, Union
from songs.entities import Song
from connection_pool import connection_pool
from dataclasses import fields

from songs.entities import Rating

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
    class as song_class
    FROM songs
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
        ) in rows:
            songs.append(
                Song(
                    idx,
                    id,
                    res_title,
                    0,
                    0,
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

async def get_song_ratings(songs: list[tuple[int, str]], user_id: str = '') -> dict[str, Rating]:
    sql = '''
    SELECT 
        s.id,
        s.idx,
        COALESCE(ar.avg_rating, 0) AS avg_rating,
        COALESCE(r.rating, 0) AS rating
    FROM songs s
    LEFT JOIN ratings r ON s.id = r.song_id AND s.idx = r.song_idx AND r.user_id = ?
    LEFT JOIN avg_ratings ar ON s.id = ar.song_id AND s.idx = ar.song_idx
    '''
    values: list[Union[str, int, float]] = [user_id]
    idx_list = []
    id_list = []
    if songs:
        params = ''
        for (idx, id) in songs:
            params += '?,'
            idx_list.append(idx)
            id_list.append(id)
        params = params[0:-1]
        values.extend(idx_list)
        values.extend(id_list)
        sql += f'''
        WHERE s.idx IN ({params}) AND s.id IN ({params})
        '''
    async with connection_pool.connection() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, values)
        rows = cursor.fetchall()
        mapping: dict[str, Rating] = dict()
        if rows:
            for (id, idx, avg_rating, user_rating) in rows:
                mapping[f'{id}_{idx}'] = {
                    'avg_rating': avg_rating,
                    'user_rating': user_rating
                }
        return mapping

async def get_song_by_idx_id(song_idx: int, song_id: str):
    sql = '''
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
    class as song_class
    FROM songs
    WHERE song_idx = ? AND song_id = ?
    '''
    values = [song_idx, song_id]
    async with connection_pool.connection() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, values)
        rows = cursor.fetchall()
        if rows:
            (
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
                song_class
            ) = rows[0]
            return Song(
                idx,
                id,
                res_title,
                0,
                0,
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
        return None

async def rate_song(song_idx: int, song_id: str, user_id: str, rating: float):
    sql = '''
    INSERT INTO ratings (song_idx, song_id, user_id, rating)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(song_idx, song_id, user_id)
    DO UPDATE SET rating = excluded.rating;
    '''
    values = [song_idx, song_id, user_id, rating]
    async with connection_pool.connection() as conn:
        conn.execute(sql, values)
        conn.commit()