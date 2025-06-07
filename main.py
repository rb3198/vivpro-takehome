import asyncio
import json
import os
from typing import Union
from fastapi import FastAPI
import argparse
from pydantic import ValidationError
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
                playlist: dict[str, dict[str, Union[int, float, str]]] = json.load(f)
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


async def setup_modules(app: FastAPI, playlist_path: Union[str, None]):
    # pre-load data
    await load_playlist_data(playlist_path)
    # Setup routes

app = FastAPI()

@app.get("/")
def hello():
    return "Hello World!"

async def startup():
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
    # Setup modules across the application
    await setup_modules(app, args.playlist_path)
    import uvicorn
    uvicorn.run("main:app", port=args.port, reload=args.reload)

if __name__ == "__main__":
    asyncio.run(startup())
