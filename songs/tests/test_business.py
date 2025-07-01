from unittest.mock import AsyncMock, patch

from songs.business import load_playlist
from songs.business import get_songs
from songs.tests.test_entities import transformed_songs, playlist_data, songs_with_ratings_no_user, songs_with_ratings_user

@patch("songs.business.business.insert_songs", new_callable=AsyncMock)
async def test_load_playlist(mock_insert_songs: AsyncMock):
    await load_playlist(playlist_data) # type: ignore
    mock_insert_songs.assert_awaited_once_with(transformed_songs)

@patch("songs.business.business.get_songs_dl", new_callable=AsyncMock)
@patch("songs.business.business.get_song_ratings", new_callable=AsyncMock)
async def test_get_songs_no_user_success(mock_get_song_ratings: AsyncMock, mock_get_songs: AsyncMock):
    mock_get_songs.return_value = transformed_songs
    mock_get_song_ratings.return_value = {
        '5vYA1mW9g2Coh1HUFUSmlb_0': {
            'user_rating': 0,
            'avg_rating': 3
        },
        '2klCjJcucgGQysgH170npL_1': {
            'user_rating': 0,
            'avg_rating': 3.5
        },
        '093PI3mdUvOSlvMYDwnV1e_2': {
            'user_rating': 0,
            'avg_rating': 4
        },
    }
    result = await get_songs(None)
    assert result == songs_with_ratings_no_user
    mock_get_songs.assert_awaited_once()
    mock_get_song_ratings.assert_awaited_once()

@patch("songs.business.business.get_songs_dl", new_callable=AsyncMock)
@patch("songs.business.business.get_song_ratings", new_callable=AsyncMock)
async def test_get_songs_with_user_success(mock_get_song_ratings: AsyncMock, mock_get_songs: AsyncMock):
    mock_get_songs.return_value = transformed_songs
    mock_get_song_ratings.return_value = {
        '5vYA1mW9g2Coh1HUFUSmlb_0': {
            'user_rating': 1,
            'avg_rating': 3
        },
        '2klCjJcucgGQysgH170npL_1': {
            'user_rating': 2,
            'avg_rating': 3.5
        },
        '093PI3mdUvOSlvMYDwnV1e_2': {
            'user_rating': 3,
            'avg_rating': 4
        },
    }
    result = await get_songs(None)
    assert result == songs_with_ratings_user
    mock_get_songs.assert_awaited_once()
    mock_get_song_ratings.assert_awaited_once()
