<?php
declare(strict_types=1);

namespace FastFoodSC\Storage;

use FastFoodSC\Contracts\StorageInterface;
use FastFoodSC\Data\DemoData;
use FastFoodSC\Support\ValidationException;

/**
 * Almacenamiento temporal en la sesión PHP.
 *
 * No usa MySQL ni PostgreSQL. Los cambios viven mientras exista la sesión del
 * navegador y se reinician al cerrar la sesión o llamar a reset().
 */
final class MockStorage implements StorageInterface
{
    private const SESSION_KEY = 'fastfoodsc_demo_state';

    private array $state;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }

        if (isset($_SESSION[self::SESSION_KEY]) && is_array($_SESSION[self::SESSION_KEY])) {
            $this->state = $_SESSION[self::SESSION_KEY];
            return;
        }

        $this->state = DemoData::make();
        $this->persist();
    }

    public function mode(): string
    {
        return 'demo';
    }

    public function reset(): void
    {
        $this->state = DemoData::make();
        $this->persist();
    }

    public function transaction(callable $callback): mixed
    {
        $snapshot = $this->state;

        try {
            $result = $callback();
            $this->persist();

            return $result;
        } catch (\Throwable $e) {
            $this->state = $snapshot;
            $this->persist();

            throw $e;
        }
    }

    public function usersAll(): array
    {
        return array_values($this->state['users']);
    }

    public function userFindByName(string $nombre): ?array
    {
        foreach ($this->state['users'] as $user) {
            if (strcasecmp((string) $user['nombre'], $nombre) === 0) {
                return $user;
            }
        }

        return null;
    }

    public function userFindByCredentials(string $nombre, string $password): ?array
    {
        foreach ($this->state['users'] as $user) {
            if (
                strcasecmp((string) $user['nombre'], $nombre) === 0
                && (string) $user['password'] === $password
            ) {
                return $user;
            }
        }

        return null;
    }

    public function userCreate(array $user): array
    {
        $nombre = trim((string) ($user['nombre'] ?? ''));
        $correo = trim((string) ($user['correo'] ?? ''));

        if ($this->userFindByName($nombre) !== null || $this->userFindByEmail($correo) !== null) {
            throw new ValidationException('El nombre de usuario o correo ya está registrado.');
        }

        $id = (int) ($this->state['next_ids']['user'] ?? 1);
        $this->state['next_ids']['user'] = $id + 1;

        $record = [
            'id' => $id,
            'nombre' => $nombre,
            'apellidos' => trim((string) ($user['apellidos'] ?? '')),
            'telefono' => trim((string) ($user['telefono'] ?? '')),
            'correo' => $correo,
            'password' => (string) ($user['password'] ?? ''),
            'rol' => (string) ($user['rol'] ?? 'mesero'),
            'fechaRegistro' => (string) ($user['fechaRegistro'] ?? date('Y-m-d H:i:s')),
        ];

        $this->state['users'][] = $record;
        $this->persist();

        return $record;
    }

    public function userDeleteByName(string $nombre): bool
    {
        $before = count($this->state['users']);

        $this->state['users'] = array_values(array_filter(
            $this->state['users'],
            static fn (array $user): bool => strcasecmp((string) $user['nombre'], $nombre) !== 0
        ));

        $deleted = count($this->state['users']) < $before;

        if ($deleted) {
            $this->persist();
        }

        return $deleted;
    }

    public function usersDeleteExcept(array $nombres): int
    {
        $keep = array_map(static fn (string $nombre): string => strtolower($nombre), $nombres);
        $before = count($this->state['users']);

        $this->state['users'] = array_values(array_filter(
            $this->state['users'],
            static fn (array $user): bool => in_array(strtolower((string) $user['nombre']), $keep, true)
        ));

        $deleted = $before - count($this->state['users']);

        if ($deleted > 0) {
            $this->persist();
        }

        return $deleted;
    }

    public function usersCount(): int
    {
        return count($this->state['users']);
    }

    public function productsAll(): array
    {
        $products = array_values($this->state['products']);

        usort($products, static function (array $a, array $b): int {
            return [$a['orden'] ?? 0, $a['id']] <=> [$b['orden'] ?? 0, $b['id']];
        });

        return $products;
    }

    public function productFindById(int $id): ?array
    {
        foreach ($this->state['products'] as $product) {
            if ((int) $product['id'] === $id) {
                return $product;
            }
        }

        return null;
    }

    public function categoriesAll(): array
    {
        return array_values($this->state['categories']);
    }

    public function rolesAll(): array
    {
        return array_values($this->state['roles']);
    }

    public function tablesAll(): array
    {
        return array_values($this->state['tables']);
    }

    public function statesAll(): array
    {
        return array_values($this->state['states']);
    }

    public function ordersAll(): array
    {
        return array_map(
            fn (array $order): array => $this->hydrateOrder($order),
            array_values($this->state['orders'])
        );
    }

    public function orderFindById(int $id): ?array
    {
        foreach ($this->state['orders'] as $order) {
            if ((int) $order['id'] === $id) {
                return $this->hydrateOrder($order);
            }
        }

        return null;
    }

    public function orderCreate(array $order, array $items): array
    {
        $id = (int) ($this->state['next_ids']['order'] ?? 1);
        $this->state['next_ids']['order'] = $id + 1;

        $record = [
            'id' => $id,
            'numero' => (string) ($order['numero'] ?? '000'),
            'mesa_id' => $order['mesa_id'] ?? null,
            'mesa' => (string) ($order['mesa'] ?? 'General'),
            'mesero' => (string) ($order['mesero'] ?? 'Anónimo'),
            'notas' => (string) ($order['notas'] ?? ''),
            'hora' => (string) ($order['hora'] ?? date('H:i')),
            'horaDespacho' => $order['horaDespacho'] ?? null,
            'estado' => (string) ($order['estado'] ?? 'pendiente'),
            'timestamp' => (int) ($order['timestamp'] ?? (int) round(microtime(true) * 1000)),
            'createdAt' => (string) ($order['createdAt'] ?? date('Y-m-d H:i:s')),
        ];

        $this->state['orders'][] = $record;

        foreach ($items as $item) {
            $itemId = (int) ($this->state['next_ids']['order_item'] ?? 1);
            $this->state['next_ids']['order_item'] = $itemId + 1;

            $cantidad = max(1, (int) ($item['cantidad'] ?? 1));
            $precio = (int) ($item['precio_unitario'] ?? 0);

            $this->state['order_items'][] = [
                'id' => $itemId,
                'pedido_id' => $id,
                'producto_id' => $item['producto_id'] ?? null,
                'nombre' => (string) ($item['nombre'] ?? 'Producto'),
                'cantidad' => $cantidad,
                'precio_unitario' => $precio,
                'subtotal' => $cantidad * $precio,
            ];
        }

        $this->persist();

        return $this->hydrateOrder($record);
    }

    public function orderUpdateStatus(int $id, string $estado, ?string $horaDespacho = null): ?array
    {
        foreach ($this->state['orders'] as $index => $order) {
            if ((int) $order['id'] !== $id) {
                continue;
            }

            $this->state['orders'][$index]['estado'] = $estado;

            if ($estado === 'despachado') {
                $this->state['orders'][$index]['horaDespacho'] = $horaDespacho ?? date('H:i');
            }

            $this->persist();

            return $this->hydrateOrder($this->state['orders'][$index]);
        }

        return null;
    }

    public function ordersDeleteAll(): int
    {
        $deleted = count($this->state['orders']);

        $this->state['orders'] = [];
        $this->state['order_items'] = [];
        $this->state['next_ids']['order'] = 1;
        $this->state['next_ids']['order_item'] = 1;

        $this->persist();

        return $deleted;
    }

    public function ordersCount(): int
    {
        return count($this->state['orders']);
    }

    private function userFindByEmail(string $correo): ?array
    {
        foreach ($this->state['users'] as $user) {
            if (strcasecmp((string) $user['correo'], $correo) === 0) {
                return $user;
            }
        }

        return null;
    }

    private function hydrateOrder(array $order): array
    {
        $items = [];

        foreach ($this->state['order_items'] as $item) {
            if ((int) $item['pedido_id'] !== (int) $order['id']) {
                continue;
            }

            $cantidad = max(1, (int) $item['cantidad']);
            $precio = (int) $item['precio_unitario'];

            $items[] = [
                'id' => (int) $item['id'],
                'producto_id' => $item['producto_id'] !== null ? (int) $item['producto_id'] : null,
                'nombre' => (string) $item['nombre'],
                'precio' => $precio,
                'cantidad' => $cantidad,
                'subtotal' => $cantidad * $precio,
            ];
        }

        usort($items, static fn (array $a, array $b): int => $a['id'] <=> $b['id']);

        $order['items'] = $items;
        $order['total'] = array_sum(array_column($items, 'subtotal'));

        return $order;
    }

    private function persist(): void
    {
        $_SESSION[self::SESSION_KEY] = $this->state;
    }
}
