CREATE DATABASE IF NOT EXISTS fast_food_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE fast_food_db;


CREATE TABLE IF NOT EXISTS usuarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(60)  NOT NULL UNIQUE,
    apellidos      VARCHAR(80)  NOT NULL,
    telefono       VARCHAR(20)  NOT NULL,
    correo         VARCHAR(120) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    fechaRegistro  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS menu (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    precio      INT          NOT NULL,
    categoria   VARCHAR(60)  NOT NULL DEFAULT 'General',
    disponible  TINYINT(1)   NOT NULL DEFAULT 1,
    orden       INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS pedidos (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    numero        VARCHAR(10)  NOT NULL DEFAULT '000',
    mesa          VARCHAR(50)  NOT NULL DEFAULT 'General',
    mesero        VARCHAR(60)  NOT NULL DEFAULT 'Anónimo',
    items         LONGTEXT,
    notas         TEXT,
    hora          VARCHAR(10),
    horaDespacho  VARCHAR(10),
    estado        VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
    timestamp     BIGINT       NOT NULL DEFAULT 0,
    createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS pedido_items (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id        INT NOT NULL,
    menu_id          INT,
    cantidad         INT NOT NULL DEFAULT 1,
    precio_unitario  INT NOT NULL DEFAULT 0,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id)   REFERENCES menu(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
