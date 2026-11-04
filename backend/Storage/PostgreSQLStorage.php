<?php
declare(strict_types=1);

namespace FastFoodSC\Storage;

use FastFoodSC\Contracts\StorageInterface;

/**
 * Proveedor reservado para la futura integración con PostgreSQL.
 *
 * No abre conexiones ni ejecuta consultas todavía. La configuración y los
 * contratos ya están preparados para implementar PDO_PGSQL y repositorios SQL.
 */
final class PostgreSQLStorage implements StorageInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function mode(): string
    {
        return 'pgsql';
    }

    public function reset(): void
    {
        $this->unavailable();
    }

    public function transaction(callable $callback): mixed
    {
        $this->unavailable();
    }

    public function usersAll(): array
    {
        $this->unavailable();
    }

    public function userFindByName(string $nombre): ?array
    {
        $this->unavailable();
    }

    public function userFindByCredentials(string $nombre, string $password): ?array
    {
        $this->unavailable();
    }

    public function userCreate(array $user): array
    {
        $this->unavailable();
    }

    public function userDeleteByName(string $nombre): bool
    {
        $this->unavailable();
    }

    public function usersDeleteExcept(array $nombres): int
    {
        $this->unavailable();
    }

    public function usersCount(): int
    {
        $this->unavailable();
    }

    public function productsAll(): array
    {
        $this->unavailable();
    }

    public function productFindById(int $id): ?array
    {
        $this->unavailable();
    }

    public function categoriesAll(): array
    {
        $this->unavailable();
    }

    public function rolesAll(): array
    {
        $this->unavailable();
    }

    public function tablesAll(): array
    {
        $this->unavailable();
    }

    public function statesAll(): array
    {
        $this->unavailable();
    }

    public function ordersAll(): array
    {
        $this->unavailable();
    }

    public function orderFindById(int $id): ?array
    {
        $this->unavailable();
    }

    public function orderCreate(array $order, array $items): array
    {
        $this->unavailable();
    }

    public function orderUpdateStatus(int $id, string $estado, ?string $horaDespacho = null): ?array
    {
        $this->unavailable();
    }

    public function ordersDeleteAll(): int
    {
        $this->unavailable();
    }

    public function ordersCount(): int
    {
        $this->unavailable();
    }

    private function unavailable(): void
    {
        throw new \RuntimeException(
            'PostgreSQLStorage todavía no está implementado. Configure STORAGE_DRIVER=demo para usar datos simulados.'
        );
    }
}
