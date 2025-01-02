INSERT INTO Department (name) VALUES
('HR'),
('Engineering'),
('Marketing'),
('Sales'),
('Finance'),
('Operations'),
('Customer Support');

INSERT INTO Role (name, salary, department) VALUES
('HR Manager', 75000, 1),
('Recruiter', 65000, 1),
('Software Engineer', 95000, 2),
('Technical Lead', 110000, 2),
('Product Manager', 100000, 2),
('Marketing Specialist', 60000, 3),
('Marketing Manager', 85000, 3),
('Sales Representative', 55000, 4),
('Sales Manager', 80000, 4),
('Accountant', 70000, 5),
('Finance Manager', 95000, 5),
('Operations Specialist', 65000, 6),
('Operations Manager', 85000, 6),
('Support Agent', 45000, 7),
('Support Manager', 70000, 7);

INSERT INTO Employee (first_name, last_name, role_id, manager_id) VALUES
('Alice', 'Johnson', 1, NULL),
('Eve', 'Taylor', 2, 1),
('Bob', 'Smith', 3, 4),
('Frank', 'Wright', 4, NULL),
('Grace', 'Hopper', 5, 4),
('Charlie', 'Brown', 6, 7),
('Diana', 'Clark', 7, NULL),
('Ivy', 'Anderson', 8, 9),
('Jack', 'Miller', 9, NULL),
('Ken', 'Adams', 10, 11),
('Laura', 'Green', 11, NULL),
('Michael', 'Scott', 12, 13),
('Nina', 'Baker', 13, NULL),
('Oscar', 'Peterson', 14, 15),
('Pam', 'Beesly', 15, NULL);