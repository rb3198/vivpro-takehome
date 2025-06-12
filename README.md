# VivPro Take Home Assignment

## Overview

This project is the implementation of the Take Home Project for Round 2 of the VivPro Interview Process.  
As a full-stack developer, I've implemented all the parts of the assignment.

## Assumptions

1. The song data is **inherently public**. A login is <u>not</u> required to view the songs.
2. However, the user should be **logged in to rate the song.**
3. Each song is identified using a _compound key_ consisting of **(id, idx)**. I assumed this since it was not guaranteed if any field would be unique in the assignment description.
4. Auth is not a priority:
   - Minimal user info is stored and displayed. Just the name and username.
   - Comprehensive Auth is not implemented due to limited time - Forgot Password is not implemented, since we don't store emails.

## Website Features

- **Three Tabs:** Songs Table, Analytics, and Login
- **Fully Responsive UI** with a **light/dark theme toggle**, inspired by vivpro.ai’s aesthetics
- **Songs Table:**
  - Displays all songs in a paginated view
  - Searchable by title using a search bar
  - Sortable by clicking on any column header
  - Supports downloading the visible data as CSV
- **Analytics Tab:**
  - Contains an animated **scatterplot** (X vs Y) and **histogram** (1D distribution)
  - Built using **D3.js**
- **Login/Register:**
  - Forms for account creation and login
  - Minimal UX design for the scope of this assignment
- No UI libraries or component kits used — built from scratch with React + TypeScript + SASS

## Loading Songs into the Server

On startup, the backend reads from a JSON file whose path can be provided via the `--playlist-path` argument (defaults to `./playlist.json`).  
If the file exists and follows the expected format, all songs are loaded into the SQLite database **only if they do not already exist**.

## API Design

APIs follow strict REST conventions and are implemented using FastAPI.

- **Authentication:**

  - `POST /api/sessions`: Logs in a user. On success, returns `201` and sets a session cookie
  - `DELETE /api/sessions`: Logs out the user and responds with a `delete-cookie` header
  - `POST /users/`: Registers a new user. Returns `201` on success

- **Songs:**
  - `GET /api/songs`: Fetches all songs. Accepts optional query params:
    - `title`: Filter by title
    - `offset` and `limit`: For pagination
    - If a valid session cookie is present, returns user’s rating for each song.
    - If the session is invalid, returns `401` with a `delete-cookie` header. The client is expected to log out and refetch without the cookie — in which case, only average ratings are shown
  - `PUT /api/songs/{id}/{idx}/rating`: Allows a logged-in user to rate a song

## Tech Stack Used

### Backend

- **FastAPI** for API development
- **SQLite** as the database for simplicity and modularity
- **Docker** for setup and portability

### Frontend

- **React** + **TypeScript**
- **Vite** for lightning-fast development experience
- **SASS** for custom styling
- **D3.js** for data visualizations
- **react-tooltip** for tooltips
- No UI component libraries were used

### Tooling

- **VSCode Dev Containers** configured for full-stack debugging
- Environment-aware behavior:
  - Dev: Separate frontend and backend servers, CORS allowed only from 5173
  - Prod: Single server setup with frontend statically served by FastAPI

## Dev Environment Setup

### Docker Setup (Recommended)

**System Requirements**: Docker

1. Build the development image:

```
docker build -f Dockerfile.dev -t vivpro-dev .
```

2. Run the container:

```
docker run -v <absolute path to your db>:/app/db/main.db
-p 5000:5000 -p 5173:5173
vivpro-dev
```

- Optionally, pass a `--playlist-path` argument to the backend server at runtime.

### Manual Setup

**System Requirements**: Python, Node.js

1. Install backend dependencies:

```
pip install -r requirements.txt
```

2. Install frontend dependencies:

```
cd ui
npm install
```

3. Run the backend and frontend separately:

- Frontend:
  ```
  cd ui
  npm run dev
  ```
- Backend:
  ```
  python main.py --env dev --reload --playlist-path ./playlist.json
  ```

## Production Setup using Docker

**System Requirements**: Docker

1. Build the production image:

```
docker build -f Dockerfile -t vivpro-prod .
```

2. Run the container:

```
docker run -v ${PWD}/db/main.db:/app/db/main.db
-p 5000:5000
vivpro-prod
```

- On production, Vite bundles the frontend into static files, which FastAPI serves directly.
- Only one server runs in production — no CORS configuration is needed.

## The Website

The deployed website simulates a real-world product experience with login-gated interactions, real-time visualizations, and sortable/searchable data. It's optimized for both developer convenience and user experience, built from the ground up using web standards and minimal tooling.
