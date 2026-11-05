# FastFoodSC 3.0

Sistema de gestión gastronómica para restaurantes de comida rápida. Permite administrar empleados, tomar pedidos, monitorear la cocina y consultar estadísticas desde un panel administrativo.

Proyecto desarrollado como evidencia del programa **Técnico en Programación de Software** del **Servicio Nacional de Aprendizaje (SENA)**.

## Estado actual

Esta versión funciona en **modo DEMO**:

- No requiere MySQL, MariaDB, PostgreSQL ni XAMPP.
- Los datos se guardan en la sesión PHP mediante `MockStorage`.
- Los datos simulados se definen únicamente en `backend/Data/DemoData.php`.
- La interfaz, las rutas y las funcionalidades se conservan.
- La integración real con PostgreSQL queda preparada pero **todavía no está implementada**.

La verificación de esta versión debe hacerse con PHP 8 instalado. El repositorio no incluye un servidor PHP embebido.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| PHP 8 | Backend, API JSON y sesión DEMO |
| HTML5 | Estructura del frontend |
| CSS3 / Tailwind CSS | Estilos |
| JavaScript | Interactividad y consumo de la API |
| PostgreSQL + PDO_PGSQL | Persistencia futura |
| pgAdmin 4 | Administración futura de PostgreSQL |
| Git / GitHub | Control de versiones |

Tailwind CSS y las fuentes se cargan por CDN. Las imágenes del menú usan URLs externas de Unsplash.

---

## Funcionalidades

- Inicio de sesión de empleados con contraseñas almacenadas mediante hash bcrypt.
- Registro de empleados.
- Selección de rol: mesero, cocinero o administrador.
- Comanda digital con carrito, observaciones y cálculo de total.
- Envío de pedidos a la API.
- Monitor de cocina con estados: pendiente, preparando, listo y despachado.
- Panel administrativo rediseñado con dashboard, pedidos, productos, categorías, mesas, usuarios, reportes y configuración.
- Eliminación protegida de empleados.
- Limpieza de pedidos y reinicio del sistema.
- Indicador visual de **MODO DEMO**.
- Acción `demo_reset` para restaurar los datos simulados.
- Sesión autenticada en PHP y cierre de sesión coordinado con el frontend.

La API administrativa valida la sesión PHP y el rol `administrador` antes de
listar usuarios, eliminarlos o ejecutar acciones destructivas. El frontend
mantiene una referencia de sesión en `localStorage` para la navegación, pero
el panel administrativo exige una sesión PHP válida.

---

## Requisitos para el modo DEMO

- PHP 8.0 o superior.
- Extensiones PHP básicas: `json`, `session` y `pdo` (PDO no se usa en modo DEMO, pero queda declarado).
- Navegador actualizado.
- Opcional: Composer, solo para generar el autoload de herramientas futuras.
- Opcional: Node.js, solo para validar la sintaxis de los archivos JavaScript.

No se necesita MySQL, MariaDB, PostgreSQL, Apache ni XAMPP.

### Instalar PHP 8 en Windows

1. Descargar PHP 8 para Windows desde `https://windows.php.net/download/`.
2. Descomprimir en una ruta sin espacios, por ejemplo `C:\php`.
3. Agregar `C:\php` a la variable de entorno `Path`.
4. Abrir una terminal nueva y verificar:

```powershell
php -v
```

Si el comando no responde, revisar la variable `Path` o ejecutar PHP con su ruta completa.

---

## Ejecutar la aplicación

Desde la raíz del proyecto:

```powershell
php -S localhost:8000 -t .
```

Abrir en el navegador:

```text
http://localhost:8000/
```

El archivo raíz `index.php` redirige a `frontend/` y `frontend/index.php` redirige al login.

También se puede abrir directamente:

```text
http://localhost:8000/frontend/pages/index.html
```

El servidor embebido de PHP es solo para desarrollo local. No debe exponerse a una red pública.

### Credenciales DEMO

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `AdminDemo2026!` | Administrador |
| `fastfood` | `1234` | Administrador |
| `maria` | `1234` | Mesero |
| `carlos` | `1234` | Cocinero |
| `laura` | `1234` | Mesero |

La cuenta recomendada para el panel administrativo es `admin`. Las
credenciales completas están en `docs/CREDENCIALES_DEMO.md`, un archivo para
desarrollo local que no debe usarse en producción.

---

## Configuración

Copiar `.env.example` como `.env` si se necesita cambiar el modo o los parámetros:

```powershell
Copy-Item .env.example .env
```

Contenido esperado para el modo DEMO:

```env
APP_ENV=local
APP_DEBUG=true
STORAGE_DRIVER=demo
```

