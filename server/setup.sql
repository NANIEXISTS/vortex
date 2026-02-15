CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    grade VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    subject VARCHAR(100),
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash, role) VALUES ('demo', 'demo123', 'admin') ON CONFLICT DO NOTHING;

INSERT INTO publishers (name) VALUES 
('Oxford University Press'), 
('Cambridge University Press'), 
('Pearson'), 
('Macmillan'), 
('S. Chand'), 
('Orient Blackswan'), 
('NCERT'), 
('Ratna Sagar') ON CONFLICT DO NOTHING;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vortex_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vortex_user;
