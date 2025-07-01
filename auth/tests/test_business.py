import bcrypt
from fastapi import HTTPException, Request, status
import pytest
from datetime import datetime, timedelta, timezone
from auth.business import get_user, create_user, create_session, verify_session, delete_session
from unittest.mock import Mock, AsyncMock, patch

from auth.entities.session import Session
from auth.entities.user import User
from auth.entities.user_creation import UserCreation

fixed_bytes = bcrypt.gensalt()
username = "rb3198"
id = "1"
name = "Ronit"
pwd_hash = bcrypt.hashpw("pwd_hash98B*".encode('utf-8'), fixed_bytes).decode('utf-8')
user_creation = UserCreation(username=username, name=name, password="pwd_hash98B*")
user = User(id, username, name, pwd_hash)


@patch("auth.business.business.get_user_db", new_callable=AsyncMock)
async def test_get_user_success(mock_get_user_db: AsyncMock):
    mock_get_user_db.return_value = User("1", username, "Ronit", pwd_hash)
    result = await get_user(username)
    assert result.__dict__ == user.__dict__
    mock_get_user_db.assert_awaited_once_with(username)
    mock_get_user_db.assert_awaited_once()

@patch("auth.business.business.get_user_db", new_callable=AsyncMock)
async def test_get_user_failure(mock_get_user_db: AsyncMock):
    attribute_name = "name"
    mock_get_user_db.side_effect = AttributeError(name=attribute_name)
    try:
        await get_user(username)
        pytest.fail("Get User should've failed on DB failure.")
    except AttributeError as ex:
        # Appropriate exception was thrown
        assert ex.name == attribute_name
        mock_get_user_db.assert_awaited_once_with(username)
        mock_get_user_db.assert_awaited_once()
    except Exception as ex:
        # Some other exception was thrown rather than the expected one.
        pytest.fail("An exception was thrown as expected, but its type was invalid.")

@patch("auth.business.business.uuid6", new_callable=Mock)
@patch("bcrypt.gensalt", new_callable=Mock)
@patch("auth.business.business.create_user_db", new_callable=AsyncMock)
async def test_create_user_success(mock_create_user_db: AsyncMock, mock_gen_salt: Mock, mock_uuid_6: Mock):
    mock_uuid_6.return_value = "1"
    mock_gen_salt.return_value = fixed_bytes
    await create_user(user_creation)
    mock_create_user_db.assert_awaited_once()
    assert mock_create_user_db.await_args
    args, _ = mock_create_user_db.await_args
    assert len(args) == 1
    assert args[0].__dict__ == user.__dict__
    mock_uuid_6.assert_called_once()

@patch("auth.business.business.uuid6", new_callable=Mock)
@patch("bcrypt.gensalt", new_callable=Mock)
@patch("auth.business.business.create_user_db", new_callable=AsyncMock)
async def test_create_user_failure(mock_create_user_db: AsyncMock, mock_gen_salt: Mock, mock_uuid_6: Mock):
    attribute_name = "name"
    try:
        mock_uuid_6.return_value = "1"
        mock_gen_salt.return_value = fixed_bytes
        mock_create_user_db.side_effect = AttributeError(name=attribute_name)
        await create_user(user_creation)
        pytest.fail("User creation should have failed on DB function failing")
    except AttributeError as ae:
        assert ae.name == attribute_name
        mock_uuid_6.assert_called_once()
    except Exception:
        pytest.fail("An exception was thrown as expected, but its type was invalid.")

@patch("auth.business.business.uuid6", new_callable=Mock)
@patch("auth.business.business.create_session_db", new_callable=AsyncMock)
@patch("auth.business.business.datetime", new_callable=Mock)
async def test_create_session_success(mock_datetime: Mock, mock_create_session_db: AsyncMock, mock_uuid6: Mock):
    mock_uuid6.return_value = "sess123"
    now = datetime.now(timezone.utc)
    expected_expiry = now + timedelta(days=7)
    mock_datetime.now.return_value = now
    mock_datetime.side_effect = lambda *args, **kwargs: datetime(*args, **kwargs)
    result = await create_session(user)

    expected_timestamp = expected_expiry.timestamp()
    mock_create_session_db.assert_awaited_once_with("sess123", user.id, expected_timestamp)

    assert result == {
        "id": "sess123",
        "user_id": user.id,
        "expires_at": expected_timestamp
    }
    mock_uuid6.assert_called_once()

