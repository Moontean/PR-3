CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT
);

INSERT INTO tasks (title, description) VALUES
  ('Sample Task 1', 'This is a sample task'),
  ('Sample Task 2', 'Another sample task');

