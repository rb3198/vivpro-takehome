import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from auth.business import create_user, get_user, verify_session, create_session, delete_session
from auth.entities import UserCreation, Session, Credentials
from auth.business.constants import SESSION_ID_COOKIE

users_api = APIRouter(prefix='/api/users', tags=['User API'])
auth_api = APIRouter(prefix='/api/sessions', tags=['API for creating sessions'])

@users_api.get('/{username}')
async def service_get_user(username: str, session: Session = Depends(verify_session)):
    user = await get_user(username)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f'A user with username {username} does not exist.')
    if not session or session['user_id'] != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, f'A user may access only their own info.')
    return {
        'id': user.id,
        'username': user.username,
        'name': user.name
    }

@users_api.post('/')
async def register(user: UserCreation):
    # Pydantic takes care of the user entity validation.
    existing_user = await get_user(user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='User with the same username already exists. Try a different username.'
        )
    await create_user(user)
    return Response(status_code=status.HTTP_201_CREATED)

@auth_api.post('/')
async def login(res: Response, creds: Credentials):
    username = creds.username
    password = creds.password
    existing_user = await get_user(username)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'User with username {username} does not exist.'
        )
    password_ok = bcrypt.checkpw(password.encode('utf-8'), existing_user.pwd_hash.encode('utf-8'))
    if not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid credentials'
        )
    session_id = (await create_session(existing_user))['id']
    res.set_cookie(key=SESSION_ID_COOKIE, value=session_id, httponly=True, secure=True, samesite="none")
    res.status_code = status.HTTP_201_CREATED
    return res

@auth_api.delete('/')
async def logout(session: Session = Depends(verify_session)):
    deleted = await delete_session(session['id'])
    if not deleted:
        # Said session was not present
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return Response(None, status.HTTP_204_NO_CONTENT)