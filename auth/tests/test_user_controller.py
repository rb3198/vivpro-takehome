import bcrypt
import pytest
from httpx import ASGITransport, AsyncClient
from fastapi import status
from fastapi import FastAPI
from auth.controller import users_api
from unittest.mock import AsyncMock, patch

from auth.entities.session import Session
from auth.entities.user import User

#region Fixtures
@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(users_api)
    return app

@pytest.fixture
def app_with_session(valid_session: Session):
    from auth.controller import verify_session
    app = FastAPI()
    app.include_router(users_api)
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
async def async_client_with_session(app_with_session):
    transport = ASGITransport(app=app_with_session)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.fixture
def valid_session():
    return {"id": "sess123", "user_id": "1"}

@pytest.fixture
def sample_user():
    return type("User", (), {
        "id": 2,
        "username": "paul_mccartney",
        "name": "Paul McCartney",
        "pwd_hash": bcrypt.hashpw(b"password", bcrypt.gensalt()).decode("utf-8")
    })

#endregion
# region Mock registration objects
valid_user_registration_data = {
    "username": "jmayer",
    "name": "John Mayer",
    "password": "NewPassword98*"
}

invalid_registration_data = [
    (
        {
            "username": "jm",
            "name": valid_user_registration_data["name"],
            "password": valid_user_registration_data["password"]
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should have at least 3 characters"
    ),
    (
        {
            "username": "jm m",
            "name": valid_user_registration_data["name"],
            "password": valid_user_registration_data["password"]
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should match pattern '^[0-9a-zA-Z_-]+$'"
    ),
    (
        {
            "username": "jm*m",
            "name": valid_user_registration_data["name"],
            "password": valid_user_registration_data["password"]
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should match pattern '^[0-9a-zA-Z_-]+$'"
    ),
    (
        {
            "username": "RDROmx4Uw75WnkbgZiwSjJhiFC5aQ3w",
            "name": valid_user_registration_data["name"],
            "password": valid_user_registration_data["password"]
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should have at most 30 characters"
    ),
    # Name mistakes
    (
        ({
            "username": "jmayer",
            "name": "",
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should have at least 1 character"
    ),
    (
        ({
            "username": "jmayer",
            "name": "   ",
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "Value error, Name cannot be only spaces."
    ),
    (
        ({
            "username": "jmayer",
            "name": "a" * 101,
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should have at most 100 characters"
        # "String should match pattern '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':\"\\|,.<>\/?]).{8,}$'"
    ),
    (
        ({
            "username": "jmayer",
            "name": "John@Mayer",
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should match pattern '^[0-9a-zA-Z \\.\\-\\']+$'"
    ),
    (
        ({
            "username": "jmayer",
            "name": "John#Mayer",
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should match pattern '^[0-9a-zA-Z \\.\\-\\']+$'"
    ),
    (
        ({
            "username": "jmayer",
            "name": "John*Mayer",
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should match pattern '^[0-9a-zA-Z \\.\\-\\']+$'"
        # "String should match pattern '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':\"\\|,.<>\/?]).{8,}$'"
    ),
    (
        ({
            "username": "jmayer",
            "name": "John😊Mayer",
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should match pattern '^[0-9a-zA-Z \\.\\-\\']+$'"
    ),
    (
        ({
            "username": "jmayer",
            "name": "John\nMayer",
            "password": valid_user_registration_data["password"]
        }),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "String should match pattern '^[0-9a-zA-Z \\.\\-\\']+$'"
    ),
    
]
#endregion
#region Tests

@patch("auth.controller.get_user", new_callable=AsyncMock)
@patch("auth.controller.create_user", new_callable=AsyncMock)
async def test_register_success(mock_create_user: AsyncMock, mock_get_user: AsyncMock, async_client: AsyncClient):
    mock_get_user.return_value = None
    response = await async_client.post("/users/", json=valid_user_registration_data)
    assert response.status_code == status.HTTP_201_CREATED
    mock_get_user.assert_called_once_with("jmayer")
    mock_create_user.assert_awaited_once()

@patch("auth.controller.get_user", new_callable=AsyncMock)
@patch("auth.controller.create_user", new_callable=AsyncMock)
async def test_register_failure_conflict(mock_create_user: AsyncMock, mock_get_user: AsyncMock, async_client: AsyncClient):
    mock_get_user.return_value = User("123", "jmayer", "John Mayer", "NewPasswordHash")
    response = await async_client.post("/users/", json=valid_user_registration_data)
    assert response.status_code == status.HTTP_409_CONFLICT
    mock_get_user.assert_called_once_with("jmayer")
    mock_create_user.assert_not_awaited()

@patch("auth.controller.get_user", new_callable=AsyncMock)
@patch("auth.controller.create_user", new_callable=AsyncMock)
@pytest.mark.parametrize("invalid_user_data,expected_code,expected_message", invalid_registration_data)
async def test_register_failure_invalid_request(
    mock_create_user: AsyncMock,
    mock_get_user: AsyncMock,
    invalid_user_data,
    expected_code: int,
    expected_message: str,
    async_client: AsyncClient
):
    response = await async_client.post("/users/", json=invalid_user_data)
    assert response.status_code == expected_code
    response_json = response.json()
    assert len(response_json['detail']) == 1
    assert response_json['detail'][0]['msg'] == expected_message
    mock_create_user.assert_not_awaited()
    mock_get_user.assert_not_awaited()

@patch("auth.controller.get_user", new_callable=AsyncMock)
async def test_get_user_authorized(
    mock_get_user: AsyncMock,
    async_client_with_session: AsyncClient,
):
    username = "paul_mccartney"
    sample_user = type("User", (), {
        "id": "1",
        "username": username,
        "name": "Paul McCartney",
        "pwd_hash": bcrypt.hashpw(b"password", bcrypt.gensalt()).decode("utf-8")
    })
    mock_get_user.return_value = sample_user

    response = await async_client_with_session.get(f"/users/paul_mccartney")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["username"] == username
    mock_get_user.assert_awaited_once_with(username)

@patch("auth.controller.get_user", new_callable=AsyncMock)
async def test_get_user_unauthorized(
    mock_get_user: AsyncMock,
    async_client_with_session: AsyncClient,
    sample_user: User
):
    mock_get_user.return_value = sample_user

    response = await async_client_with_session.get(f"/users/{sample_user.username}")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    mock_get_user.assert_awaited_once()
#endregion