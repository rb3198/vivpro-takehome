from contextlib import asynccontextmanager
import json
import logging
import os
import subprocess
from typing import Union
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from starlette.exceptions import HTTPException
import argparse
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from auth.business.constants import SESSION_ID_COOKIE
from common.entities import ErrorResponse
from songs.entities import PlaylistInput
from startup_utils import add_middlewares, validate_json_file, add_startup_arguments, register_routes
from songs.business import load_playlist

load_dotenv()

ENV = os.getenv("ENV")
LAUNCHER = os.getenv("LAUNCHER")
vite_process = None

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
args = add_startup_arguments(parser)

# Setup Modules
async def setup_modules(app: FastAPI, playlist_path: Union[str, None]):
    # pre-load data
    await load_playlist_data(playlist_path)
    # Setup routes
    register_routes(app, ENV)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup modules across the application
    await setup_modules(app, args.playlist_path)
    yield
    if ENV == "dev" and LAUNCHER != "vs_code" and vite_process:
        print("Closing Vite server")
        vite_process.terminate()

app = FastAPI(lifespan=lifespan)
# Add middlewares
add_middlewares(app, ENV)

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
    res = JSONResponse(
        ErrorResponse(ex.status_code, detail).__dict__,
        status_code=ex.status_code
    )
    if ex.status_code == status.HTTP_401_UNAUTHORIZED:
        res.delete_cookie(SESSION_ID_COOKIE)
    return res

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.log(3, exc)
    return JSONResponse(
        ErrorResponse(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error").__dict__,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

#endregion

if __name__ == "__main__":
    print(ENV, LAUNCHER)
    if ENV == "dev" and LAUNCHER != "vs_code":
        process = subprocess.Popen(
            "npm run dev",
            cwd="./ui",
            shell=True 
        )
        vite_process = process
        print(f"Vite dev server started with PID: {process.pid}")
    import uvicorn
    uvicorn.run("main:app", port=args.port, host=args.host, reload=args.reload)
