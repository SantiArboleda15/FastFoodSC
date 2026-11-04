USE fast_food_db;


INSERT INTO menu (nombre, precio, categoria, disponible, orden) VALUES
('Hamburguesa Clásica',    12000, 'Hamburguesas', 1, 1),
('Hamburguesa Doble',      16000, 'Hamburguesas', 1, 2),
('Hamburguesa BBQ',        14000, 'Hamburguesas', 1, 3),
('Hamburguesa Pollo',      13000, 'Hamburguesas', 1, 4),
('Perro Sencillo',          8000, 'Perros Calientes', 1, 1),
('Perro Especial',         10000, 'Perros Calientes', 1, 2),
('Perro Ranchero',         11000, 'Perros Calientes', 1, 3),
('Papas Medianas',          5000, 'Acompañamientos', 1, 1),
('Papas Grandes',           7000, 'Acompañamientos', 1, 2),
('Aros de Cebolla',         6000, 'Acompañamientos', 1, 3),
('Ensalada',                5000, 'Acompañamientos', 1, 4),
('Gaseosa 350ml',           3000, 'Bebidas', 1, 1),
('Gaseosa 600ml',           4500, 'Bebidas', 1, 2),
('Jugo Natural',            5000, 'Bebidas', 1, 3),
('Agua',                    2000, 'Bebidas', 1, 4),
('Combo Clásico',          18000, 'Combos', 1, 1),
('Combo Doble',            22000, 'Combos', 1, 2),
('Combo Familiar',         45000, 'Combos', 1, 3);


INSERT INTO usuarios (nombre, apellidos, telefono, correo, password) VALUES
('fastfood', 'Admin', '3000000000', 'admin@fastfood.com', '1234');
