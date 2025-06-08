from contextlib import asynccontextmanager
import json
import logging
import os
from typing import Union
from fastapi import FastAPI, Request, status
from starlette.exceptions import HTTPException
import argparse
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from common.entities import ErrorResponse
from songs.entities import PlaylistInput
from songs.controller import songs_api
from startup_validations import validate_json_file
from songs.business import load_playlist

async def load_playlist_data(playlist_path: Union[str, None]):
    if playlist_path:
        exists = os.path.exists(playlist_path)
        if not exists:
            print("The specified path to playlist does not exist on the server. Proceeding without any data loading.")
            return
        with open(playlist_path, 'r') as f:
            try:
                playlist: PlaylistInput = json.load(f)
                validate_json_file(playlist)
                await load_playlist(playlist)
            except json.JSONDecodeError as jde:
                print(f"Error: Unable to decode JSON: {jde}")
                print("Continuing without loading any data")
            except ValidationError as ve:
                print(f"The given JSON was not valid: {ve}")
                print("Continuing without loading any data")
            except Exception as e:
                print(f"An unknown error occured {e}.\nContinuing without loading any data.")
    else:
        print("No file specified to load playlist data into the database. Proceeding without any data loading.")

# Add arg parse arguments
parser = argparse.ArgumentParser(description="Web server for VivPro Songs")
parser.add_argument(
    "-pp", 
    "--playlist_path", 
    help="Path of the file to pre-load song data.\nIf no file path is given, the program loads an empty / already existing database."
)
parser.add_argument("-p", "--port", type=int, default=8000)
parser.add_argument("--env", choices=["dev", "prod"], default="dev")
parser.add_argument("--reload", action="store_true", help="Enable auto-reload in uvicorn")

args = parser.parse_args()

async def setup_modules(app: FastAPI, playlist_path: Union[str, None]):
    # pre-load data
    await load_playlist_data(playlist_path)
    # Setup routes
    app.include_router(songs_api, tags=["Songs API"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup modules across the application
    await setup_modules(app, args.playlist_path)
    yield

app = FastAPI(lifespan=lifespan)

#region Exception Handlers
@app.exception_handler(RequestValidationError)
async def req_validation_failure_handler(req: Request, ex: RequestValidationError):
    error = ex.errors()[0] if ex.errors() else {}
    field = error['loc'][-1] if 'loc' in error else None
    message = ''
    for error in ex.errors():
        field = error['loc'][-1] if 'loc' in error else None
        if field:
            message += f'\n {field}: {error['msg']}'
    if len(message):
        message = 'The following input fields had errors:' + message
    return JSONResponse(
        ErrorResponse(status.HTTP_422_UNPROCESSABLE_ENTITY, message).__dict__,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(req: Request, ex: HTTPException):
    detail = ex.detail if isinstance(ex.detail, str) else ex.detail.get("error", str(ex.detail))
    return JSONResponse(
        ErrorResponse(ex.status_code, detail).__dict__,
        status_code=ex.status_code
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.log(3, exc)
    return JSONResponse(
        ErrorResponse(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error").__dict__,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

#endregion
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=args.port, reload=args.reload)
