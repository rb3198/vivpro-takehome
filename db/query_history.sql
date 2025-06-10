--#region Setup Tables
CREATE TABLE IF NOT EXISTS songs
 (
	idx INTEGER,
	id VARCHAR,
	title VARCHAR,
	danceability REAL,
	energy REAL,
	key INTEGER,
	loudness REAL,
	mode INTEGER,
	acousticness REAL,
	instrumentalness REAL,
	liveness REAL,
	valence REAL,
	tempo REAL,
	duration_ms INTEGER,
	time_signature INTEGER,
	num_bars INTEGER,
	num_sections INTEGER,
	num_segments INTEGER,
	class INTEGER,
	PRIMARY KEY (idx, id)
);
CREATE TABLE IF NOT EXISTS users 
(
	id VARCHAR PRIMARY KEY,
	username VARCHAR UNIQUE NOT NULL,
	name VARCHAR,
	pwd_hash VARCHAR
);
CREATE TABLE IF NOT EXISTS ratings (
	song_idx INTEGER,
	song_id VARCHAR,
	user_id VARCHAR,
	rating REAL,
	FOREIGN KEY (song_idx, song_id) REFERENCES songs(idx, id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id),
	UNIQUE(song_idx, song_id, user_id)
);
CREATE TABLE IF NOT EXISTS avg_ratings
(
	song_idx INTEGER,
	song_id VARCHAR,
	n_ratings INT,
	sum_ratings REAL,
	avg_rating REAL,
	FOREIGN KEY (song_idx, song_id) REFERENCES songs(idx, id) ON DELETE CASCADE,
	UNIQUE(song_idx, song_id)
);
CREATE TABLE IF NOT EXISTS sessions (
	id VARCHAR PRIMARY KEY,
	user_id VARCHAR,
	expires_at TIMESTAMP,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

--#endregion
--#region Setup Triggers
CREATE TRIGGER pre_update_rating
BEFORE UPDATE ON ratings
FOR EACH ROW
BEGIN
	UPDATE avg_ratings
	SET
		sum_ratings = sum_ratings - OLD.rating,
		n_ratings = n_ratings - 1,
		avg_rating = ROUND((sum_ratings - OLD.rating) / (n_ratings - 1), 2)
	WHERE song_idx = OLD.song_idx AND song_id = OLD.song_id;
END;

CREATE TRIGGER post_insert_rating
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
	INSERT INTO avg_ratings (song_idx, song_id, n_ratings, sum_ratings, avg_rating)
	VALUES (NEW.song_idx, NEW.song_id, 1, NEW.rating, NEW.rating)
	ON CONFLICT (song_idx, song_id) DO 
	UPDATE SET 
		n_ratings = n_ratings + excluded.n_ratings,
		sum_ratings = sum_ratings + excluded.sum_ratings,
		avg_rating = ROUND((sum_ratings + excluded.sum_ratings) / (n_ratings + excluded.n_ratings), 2);
END;

CREATE TRIGGER post_update_rating
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
	UPDATE avg_ratings
	SET
		sum_ratings = sum_ratings + NEW.rating,
		n_ratings = n_ratings + 1,
		avg_rating = ROUND((sum_ratings + NEW.rating) / (n_ratings + 1), 2)
	WHERE song_idx = NEW.song_idx AND song_id = NEW.song_id;
END;
--#endregion
