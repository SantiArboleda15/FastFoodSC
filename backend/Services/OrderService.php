<?php
declare(strict_types=1);

namespace FastFoodSC\Services;

use FastFoodSC\Repositories\CatalogRepository;
use FastFoodSC\Repositories\OrderRepository;
use FastFoodSC\Repositories\ProductRepository;
use FastFoodSC\Support\NotFoundException;
use FastFoodSC\Support\ValidationException;

final class OrderService
{
    public function __construct(
        private OrderRepository $orders,
        private ProductRepository $products,
        private CatalogRepository $catalogs
    ) {
    }

    public function list(array $filters): array
    {
        return $this->orders->all($filters);
    }

    public function create(array $input): array
    {
        $rawItems = $input['items'] ?? [];

        if (!is_array($rawItems) || $rawItems === []) {
            throw new ValidationException('El pedido debe contener al menos un producto.');
        }

        $estado = strtolower(trim((string) ($input['estado'] ?? 'pendiente')));
        $estadosValidos = array_column($this->catalogs->states(), 'id');

        if (!in_array($estado, $estadosValidos, true)) {
            throw new ValidationException('El estado del pedido no es válido.');
        }

        $items = [];

        foreach ($rawItems as $item) {
            if (!is_array($item)) {
                throw new ValidationException('Uno de los ítems del pedido no es válido.');
            }

            $productoId = (int) ($item['producto_id'] ?? $item['id'] ?? 0);
            $producto = $productoId > 0 ? $this->products->findById($productoId) : null;

            $nombre = trim((string) ($item['nombre'] ?? ($producto['nombre'] ?? '')));
            $precio = (int) ($item['precio'] ?? ($producto['precio'] ?? 0));
            $cantidad = (int) ($item['cantidad'] ?? $item['qty'] ?? 1);

            if ($producto !== null) {
                $nombre = (string) $producto['nombre'];
                $precio = (int) $producto['precio'];
            }

            if ($nombre === '') {
                throw new ValidationException('Uno de los ítems del pedido no tiene nombre.');
            }

            if ($precio < 0) {
                throw new ValidationException('Uno de los ítems del pedido tiene un precio inválido.');
            }

            $cantidad = max(1, $cantidad);

            $items[] = [
                'producto_id' => $producto['id'] ?? null,
                'nombre' => $nombre,
                'cantidad' => $cantidad,
                'precio_unitario' => $precio,
            ];
        }

        $mesa = trim((string) ($input['mesa'] ?? ''));
        $mesa = $mesa === '' ? 'General' : $mesa;
        $table = $this->catalogs->findTableByName($mesa);

        $numero = trim((string) ($input['numero'] ?? ''));
        $numero = $numero === '' ? $this->nextOrderNumber() : $numero;

        $order = [
            'numero' => $numero,
            'mesa_id' => $table['id'] ?? null,
            'mesa' => (string) ($table['nombre'] ?? $mesa),
            'mesero' => trim((string) ($input['mesero'] ?? 'Anónimo')) ?: 'Anónimo',
            'notas' => trim((string) ($input['notas'] ?? '')),
            'hora' => trim((string) ($input['hora'] ?? '')) ?: date('H:i'),
            'estado' => $estado,
            'timestamp' => (int) ($input['timestamp'] ?? (int) round(microtime(true) * 1000)),
        ];

        $created = $this->orders->create($order, $items);

        return [
            'success' => true,
            'id' => (int) $created['id'],
            'numero' => (string) $created['numero'],
        ];
    }

    public function updateStatus(array $input): array
    {
        $id = (int) ($input['id'] ?? 0);
        $estado = strtolower(trim((string) ($input['nuevoEstado'] ?? '')));

        if ($id <= 0) {
            throw new ValidationException('ID de pedido inválido.');
        }

        $estadosValidos = array_column($this->catalogs->states(), 'id');

        if (!in_array($estado, $estadosValidos, true)) {
            throw new ValidationException('El estado del pedido no es válido.');
        }

        $order = $this->orders->updateStatus($id, $estado);

        if ($order === null) {
            throw new NotFoundException('Pedido no encontrado.');
        }

        return [
            'success' => true,
            'id' => $id,
            'estado' => $estado,
        ];
    }

    private function nextOrderNumber(): string
    {
        $max = 0;

        foreach ($this->orders->all() as $order) {
            $numero = (string) ($order['numero'] ?? '');

            if (ctype_digit($numero)) {
                $max = max($max, (int) $numero);
            }
        }

        return str_pad((string) ($max + 1), 3, '0', STR_PAD_LEFT);
    }
}
