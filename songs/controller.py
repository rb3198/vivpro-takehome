from typing import Annotated, Literal, Union
from fastapi import APIRouter, Depends, Query, Request
from auth.entities import Session
from auth.business import verify_session
from .validations import validate_get_songs_req
from .business import get_songs as get_songs_bl

songs_api = APIRouter(prefix='/api/songs', tags=['Songs API'])

async def get_optional_session(request: Request):
    return await verify_session(request, optional=True)

@songs_api.get("/")
async def get_songs(
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
    return await get_songs_bl(title, user_id, order_by, order, offset, limit)
