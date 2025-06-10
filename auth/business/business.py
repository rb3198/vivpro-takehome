from fastapi import HTTPException, Request, status
import bcrypt
from uuid6 import uuid6
from auth.business.constants import SESSION_ID_COOKIE
from auth.dal import get_user as get_user_db, create_user as create_user_db, create_session as create_session_db, get_session, delete_session as delete_session_dl
from auth.entities import UserCreation, User, Session
from datetime import datetime, timedelta, timezone

async def get_user(username: str):
    return await get_user_db(username)

async def create_user(user_creation: UserCreation):
    user = User(
        str(uuid6()),
        user_creation.username, 
        user_creation.name, 
        bcrypt.hashpw(user_creation.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    )
    return await create_user_db(user)

#region Session Management
async def create_session(user: User):
    session_id = str(uuid6())
    user_id = user.id
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await create_session_db(session_id, user_id, expires_at.timestamp())
    session: Session = {
        'id': session_id,
        'user_id': user_id,
        'expires_at': expires_at.timestamp()
    }
    return session

async def verify_session(req: Request, optional = False):
    auth = req.cookies.get(SESSION_ID_COOKIE)
    if not auth:
        if not optional:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f'User must be logged in to view this info. Pass the session cookie with your request.'
            )
        return None
    session_id = auth
    session = await get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f'Given session does not exist.'
        )
    if datetime.now(timezone.utc).timestamp() > session['expires_at']:
        await delete_session(session_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f'Session expired.'
        )
    # Valid session, proceed.
    return session
    
async def delete_session(session_id: str):
    return await delete_session_dl(session_id)
    # In a production system, I'd queue this operation if not successfully done.

#endregion