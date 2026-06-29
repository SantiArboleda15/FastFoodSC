🍔 FastFoodSC

Sistema de Gestión Gastronómica para Restaurantes

Sistema web desarrollado en **PHP, MySQL, HTML, CSS y JavaScript** para la administración de pedidos, empleados y cocina en restaurantes de comida rápida.

Proyecto desarrollado como evidencia del programa **Técnico en Programación de Software** del **Servicio Nacional de Aprendizaje (SENA)**.

---

# Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías-utilizadas)
- [Arquitectura](#-arquitectura-del-sistema)
- [Módulos](#-módulos-del-sistema)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Capturas del Sistema](#-capturas-del-sistema)
- [Pruebas](#-pruebas)
- [Versiones](#-versiones-del-proyecto)
- [Mejoras Futuras](#-mejoras-futuras)
- [Autores](#-autores)
- [Licencia](#-licencia)

---

# Descripción

**FastFoodSC** es un sistema de gestión gastronómica diseñado para optimizar el proceso de administración de restaurantes de comida rápida.

La aplicación permite gestionar empleados, productos, pedidos y estados de preparación mediante una interfaz web intuitiva, facilitando el trabajo del personal administrativo, meseros y cocina.

El proyecto fue desarrollado utilizando una arquitectura Cliente–Servidor con **PHP** para el backend, **MySQL** para la persistencia de datos y **HTML, CSS y JavaScript** para el frontend.

---

# Características

- Inicio de sesión de usuarios
- Registro de empleados
- Administración de productos
- Gestión de pedidos
- Panel de cocina
- Panel administrativo
- Estadísticas del sistema
- Actualización del estado de pedidos
- Base de datos MySQL
- Arquitectura Cliente – Servidor
- Diseño adaptable (Responsive)

---

# Tecnologías Utilizadas

| Tecnología | Función |
|------------|---------|
| PHP 8 | Backend |
| MySQL | Base de Datos |
| HTML5 | Estructura |
| CSS3 | Diseño |
| JavaScript | Interactividad |
| XAMPP | Servidor Local |
| Git | Control de Versiones |
| GitHub | Repositorio |
| Visual Studio Code | Editor de Código |

---

# Arquitectura del Sistema

```
                Usuario

                   │

                   ▼

      HTML • CSS • JavaScript

                   │

                   ▼

             API desarrollada
                 en PHP

                   │

                   ▼

                MySQL
```

El sistema utiliza una arquitectura Cliente-Servidor donde el frontend interactúa con una API desarrollada en PHP, la cual procesa la lógica del negocio y almacena la información en una base de datos MySQL.

---

# Módulos del Sistema

## Autenticación

- Inicio de sesión
- Registro de usuarios
- Validación de credenciales

---

## Gestión de Productos

- Crear productos
- Editar productos
- Eliminar productos
- Consultar productos

---

## Gestión de Pedidos

- Crear pedidos
- Agregar productos
- Calcular total
- Enviar pedidos a cocina

---

## Cocina

- Visualizar pedidos pendientes
- Cambiar estado de preparación
- Marcar pedidos como listos

---

## Administración

- Gestión de empleados
- Estadísticas
- Eliminación de usuarios
- Reinicio de pedidos

---

# Instalación

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/SantiArboleda15/FastFoodSC.git
```

---

## 2️⃣ Abrir XAMPP

Iniciar los servicios:

- Apache
- MySQL

---

## 3️⃣ Copiar el proyecto

Mover la carpeta del proyecto hacia:

```
C:\xampp\htdocs\
```

---

## 4️⃣ Crear la Base de Datos

Ingresar a:

```
http://localhost/phpmyadmin
```

Crear una base de datos e importar el archivo SQL correspondiente a la versión del proyecto que se desea ejecutar.

---

## 5️⃣ Configurar la conexión

Editar el archivo:

```
db.php
```

o

```
conexion.php
```

Configurando:

- Servidor
- Usuario
- Contraseña
- Nombre de la Base de Datos

---

## 6️⃣ Ejecutar el proyecto

Abrir el navegador e ingresar:

```
http://localhost/FastFoodSC
```

---

# Estructura del Proyecto

```text
FastFoodSC
│
├── assets/
│   ├── banner.png
│   ├── login.png
│   ├── menu.png
│   ├── cocina.png
│   ├── admin.png
│   └── estadisticas.png
│
├── docs/
│   ├── Manual_Tecnico.pdf
│   ├── Manual_Usuario.pdf
│   ├── Manual_Instalacion.pdf
│   └── Manual_Pruebas.pdf
│
├── V0.5/
├── V1.5/
├── V2.0/
├── V2.5/
│
├── README.md
└── LICENSE
```

---

# Capturas del Sistema

## Inicio de Sesión

![Login])<img width="1185" height="915" alt="image" src="https://github.com/user-attachments/assets/de6f1cb3-f953-45a9-b0e1-7d1bf93857fc" />


---

## Menú Principal

![Menu](assets/menu.png)

---

## Panel de Cocina

![Cocina](assets/cocina.png)

---

## Panel Administrativo

![Administrador](assets/admin.png)

---

## Estadísticas

![Estadísticas](assets/estadisticas.png)

---

# Pruebas

El proyecto cuenta con documentación técnica para validar el correcto funcionamiento del sistema mediante casos de prueba que incluyen:

- Inicio de sesión
- Registro de usuarios
- Gestión de pedidos
- Gestión de empleados
- Actualización de estados
- Estadísticas
- Reinicio del sistema

---

# Versiones del Proyecto

| Versión | Descripción |
|----------|-------------|
| **V0.5** | Primera versión utilizando almacenamiento local (LocalStorage). |
| **V1.5** | Implementación del backend en PHP y conexión con MySQL. |
| **V2.0** | Integración del panel administrativo y mejoras en la gestión de datos. |
| **V2.5** | Optimización del sistema, normalización de la base de datos y mejoras generales. |

---

# Mejoras Futuras

- Implementar autenticación mediante JWT.
- Incorporar recuperación de contraseña.
- Generar reportes en PDF.
- Dashboard con gráficos estadísticos.
- Notificaciones en tiempo real.
- Implementar Docker.
- Despliegue en un servidor en la nube.
- Integración con pasarelas de pago.

---

# Documentación

El proyecto incluye la siguiente documentación:

- Manual Técnico
- Manual de Usuario
- Manual de Instalación
- Manual de Pruebas Unitarias

---

# Autores

**Elver Santiago Arboleda Vargas**

Desarrollador 

---

**Jhon Deivid Romero Bohórquez**

Desarrollador 

---

**Alan Rafael Orellano Rodelo**

Desarrollador 

---

# Licencia

Este proyecto se distribuye bajo la licencia **Apache 2.0**.

---

**FastFoodSC © 2026**
