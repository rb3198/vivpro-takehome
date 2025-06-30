from unittest.mock import patch, AsyncMock
import bcrypt
from httpx import ASGITransport, AsyncClient
from fastapi import status, FastAPI
import pytest
from auth.controller import auth_api
from auth.entities.session import Session
from auth.entities.user import User

#region Fixtures
@pytest.fixture
def app(valid_session: Session):
    from auth.controller import verify_session
    app = FastAPI()
    app.include_router(auth_api)
    async def override_verify_session():
        return valid_session

    app.dependency_overrides[verify_session] = override_verify_session
    return app

@pytest.fixture
async def async_client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.fixture
def sample_user():
    return type("User", (), {
        "id": 1,
        "username": "paul_mccartney",
        "name": "Paul McCartney",
        "pwd_hash": bcrypt.hashpw(b"password", bcrypt.gensalt()).decode("utf-8")
    })

@pytest.fixture
def valid_session():
    return {"id": "sess123", "user_id": 1}

#endregion

#region Tests

@patch("auth.controller.get_user", new_callable=AsyncMock)
@patch("auth.controller.create_session", new_callable=AsyncMock)
async def test_login_success(mock_create_session: AsyncMock, mock_get_user: AsyncMock, async_client: AsyncClient, sample_user: User):
    mock_get_user.return_value = sample_user
    mock_create_session.return_value = {"id": "sess123"}

    creds = {"username": sample_user.username, "password": "password"}
    response = await async_client.post("/sessions/", json=creds)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.cookies.get("session_id") == "sess123"
    mock_get_user.assert_awaited_once_with(sample_user.username)
    mock_create_session.assert_awaited_once()

@patch("auth.controller.get_user", new_callable=AsyncMock)
async def test_login_wrong_username(mock_get_user: AsyncMock, async_client: AsyncClient):
    mock_get_user.return_value = None
    creds = {"username": "ghost", "password": "Milk123*"}
    response = await async_client.post("/sessions/", json=creds)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()['detail'] == 'User with username ghost does not exist.'
    mock_get_user.assert_awaited_once_with("ghost")

@patch("auth.controller.get_user", new_callable=AsyncMock)
async def test_login_wrong_password(mock_get_user: AsyncMock, async_client: AsyncClient, sample_user: User):
    sample_user.pwd_hash = bcrypt.hashpw(b"correctpass", bcrypt.gensalt()).decode("utf-8")
    mock_get_user.return_value = sample_user
    creds = {"username": sample_user.username, "password": "wrongpass"}
    response = await async_client.post("/sessions/", json=creds)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert len(response.cookies) == 0
    mock_get_user.assert_called_once_with(sample_user.username)

@patch("auth.controller.delete_session", new_callable=AsyncMock)
@patch("auth.controller.verify_session", new_callable=AsyncMock)
async def test_logout_success(mock_verify_session: AsyncMock, mock_delete_session: AsyncMock, async_client: AsyncClient, valid_session):
    mock_verify_session.return_value = valid_session
    mock_delete_session.return_value = True

    response = await async_client.delete("/sessions/")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert "session_id" not in response.cookies
    mock_delete_session.assert_awaited_once_with(valid_session['id'])

@patch("auth.controller.delete_session", new_callable=AsyncMock)
@patch("auth.controller.verify_session", new_callable=AsyncMock)
async def test_logout_failure(mock_verify_session: AsyncMock, mock_delete_session: AsyncMock, async_client: AsyncClient, valid_session):
    mock_verify_session.return_value = valid_session
    mock_delete_session.return_value = False

    response = await async_client.delete("/sessions/")
    assert response.status_code == status.HTTP_404_NOT_FOUND

#endregion