El archivo `.env` está excluido por `.gitignore`. Si no existe, la aplicación usa `STORAGE_DRIVER=demo` por defecto.

### Modos de almacenamiento

| `STORAGE_DRIVER` | Implementación | Estado |
|---|---|---|
| `demo`, `mock`, `session` | `MockStorage` | Disponible |
| `pgsql`, `postgres`, `postgresql` | `PostgreSQLStorage` | Pendiente, lanza una excepción controlada |

En modo DEMO, las variables `DB_*` de PostgreSQL se ignoran.

### Datos DEMO

- 5 usuarios (incluye el administrador DEMO `admin`).
- 12 productos.
- 4 categorías.
- 3 roles.
- 7 mesas o puntos de entrega.
- 4 estados de pedido.
- 5 pedidos iniciales con 10 ítems.

Los cambios viven en la sesión PHP. Para restaurar los datos iniciales:

- Usar el botón **Reiniciar Todo el Sistema** del panel admin.
- O llamar a `frontend/api.php?action=demo_reset`.
- O eliminar la sesión del navegador.

Las sesiones se guardan en `storage/demo/sessions/`, excluida de Git.

---

## Estructura del proyecto

```text
FastFoodSC/
├── frontend/
│   ├── assets/
│   │   ├── css/style.css
│   │   ├── css/admin.css
│   │   ├── fonts/
│   │   ├── img/image_414dac.png
│   │   └── js/
│   │       ├── registro.js
│   │       ├── admin.js
│   │       └── theme-editor.js
│   ├── components/
│   ├── pages/
│   │   ├── index.html
│   │   ├── registro1.html
│   │   ├── roles1.html
│   │   ├── meseros1.html
│   │   ├── cosina1.html
│   │   └── admin.html
│   ├── api.php
│   └── index.php
│
├── backend/
│   ├── Contracts/StorageInterface.php
│   ├── Data/DemoData.php
│   ├── Repositories/
│   ├── Services/
│   ├── Storage/
│   │   ├── MockStorage.php
│   │   ├── PostgreSQLStorage.php
│   │   └── StorageFactory.php
│   ├── Support/
│   ├── config/database.php
│   ├── controllers/
│   ├── helpers/env.php
│   ├── middleware/
│   ├── models/
│   ├── routes/api.php
│   └── bootstrap.php
│
├── database/
│   ├── legacy/mysql/          # SQL histórico, no usado por la aplicación
│   └── postgresql/            # Reservado para migraciones futuras
│
├── storage/
│   ├── demo/sessions/
│   ├── logs/
│   └── uploads/
│
├── docs/
│   ├── CREDENCIALES_DEMO.md
│   ├── INVENTARIO.md
│   └── legacy/
│
├── tests/
│   ├── README.md
│   └── smoke_test.php
│
├── .env.example
├── .gitignore
├── .htaccess
├── composer.json
├── index.php
├── LICENSE
└── README.md
```

### Responsabilidades

- `frontend/`: páginas y recursos estáticos.
- `frontend/api.php`: punto de entrada HTTP que delega en el backend.
- `backend/bootstrap.php`: autoload, carga de `.env`, sesión y fábrica de almacenamiento.
- `backend/Contracts/`: contrato común de almacenamiento.
- `backend/Data/`: fuente única de datos simulados.
- `backend/Storage/`: implementaciones DEMO y futura PostgreSQL.
- `backend/Repositories/`: acceso a usuarios, productos, catálogos y pedidos.
- `backend/Services/`: autenticación, usuarios, catálogos, pedidos, administración y sistema.
- `backend/Support/`: utilidades de petición, respuesta y excepciones.
- `backend/routes/api.php`: enrutador de la API JSON.
- `database/legacy/mysql/`: scripts MySQL de la versión 2.5, solo referencia.
- `database/postgresql/`: espacio reservado para el futuro esquema PostgreSQL.
- `storage/`: sesiones DEMO, logs y subidas locales.
- `tests/`: verificación automática y plan de pruebas manuales.

---

## API

Todas las peticiones se realizan a `frontend/api.php` con el parámetro `action`.

