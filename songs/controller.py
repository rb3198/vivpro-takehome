from typing import Annotated, Literal, Union
from fastapi import APIRouter, Body, Depends, Query, Request, HTTPException, Response, status
from auth.entities import Session
from auth.business import verify_session
from .validations import validate_get_songs_req
from .business import get_songs, rate_song, get_song_by_idx_id

songs_api = APIRouter(prefix='/songs', tags=['Songs API'])

async def get_optional_session(request: Request):
    return await verify_session(request, optional=True)

@songs_api.get("/")
async def service_get_songs(
    session: Session = Depends(get_optional_session),
    title: Annotated[Union[str, None], Query(min_length=1, max_length=256)] = None,
    order_by: str = 'idx',
    order: Literal['asc', 'desc'] = 'asc',
    offset: int = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10
):
    # Auth failure validation
    validate_get_songs_req(order_by, title)
    user_id = session['user_id'] if session and 'user_id' in session else ''
    return await get_songs(title, user_id, order_by, order, offset, limit)

@songs_api.put("/{song_idx}/{song_id}/rating")
async def service_rate_song(song_idx: int, song_id: str, rating: Annotated[float, Body(embed=True)], session: Session = Depends(verify_session)):
    if not session or 'user_id' not in session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid session object')
    user_id = session['user_id']
    song = await get_song_by_idx_id(song_idx, song_id)
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='The specified song could not be found.')
    await rate_song(song_idx, song_id, user_id, rating)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
