from typing import Annotated, Literal, Union
from fastapi import APIRouter, Query

from .validations import validate_get_songs_req
from .business import get_songs as get_songs_bl

songs_api = APIRouter(prefix='/api/songs', tags=['Songs API'])


@songs_api.get("/")
async def get_songs(
    title: Annotated[Union[str, None], Query(min_length=1, max_length=256)] = None,
    order_by: str = 'idx',
    order: Literal['asc', 'desc'] = 'asc',
    offset: int = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10
):
    # Auth failure validation
    validate_get_songs_req(order_by, title)
    return await get_songs_bl(title, order_by, order, offset, limit)

@songs_api.put("/{id}/{idx}/rating")
async def rate_song():
    pass #TODO: After the auth implementation