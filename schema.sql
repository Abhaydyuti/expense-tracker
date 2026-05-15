-- schema.sql
-- Run this file to set up the database from scratch.
-- psql -U postgres -d expense_tracker -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   TEXT                NOT NULL,
  created_at TIMESTAMP           DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES
  ('Food'),
  ('Travel'),
  ('Shopping'),
  ('Bills'),
  ('Health'),
  ('Entertainment'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS expenses (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER        REFERENCES users(id)      ON DELETE CASCADE,
  category_id  INTEGER        REFERENCES categories(id) ON DELETE SET NULL,
  title        VARCHAR(200)   NOT NULL,
  amount       NUMERIC(10,2)  NOT NULL CHECK (amount > 0),
  expense_date DATE           NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMP      DEFAULT NOW()
);