# Base de datos

FastFoodSC 3.0 funciona actualmente en **modo DEMO** y no necesita MySQL ni PostgreSQL.

## Estado actual

- La aplicación usa `MockStorage`, un almacenamiento temporal en la sesión PHP.
- Los datos simulados se definen en `backend/Data/DemoData.php`.
- No se ejecuta ninguna conexión a base de datos.

## MySQL legado

Los scripts de la versión 2.5 se conservaron únicamente como referencia histórica:

```text
database/legacy/mysql/
├── fastfoodsc.sql
├── 001_create_schema.sql
└── 001_seed_data.sql
```

No son usados por la aplicación actual y no deben importarse para probar el modo DEMO.

## PostgreSQL futuro

La carpeta `database/postgresql/` está reservada para las futuras migraciones y semillas. Todavía no contiene SQL ejecutable ni se ha implementado `PDO_PGSQL`.
