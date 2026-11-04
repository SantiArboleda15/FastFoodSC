# Inventario de FastFoodSC 3.0

## Estado

FastFoodSC 3.0 funciona en **modo DEMO** sin MySQL, MariaDB, PostgreSQL ni XAMPP. La persistencia se realiza en la sesión PHP mediante `MockStorage`.

La versión 2.5 se conservó como base funcional. Las carpetas `V0.5/`, `V1.5/`, `V2.0/`, `V2.5/` y `Manuales/` fueron retiradas de la estructura principal, pero siguen disponibles en el historial de Git.

## Estructura actual

```text
FastFoodSC/
├── frontend/
│   ├── assets/css/style.css
│   ├── assets/fonts/
│   ├── assets/img/image_414dac.png
│   ├── assets/js/registro.js
│   ├── assets/js/theme-editor.js
│   ├── components/
│   ├── pages/index.html
│   ├── pages/registro1.html
│   ├── pages/roles1.html
│   ├── pages/meseros1.html
│   ├── pages/cosina1.html
│   ├── pages/admin.html
│   ├── api.php
│   └── index.php
│
├── backend/
│   ├── Contracts/StorageInterface.php
│   ├── Data/DemoData.php
│   ├── Repositories/
│   ├── Services/
│   ├── Storage/
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
│   ├── legacy/mysql/
│   └── postgresql/
│
├── storage/
│   ├── demo/sessions/
│   ├── logs/
│   └── uploads/
│
├── docs/
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

## Capa de almacenamiento

| Archivo | Función |
|---|---|
| `backend/Contracts/StorageInterface.php` | Contrato común para cualquier proveedor de datos |
| `backend/Storage/StorageFactory.php` | Selecciona el proveedor según `STORAGE_DRIVER` |
| `backend/Storage/MockStorage.php` | Persistencia temporal en la sesión PHP |
| `backend/Storage/PostgreSQLStorage.php` | Stub para la futura integración con PostgreSQL |
| `backend/Data/DemoData.php` | Única fuente de usuarios, productos, catálogos y pedidos DEMO |

Modos admitidos:

- `demo`, `mock` o `session`: usa `MockStorage`.
- `pgsql`, `postgres` o `postgresql`: selecciona `PostgreSQLStorage`, que todavía lanza un error controlado.

## Repositorios

| Archivo | Responsabilidad |
|---|---|
| `UserRepository.php` | Usuarios, credenciales y datos públicos sin contraseña |
| `ProductRepository.php` | Productos y búsqueda por ID |
| `CatalogRepository.php` | Roles, categorías, mesas y estados |
| `OrderRepository.php` | Pedidos, filtros, totales y eliminación |

## Servicios

| Archivo | Responsabilidad |
|---|---|
| `AuthService.php` | Inicio de sesión y registro |
| `UserService.php` | Listado y eliminación de empleados |
| `CatalogService.php` | Productos y catálogos |
| `OrderService.php` | Creación, consulta y cambio de estado de pedidos |
| `AdminService.php` | Estadísticas, limpieza y restauración DEMO |
| `SystemService.php` | Información de versión, modo y persistencia |

## Frontend

| Archivo | Función |
|---|---|
| `index.html` | Inicio de sesión |
| `registro1.html` | Registro de empleados |
| `roles1.html` | Selección de rol |
| `meseros1.html` | Comanda, carrito y envío de pedidos mediante API |
| `cosina1.html` | Monitor de cocina con actualización por API |
| `admin.html` | Panel administrativo con estadísticas y tablas |
| `registro.js` | Lógica compartida del frontend y aviso de modo DEMO |
| `theme-editor.js` | Editor de tema conservado de la versión base |

El menú del mesero se carga desde `get_products`. Los pedidos de cocina y administración se consultan desde la API; ya no se leen pedidos desde `localStorage`.

## Datos DEMO

- 4 usuarios: `fastfood`, `maria`, `carlos` y `laura`; contraseña `1234`.
- 12 productos.
- 4 categorías: combos, pollo, burgers y extras.
- 3 roles.
- 7 mesas o puntos de entrega.
- 4 estados: pendiente, preparando, listo y despachado.
- 5 pedidos iniciales con 10 ítems.

## API

`frontend/api.php` delega en `backend/routes/api.php`.

Acciones disponibles:

- `login`
- `register`
- `get_users`
- `delete_user`
- `get_products`
- `get_catalogs`
- `get_orders`
- `submit_order`
- `update_status`
- `get_stats`
- `clear_orders`
- `clear_all`
- `get_system_info`
- `demo_reset`

## Base de datos

- `database/legacy/mysql/`: scripts MySQL de la versión 2.5. No se usan.
- `database/postgresql/`: carpetas reservadas para migraciones y semillas futuras. No contienen SQL ejecutable.

## Dependencias externas del frontend

- Tailwind CSS por CDN.
- Google Fonts: Bebas Neue y DM Sans.
- Imágenes de Unsplash en los productos DEMO.

## Pendientes

1. Implementar `PostgreSQLStorage` con PDO_PGSQL.
2. Definir migraciones y semillas PostgreSQL.
3. Habilitar y documentar la extensión `pdo_pgsql`.
4. Ejecutar las pruebas en un equipo con PHP 8 instalado.
5. Reemplazar la autenticación en texto plano y la sesión en `localStorage` en una etapa posterior.

## Notas de seguridad

- La autenticación y la sesión se conservaron sin cambios funcionales.
- Las contraseñas siguen en texto plano.
- El servidor embebido de PHP es solo para desarrollo local.
- Los archivos `.htaccess` bloquean rutas internas cuando se usa Apache.
