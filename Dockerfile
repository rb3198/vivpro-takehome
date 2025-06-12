FROM python:3.13-alpine

WORKDIR /app

# Install Node.js and npm
RUN apk add --no-cache nodejs npm
# Install Python packages
COPY ./pyproject.toml .
RUN pip install --no-cache-dir .
# Install NPM packages
COPY ./ui/package.json ./ui/package-lock.json ./ui/
WORKDIR /app/ui
RUN npm ci

WORKDIR /app
COPY . .

# Build Vite
WORKDIR  /app/ui
RUN npm run build

WORKDIR /app

ENV ENV=prod
EXPOSE 5000
ARG playlistPath=./playlist.json
ENV PLAYLIST_PATH=$playlistPath
CMD ["python", "main.py", "--port", "5000", "--host", "0.0.0.0", "-pp", "$PLAYLIST_PATH"]