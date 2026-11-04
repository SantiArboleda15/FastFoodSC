<?php
declare(strict_types=1);

namespace FastFoodSC\Services;

use FastFoodSC\Contracts\StorageInterface;
use FastFoodSC\Repositories\OrderRepository;
use FastFoodSC\Repositories\UserRepository;

final class AdminService
{
    public function __construct(
        private StorageInterface $storage,
        private OrderRepository $orders,
        private UserRepository $users
    ) {
    }

    public function stats(): array
    {
        $orders = $this->orders->all();
        $completados = 0;
        $activos = 0;
        $ingresos = 0;

        foreach ($orders as $order) {
            if (($order['estado'] ?? '') === 'despachado') {
                $completados++;
                $ingresos += $this->orders->total($order);
            } else {
                $activos++;
            }
        }

        return [
            'completados' => $completados,
            'activos' => $activos,
            'empleados' => $this->users->count(),
            'ingresos' => $ingresos,
            'promedio' => $completados > 0 ? (int) round($ingresos / $completados) : 0,
            'modo' => $this->storage->mode(),
            'demo' => $this->storage->mode() === 'demo',
        ];
    }

    public function clearOrders(): array
    {
        $deleted = $this->orders->deleteAll();

        return ['success' => true, 'eliminados' => $deleted];
    }

    public function clearAll(): array
    {
        return $this->storage->transaction(function (): array {
            $orders = $this->orders->deleteAll();
            $users = $this->users->deleteExcept(['fastfood', 'admin']);

            return [
                'success' => true,
                'pedidosEliminados' => $orders,
                'empleadosEliminados' => $users,
            ];
        });
    }

    public function resetDemo(): array
    {
        $this->storage->reset();

        return ['success' => true, 'mensaje' => 'Datos DEMO restaurados.'];
    }
}