| Acción | Método | Función |
|---|---|---|
| `login` | POST | Validar usuario y contraseña e iniciar sesión PHP |
| `register` | POST | Registrar empleado e iniciar sesión PHP |
| `me` | GET | Consultar el usuario autenticado en la sesión PHP |
| `logout` | POST | Cerrar la sesión PHP |
| `get_users` | GET | Listar empleados sin contraseñas (solo administrador) |
| `delete_user` | POST | Eliminar un empleado por nombre (solo administrador) |
| `get_products` | GET | Listar productos DEMO |
| `get_catalogs` | GET | Listar roles, categorías, mesas y estados |
| `get_orders` | GET | Listar pedidos con filtros |
| `submit_order` | POST | Crear un pedido |
| `update_status` | POST | Cambiar el estado de un pedido |
| `get_stats` | GET | Obtener estadísticas del panel admin |
| `clear_orders` | POST | Borrar todos los pedidos |
| `clear_all` | POST | Borrar pedidos y empleados no administradores |
| `get_system_info` | GET | Consultar versión, modo y persistencia |
| `demo_reset` | POST | Restaurar los datos DEMO iniciales (solo administrador) |

Las acciones `get_users`, `delete_user`, `clear_orders`, `clear_all` y
`demo_reset` requieren una sesión PHP con rol `administrador`. Sin sesión
responden `401`; con un rol distinto responden `403`.

### Filtros de `get_orders`

- `estado`: `pendiente`, `preparando`, `listo`, `despachado` o `activos`.
- `mesa`: nombre exacto de la mesa.
- `mesero`: nombre exacto del mesero.
- `q`: búsqueda por número, mesa, mesero, notas o producto.
- `desde` y `hasta`: marcas de tiempo en milisegundos.
- `limit`: cantidad máxima de resultados.

Ejemplos:

```text
frontend/api.php?action=get_orders&estado=activos
frontend/api.php?action=get_orders&mesa=Mesa%201&q=pollo
frontend/api.php?action=get_system_info
```

Las respuestas incluyen las cabeceras `X-FastFoodSC-Mode` y `X-FastFoodSC-Demo`.

---

## Pruebas

### Verificación automática

Con PHP instalado:

```powershell
php tests/smoke_test.php
```

La prueba valida la estructura principal, el modo DEMO, los catálogos, las estadísticas, la creación y actualización de pedidos y el rechazo controlado de `PostgreSQLStorage`.

### Validación de JavaScript

Con Node.js instalado:

```powershell
node --check frontend/assets/js/registro.js
node --check frontend/assets/js/admin.js
node --check frontend/assets/js/theme-editor.js
```

### Flujo manual

1. Iniciar el servidor con `php -S localhost:8000 -t .`.
2. Abrir `http://localhost:8000/`.
3. Iniciar sesión con `admin` / `AdminDemo2026!`.
4. Verificar que se abre el panel administrativo y que el dashboard carga datos.
5. Registrar un empleado desde el flujo de registro y comprobar que aparece en Usuarios.
6. Crear un pedido desde el panel de mesero.
7. Verificar que aparece en cocina.
8. Avanzar el estado: pendiente → preparando → listo → despachado.
9. Comprobar estadísticas, reportes y tablas del panel administrativo.
10. Cerrar sesión y verificar la redirección al login.
11. Confirmar que una cuenta con rol mesero recibe `403` al llamar `get_users`.
12. Reiniciar el sistema y confirmar que vuelven los datos DEMO.

El plan detallado está en `tests/README.md`.

---

## MySQL legado y PostgreSQL futuro

Los scripts MySQL de la versión 2.5 se movieron a `database/legacy/mysql/` y no son usados por la aplicación. No es necesario importarlos para probar el modo DEMO.

La base tecnológica futura es PostgreSQL. Para esa etapa falta:

1. Definir el esquema y las migraciones en `database/postgresql/migrations/`.
2. Crear las semillas en `database/postgresql/seeds/`.
3. Implementar `backend/Storage/PostgreSQLStorage.php` con PDO_PGSQL.
4. Habilitar la extensión `pdo_pgsql`.
5. Configurar `STORAGE_DRIVER=pgsql` y las variables `DB_*`.
6. Probar conexión, transacciones y consultas antes de retirar `MockStorage`.

Mientras `PostgreSQLStorage` no esté implementado, `STORAGE_DRIVER=pgsql` produce un error controlado. El modo seguro es `STORAGE_DRIVER=demo`.

---

## Seguridad y alcance

- El modo DEMO no es un entorno de producción.
- Las contraseñas DEMO se almacenan como hash bcrypt y se verifican con `password_verify()`.
- La sesión autenticada vive en PHP; el frontend conserva una referencia en `localStorage`.
- El panel administrativo valida sesión y rol antes de mostrar datos o ejecutar acciones.
- Las credenciales de demostración están documentadas solo para desarrollo local.
- El servidor embebido de PHP no debe usarse en producción.
- Los archivos `.htaccess` bloquean el acceso directo a `.env`, `backend/`, `database/`, `storage/` y `tests/` cuando se usa Apache.
- No se eliminó ni reescribió el historial de Git.
