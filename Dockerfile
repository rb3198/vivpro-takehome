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

COPY . .

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]