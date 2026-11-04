# PostgreSQL (pendiente)

Esta carpeta queda preparada para la futura migración de FastFoodSC a PostgreSQL.

## Convención prevista

```text
database/postgresql/
├── migrations/
│   └── 001_create_schema.sql
└── seeds/
    └── 001_seed_data.sql
```

## Pendiente antes de agregar SQL

1. Definir el esquema equivalente a las entidades actuales: usuarios, roles, categorías, productos, mesas, pedidos, detalle de pedidos y estados.
2. Decidir tipos, claves foráneas, índices y secuencias.
3. Implementar `PostgreSQLStorage` con PDO_PGSQL.
4. Agregar pruebas de conexión y transacciones.
5. Documentar variables de entorno y credenciales locales.

No se generaron tablas ni consultas PostgreSQL en esta etapa.
