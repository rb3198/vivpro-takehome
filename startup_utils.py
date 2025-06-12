from argparse import ArgumentParser
from typing import Union, cast
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from pydantic_core import ErrorDetails

from songs.entities.playlist_input import PlaylistInput
from auth.controller import users_api, auth_api
from songs.controller import songs_api


def validate_json_file(data: object):
    '''
    Function to validate the given data against the `PlaylistInput` class.

    :raises ValidationError: If data is improperly formatted, or if any key contains an unequal # of keys.
    '''
    res = PlaylistInput.model_validate(data)
    value_dicts: list[dict[str, Union[int, float, str]]] = list(res.__dict__.values())
    if not value_dicts:
        print("No data in file, continuing as-is.")
        return
    reference_keys = set(value_dicts[0].keys())
    reference_len = len(reference_keys)
    for key, value in res.__dict__.items():
        value_dict = cast(dict[str, Union[int, float, str]], value)
        keys = set(value_dict.keys())
        if len(keys) != reference_len:
            print(f"Entry {key} does not have {reference_len} keys: {keys}")
            raise ValidationError([
                ErrorDetails(
                    type='value_error.dict.keys_length_mismatch',
                    loc=(key,),
                    msg=f"Entry {key} has unequal number of entries: {len(keys)} vs {reference_len}",
                    input=value_dict
                )
            ])
        if keys != reference_keys:
            raise ValidationError([
                ErrorDetails(
                    type='value_error.dict.keys_mismatch',
                    loc=(key,),
                    msg=f"Entry {key} has different keys: {keys} vs {reference_keys}",
                    input=value_dict
                )
            ])
        
def add_startup_arguments(parser: ArgumentParser):
    parser.add_argument(
        "-pp", 
        "--playlist_path", 
        help="Path of the file to pre-load song data.\nIf no file path is given, the program loads an empty / already existing database."
    )
    parser.add_argument("-p", "--port", type=int, default=8000)
    parser.add_argument("--env", choices=["dev", "prod"], default="dev")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload in uvicorn")
    args = parser.parse_args()
    return args

def register_routes(app: FastAPI):
    app.include_router(auth_api)
    app.include_router(songs_api)
    app.include_router(users_api)

def add_middlewares(app: FastAPI, env: Union[str, None] = "dev"):
    # Add CORS on Dev environment for frontend requests.
    if env == "dev":
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:5173"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
