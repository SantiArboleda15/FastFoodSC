# Credenciales DEMO de FastFoodSC

> Archivo exclusivo para desarrollo local y demostraciones. No usar estas
> credenciales en producción.

## Administrador

| Campo | Valor |
|---|---|
| URL | `http://localhost:8000/` |
| Usuario | `admin` |
| Contraseña | `AdminDemo2026!` |
| Rol | `administrador` |
| Estado | Activo |

Este usuario accede al panel administrativo (`frontend/pages/admin.html`) y
es la cuenta recomendada para revisar estadísticas, pedidos, productos,
categorías, mesas, usuarios, reportes y configuración.

## Usuarios heredados

| Usuario | Contraseña | Rol | Estado |
|---|---|---|---|
| `fastfood` | `1234` | Administrador | Activo |
| `maria` | `1234` | Mesero | Activo |
| `carlos` | `1234` | Cocinero | Activo |
| `laura` | `1234` | Mesero | Activo |

Los usuarios heredados conservan sus contraseñas DEMO para no romper los
flujos existentes, pero ahora se almacenan como hash bcrypt.

## Notas

- Las contraseñas se verifican con `password_verify()`.
- La sesión autenticada se guarda en la sesión PHP (`fastfoodsc_auth`) y el
  frontend conserva una referencia en `localStorage`.
- Al cerrar sesión se eliminan ambos estados.
- El usuario `admin` está protegido y no puede eliminarse desde la interfaz.
- Para restaurar los datos iniciales usar la acción `demo_reset` del panel
  administrativo.
