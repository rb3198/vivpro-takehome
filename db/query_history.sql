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
	FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS avg_ratings
(
	song_idx INTEGER,
	song_id VARCHAR,
	n_ratings INT,
	sum_ratings REAL,
	avg_rating REAL,
	FOREIGN KEY (song_idx, song_id) REFERENCES songs(idx, id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS sessions (
	id VARCHAR PRIMARY KEY,
	user_id VARCHAR,
	expires_at TIMESTAMP,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);