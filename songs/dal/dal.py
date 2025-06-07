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