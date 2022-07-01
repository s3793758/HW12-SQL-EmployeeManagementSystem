INSERT INTO departments (id, name)
VALUES (1,"Sales"),
       (2,"Engineering"),
       (3, "Finance"),
       (4, "Legal");
       
INSERT INTO roles (id, title, salary, department_id)
VALUES (1, "Sales Lead", 100, 1),
       (2, "Salesperson", 800, 1),
       (3, "Lead Engineer", 150, 2),
       (4, "Software Engineer", 1200, 2),
       (5, "Account Manager", 160, 3),
       (6, "Accountant", 1250, 3),
       (7, "Legal Team Lead", 21000, 4),
       (8, "Lawyer", 1000, 4);

INSERT INTO employees (id, first_name, last_name, role_id, manager_id)
VALUES (1, "Mark", "hang", 1, NULL),
       (2, "jane", "cum", 2, 1),
       (3, "yogesh", "inglie", 3, NULL),
       (4, "mason", "Tupik", 4, 3),
       (5, "muhamad", "sahid", 5, NULL),
       (6, "mohamad", "Brown", 6, 5),
       (7, "sarah", "low", 7, NULL),
       (8, "sumayah", "tubit", 8, 7);