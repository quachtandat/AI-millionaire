CREATE DATABASE ai_millionaire
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ai_millionaire;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    question TEXT NOT NULL,

    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,

    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,

    category_id INT NOT NULL,

    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,

    prize_level INT NOT NULL,

    explanation TEXT NULL,

    status ENUM('draft', 'approved', 'rejected')
        NOT NULL DEFAULT 'draft',

    source ENUM('admin', 'ai')
        NOT NULL DEFAULT 'admin',

    created_by INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_questions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_questions_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    current_level INT NOT NULL DEFAULT 1,

    current_prize BIGINT NOT NULL DEFAULT 0,

    status ENUM('playing', 'won', 'lost', 'stopped')
        NOT NULL DEFAULT 'playing',

    game_mode ENUM('millionaire', 'practice')
        NOT NULL DEFAULT 'millionaire',

    total_questions INT NOT NULL DEFAULT 15,

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    finished_at TIMESTAMP NULL,

    CONSTRAINT fk_games_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


CREATE TABLE game_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    game_id INT NOT NULL,

    question_id INT NOT NULL,

    level INT NOT NULL,

    order_number INT NOT NULL,

    question_started_at DATETIME(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_game_questions_game
        FOREIGN KEY (game_id)
        REFERENCES games(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_game_questions_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    UNIQUE (game_id, level),

    UNIQUE (game_id, order_number)
);


CREATE TABLE game_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    game_id INT NOT NULL,

    question_id INT NOT NULL,

    selected_answer ENUM('A', 'B', 'C', 'D') NOT NULL,

    is_correct BOOLEAN NOT NULL,

    response_time_seconds DECIMAL(8,2) NULL,

    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_game_answers_game
        FOREIGN KEY (game_id)
        REFERENCES games(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_game_answers_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE game_lifelines (
    id INT AUTO_INCREMENT PRIMARY KEY,

    game_id INT NOT NULL,

    lifeline_type ENUM('fifty_fifty', 'audience', 'phone')
        NOT NULL,

    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_game_lifeline (
        game_id,
        lifeline_type
    ),

    CONSTRAINT fk_game_lifelines_game
        FOREIGN KEY (game_id)
        REFERENCES games(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO categories (name, description)
VALUES
('Lịch sử', 'Các câu hỏi về lịch sử Việt Nam và thế giới'),
('Địa lý', 'Các câu hỏi về địa lý'),
('Khoa học', 'Các câu hỏi về khoa học tự nhiên'),
('Công nghệ', 'Các câu hỏi về công nghệ và máy tính'),
('Thể thao', 'Các câu hỏi về thể thao'),
('Văn hóa', 'Các câu hỏi về văn hóa và xã hội');


SHOW TABLES;

-- Check table structures
SHOW COLUMNS FROM users;
SHOW COLUMNS FROM categories;
SHOW COLUMNS FROM questions;
SHOW COLUMNS FROM games;
SHOW COLUMNS FROM game_questions;
SHOW COLUMNS FROM game_answers;
SHOW COLUMNS FROM game_lifelines;

-- Check default categories
SELECT * FROM categories;