@patch("auth.business.business.uuid6", new_callable=Mock)
@patch("auth.business.business.create_session_db", new_callable=AsyncMock)
@patch("auth.business.business.datetime", new_callable=Mock)
async def test_create_session_failure(mock_datetime: Mock, mock_create_session_db: AsyncMock, mock_uuid6: Mock):
    mock_uuid6.return_value = "sess123"
    attribute_name = "name"
    now = datetime.now(timezone.utc)
    expected_expiry = now + timedelta(days=7)
    mock_datetime.now.return_value = now
    mock_datetime.side_effect = lambda *args, **kwargs: datetime(*args, **kwargs)
    mock_create_session_db.side_effect = AttributeError(name=attribute_name)
    try:
        await create_session(user)
        pytest.fail("Create Session should've errored on DB error.")
    except AttributeError as ae:
        mock_uuid6.assert_called_once()
    except Exception:
        pytest.fail("Unexpected exception thrown by create_session")
        mock_create_session_db.assert_awaited_once_with("sess123", user.id, expected_expiry.timestamp())

@patch("auth.business.business.get_session", new_callable=AsyncMock)
@patch("auth.business.business.datetime")
async def test_verify_session_valid(mock_datetime: Mock, mock_get_session: AsyncMock):
    session_id = "sess123"
    now = datetime.now(timezone.utc)
    expires_at = now.timestamp() + 60  # 1 minute in future
    session = { "id": session_id, "user_id": "1", "expires_at": expires_at }
    # Fake request with cookie
    req = Mock(spec=Request)
    req.cookies = { 'session_id': session_id }
    mock_datetime.now.return_value = now
    mock_datetime.side_effect = lambda *args, **kwargs: datetime(*args, **kwargs)
    mock_get_session.return_value = session
    result = await verify_session(req)

    assert result == session
    mock_get_session.assert_awaited_once_with(session_id)

async def test_verify_session_optional_when_cookie_missing():
    req = Mock(spec=Request)
    req.cookies = {}

    result = await verify_session(req, optional=True)
    assert result is None

@patch("auth.business.business.get_session", new_callable=AsyncMock)
@patch("auth.business.business.delete_session", new_callable=AsyncMock)
@patch("auth.business.business.datetime", new_callable=Mock)
async def test_verify_session_expired(mock_datetime: Mock, mock_delete_session: AsyncMock, mock_get_session: AsyncMock):
    session_id = "sess456"
    now = datetime.now(timezone.utc)
    expires_at = now.timestamp() - 1  # expired

    req = Mock(spec=Request)
    req.cookies = { 'session_id': session_id }

    mock_get_session.return_value = {
        "id": session_id,
        "user_id": "1",
        "expires_at": expires_at
    }
    mock_datetime.now.return_value = now
    mock_datetime.side_effect = lambda *args, **kwargs: datetime(*args, **kwargs)

    try:
        await verify_session(req)
        pytest.fail("Expected HTTPException for expired session")
    except HTTPException as ex:
        assert ex.status_code == status.HTTP_401_UNAUTHORIZED
        assert "expired" in ex.detail.lower()
        mock_delete_session.assert_awaited_once_with(session_id)

@patch("auth.business.business.get_session", new_callable=AsyncMock)
async def test_verify_session_no_cookie(mock_get_session: AsyncMock):
    req = Mock(spec=Request)
    req.cookies = {}
    try:
        await verify_session(req)
        pytest.fail("Mandatory session check should've failed with request without cookies.")
    except HTTPException as he:
        assert he.status_code == status.HTTP_401_UNAUTHORIZED
        assert he.detail == "User must be logged in to view this info. Pass the session cookie with your request."
        mock_get_session.assert_not_awaited()