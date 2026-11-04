<?php
declare(strict_types=1);

namespace FastFoodSC\Repositories;

use FastFoodSC\Contracts\StorageInterface;

final class OrderRepository
{
    public function __construct(private StorageInterface $storage)
    {
    }

    /**
     * Filtros admitidos: estado, mesa, mesero, q, desde, hasta y limit.
     * "estado=activos" agrupa todo lo que no está despachado.
     */
    public function all(array $filters = []): array
    {
        $orders = $this->storage->ordersAll();

        $estado = strtolower(trim((string) ($filters['estado'] ?? '')));
        $mesa   = trim((string) ($filters['mesa'] ?? ''));
        $mesero = trim((string) ($filters['mesero'] ?? ''));
        $q      = trim((string) ($filters['q'] ?? ''));

        $desde = isset($filters['desde']) && is_numeric($filters['desde'])
            ? (int) $filters['desde']
            : null;

        $hasta = isset($filters['hasta']) && is_numeric($filters['hasta'])
            ? (int) $filters['hasta']
            : null;

        $orders = array_values(array_filter(
            $orders,
            static function (array $order) use ($estado, $mesa, $mesero, $q, $desde, $hasta): bool {
                $orderEstado = strtolower((string) ($order['estado'] ?? ''));

                if ($estado === 'activos') {
                    if ($orderEstado === 'despachado') {
                        return false;
                    }
                } elseif ($estado !== '' && $orderEstado !== $estado) {
                    return false;
                }

                if ($mesa !== '' && strcasecmp((string) ($order['mesa'] ?? ''), $mesa) !== 0) {
                    return false;
                }

                if ($mesero !== '' && strcasecmp((string) ($order['mesero'] ?? ''), $mesero) !== 0) {
                    return false;
                }

                if ($desde !== null && (int) ($order['timestamp'] ?? 0) < $desde) {
                    return false;
                }

                if ($hasta !== null && (int) ($order['timestamp'] ?? 0) > $hasta) {
                    return false;
                }

                if ($q !== '') {
                    $itemNames = array_column($order['items'] ?? [], 'nombre');
                    $haystack = implode(' ', [
                        (string) ($order['numero'] ?? ''),
                        (string) ($order['mesa'] ?? ''),
                        (string) ($order['mesero'] ?? ''),
                        (string) ($order['notas'] ?? ''),
                        implode(' ', $itemNames),
                    ]);

                    if (stripos($haystack, $q) === false) {
                        return false;
                    }
                }

                return true;
            }
        ));

        if ($estado === 'despachado') {
            usort($orders, static function (array $a, array $b): int {
                $comparison = strcmp(
                    (string) ($b['createdAt'] ?? ''),
                    (string) ($a['createdAt'] ?? '')
                );

                return $comparison !== 0
                    ? $comparison
                    : ((int) ($b['timestamp'] ?? 0) <=> (int) ($a['timestamp'] ?? 0));
            });
        } elseif ($estado === 'activos') {
            usort(
                $orders,
                static fn (array $a, array $b): int => (int) ($a['timestamp'] ?? 0) <=> (int) ($b['timestamp'] ?? 0)
            );
        } else {
            usort(
                $orders,
                static fn (array $a, array $b): int => (int) ($b['timestamp'] ?? 0) <=> (int) ($a['timestamp'] ?? 0)
            );
        }

        $limit = isset($filters['limit']) && is_numeric($filters['limit'])
            ? (int) $filters['limit']
            : ($estado === 'despachado' ? 50 : 0);

        if ($limit > 0) {
            $orders = array_slice($orders, 0, $limit);
        }

        return array_values($orders);
    }

    public function findById(int $id): ?array
    {
        return $this->storage->orderFindById($id);
    }

    public function create(array $order, array $items): array
    {
        return $this->storage->transaction(
            fn (): array => $this->storage->orderCreate($order, $items)
        );
    }

    public function updateStatus(int $id, string $estado): ?array
    {
        return $this->storage->orderUpdateStatus($id, $estado);
    }

    public function deleteAll(): int
    {
        return $this->storage->ordersDeleteAll();
    }

    public function count(): int
    {
        return $this->storage->ordersCount();
    }

    public function total(array $order): int
    {
        $total = 0;

        foreach ($order['items'] ?? [] as $item) {
            $total += (int) ($item['precio'] ?? 0) * (int) ($item['cantidad'] ?? 1);
        }

        return $total;
    }
}
