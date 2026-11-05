# Pruebas

## Requisitos

- PHP 8 instalado y disponible en el `Path`.
- No se necesita MySQL, MariaDB, PostgreSQL, Apache ni XAMPP.

## Verificación automática

Desde la raíz del proyecto:

```powershell
php tests/smoke_test.php
```

La prueba comprueba:

1. Existencia de los archivos principales.
2. Carga de `backend/bootstrap.php` y del autoload.
3. Modo DEMO activo con `MockStorage`.
4. Usuarios, productos, categorías, mesas y estados simulados.
5. Estadísticas iniciales del panel admin.
6. Filtros de pedidos activos y despachados.
7. Creación de un pedido temporal.
8. Cambio de estado del pedido.
9. Rechazo controlado de `PostgreSQLStorage` hasta su implementación.

La prueba restaura los datos DEMO al finalizar. No abre conexiones a bases de datos.

## Validación de JavaScript

Con Node.js instalado:

```powershell
node --check frontend/assets/js/registro.js
node --check frontend/assets/js/admin.js
node --check frontend/assets/js/theme-editor.js
```

## Pruebas manuales en modo DEMO

1. Iniciar el servidor desde la raíz:

   ```powershell
   php -S localhost:8000 -t .
   ```

2. Abrir `http://localhost:8000/`.
3. Iniciar sesión con `admin` / `AdminDemo2026!`.
4. Verificar que se abre `admin.html` y que el dashboard carga datos.
5. Registrar un empleado y comprobar que aparece en Usuarios.
6. Crear un pedido desde el panel de mesero.
7. Verificar que el pedido aparece en cocina.
8. Avanzar el estado: pendiente → preparando → listo → despachado.
9. Comprobar estadísticas, reportes, pedidos completados y pedidos activos.
10. Iniciar sesión con `maria` / `1234` y confirmar que `get_users` responde `403`.
11. Cerrar sesión y verificar la redirección al login.
12. Reiniciar el sistema y confirmar que vuelven los datos DEMO iniciales.

## Nota

Si `php` no está instalado o no está en el `Path`, las pruebas no pueden ejecutarse. En ese caso no debe afirmarse que la aplicación fue verificada en ejecución.
