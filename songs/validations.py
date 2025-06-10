from typing import Union, get_type_hints
from fastapi.exceptions import RequestValidationError
from .entities import Song


def validate_get_songs_req(order_by: str, title: Union[str, None] = None):
    song_fields = set(get_type_hints(Song).keys())
    if order_by not in song_fields:
        raise RequestValidationError([{
            'loc': ['query', 'order_by'],
            'msg': f'the value of `order_by` parameter must be one of the fields of the `Song` entity, i.e. one of {song_fields}'
        }])
    if title is not None and not len(title.strip()):
        raise RequestValidationError([{
            'loc': ['url', 'title'],
            'msg': 'Empty title not allowed.'
        }])