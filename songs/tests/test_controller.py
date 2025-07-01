from datetime import datetime, timezone, timedelta
import pytest
from httpx import ASGITransport, AsyncClient
from fastapi import FastAPI, HTTPException, status
from unittest.mock import AsyncMock, Mock, patch

# Include the router before testing
from auth.entities.session import Session
from songs.controller import songs_api
from songs.entities.song import Song

valid_session = {"user_id": "123", "id": "abc", "expires_at": datetime.now(timezone.utc) + timedelta(days=7)}

@pytest.fixture
def session():
    return valid_session

@pytest.fixture
def mock_req_with_cookie():
    class DummyRequest:
        cookies = {"session_id": "abc"}
    return DummyRequest()

@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(songs_api)
    return app

@pytest.fixture
def app_with_session(session: Session):
    from auth.controller import verify_session
    app = FastAPI()
    app.include_router(songs_api)
    async def override_verify_session():
        return session
    app.dependency_overrides[verify_session] = override_verify_session
    return app

@pytest.fixture
async def async_client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.fixture
async def async_client_with_session(app_with_session):
    transport = ASGITransport(app=app_with_session)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@patch("songs.controller.get_songs", new_callable=AsyncMock)
@patch("songs.controller.validate_get_songs_req")
@patch("songs.controller.verify_session", new_callable=AsyncMock)
async def test_get_songs_success(mock_verify_session: AsyncMock, mock_validate: Mock, mock_get_songs: AsyncMock, async_client: AsyncClient):
    mock_verify_session.return_value = valid_session
    mock_get_songs.return_value = [{"title": "test"}]
    response = await async_client.get("/songs/?title=love&limit=5&order=desc")

    assert response.status_code == status.HTTP_200_OK
    mock_verify_session.assert_awaited_once()
    mock_validate.assert_called_once_with("idx", "love")
    mock_get_songs.assert_awaited_once_with("love", "123", "idx", "desc", 0, 5)
    assert response.json() == [{"title": "test"}]

@patch("songs.controller.get_songs", new_callable=AsyncMock)
@patch("songs.controller.verify_session", new_callable=AsyncMock)
@pytest.mark.parametrize("bad_title, error_msg", [("", "String should have at least 1 character"), (" ", "Empty title not allowed.")])
async def test_get_songs_req_bad_title_failure(mock_verify_session: AsyncMock, mock_get_songs: AsyncMock, bad_title: str, error_msg: str, async_client: AsyncClient):
    mock_verify_session.return_value = valid_session
    result = await async_client.get(f"/songs/?title={bad_title}")
    assert result.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert result.json()['detail'][0]['msg'] == error_msg
    mock_verify_session.assert_awaited_once()
    mock_get_songs.assert_not_awaited()
    
@patch("songs.controller.get_songs", new_callable=AsyncMock)
@patch("songs.controller.verify_session", new_callable=AsyncMock)
async def test_get_songs_req_bad_order_by_failure(mock_verify_session: AsyncMock, mock_get_songs: AsyncMock, async_client: AsyncClient):
    mock_verify_session.return_value = valid_session
    result = await async_client.get(f"/songs/?order_by=blah")
    assert result.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "the value of `order_by` parameter must be one of the fields of the `Song` entity, i.e. one of " in result.json()['detail'][0]['msg']
    mock_verify_session.assert_awaited_once()
    mock_get_songs.assert_not_awaited()

@patch("songs.controller.get_song_by_idx_id", new_callable=AsyncMock)
@patch("songs.controller.rate_song", new_callable=AsyncMock)
async def test_rate_song_success(mock_rate_song: AsyncMock, mock_get_song_by_idx_id: AsyncMock, async_client_with_session: AsyncClient):
    mock_get_song_by_idx_id.return_value = Song(1, "1", "test", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    request = { "rating": 3 }
    result = await async_client_with_session.put("/songs/1/1/rating", json=request)
    assert result.status_code == status.HTTP_204_NO_CONTENT
    mock_rate_song.assert_awaited_once()
    mock_rate_song.assert_awaited_once_with(1, "1", "123", 3)