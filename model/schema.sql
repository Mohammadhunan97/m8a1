DROP DATABASE IF EXISTS m8a1;
CREATE DATABASE m8a1;
use m8a1;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS notes;

CREATE TABLE users(
	id INT AUTO_INCREMENT primary key NOT NULL,
	facebook_id VARCHAR(255) NOT NULL
);

CREATE TABLE notes(
	id INT AUTO_INCREMENT primary key NOT NULL,
	user_id VARCHAR(255) NOT NULL references users(id),
	description TEXT
);