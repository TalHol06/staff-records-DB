DROP DATABASE IF EXISTS staffrecords;
CREATE DATABASE staffrecords;

\c staffrecords;

CREATE TABLE Department(
  id SERIAL PRIMARY KEY,
  name VARCHAR(30)
);

CREATE TABLE Role(
  id SERIAL PRIMARY KEY,
  name VARCHAR(30),
  salary DECIMAL,
  department INTEGER,
  FOREIGN KEY (department) REFERENCES Department(id) ON DELETE SET NULL
);

CREATE TABLE Employee(
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INTEGER,
  FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE SET NULL,
  manager_id INTEGER,
  FOREIGN KEY (manager_id) REFERENCES Employee(id) ON DELETE SET NULL
);

