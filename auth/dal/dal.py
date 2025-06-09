from typing import Union
from auth.entities import User
from auth.entities import Session
from connection_pool import connection_pool


async def get_user(username: str):
    sql = '''
    SELECT id, username, name, pwd_hash
    FROM users
    WHERE username = ?
    '''
    values = [username]
    async with connection_pool.connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, values)
        rows = cur.fetchall()
        if rows:
            (id, username, name, pwd_hash) = rows[0]
            return User(id, username, name, pwd_hash)
        return None
    
async def create_user(user: User):
    sql = '''
        INSERT INTO users (id, username, name, pwd_hash) VALUES (?, ?, ?, ?)
    '''
    values = [user.id, user.username, user.name, user.pwd_hash]
    async with connection_pool.connection() as conn:
        conn.execute(sql, values)
        conn.commit()

async def create_session(session_id: str, user_id: str, expires_at: float):
    sql = '''
        INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)
    '''
    values = [session_id, user_id, expires_at]
    async with connection_pool.connection() as conn:
        conn.execute(sql, values)
        conn.commit()

async def get_session(session_id: str) -> Union[Session, None]:
    sql = '''
    SELECT id, user_id, expires_at
    FROM sessions
    WHERE id = ?
    '''
    values = [session_id]
    async with connection_pool.connection() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, values)
        rows = cursor.fetchall()
        if not rows:
            return None
        (id, user_id, expires_at) = rows[0]
        return {
            'id': id,
            'user_id': user_id,
            'expires_at': expires_at
        }
    
async def delete_session(session_id: str) -> bool:
    sql = '''
    DELETE FROM sessions
    WHERE id = ?
    '''
    values = [session_id]
    async with connection_pool.connection() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, values)
        conn.commit()
        return cursor.rowcount > 0
    