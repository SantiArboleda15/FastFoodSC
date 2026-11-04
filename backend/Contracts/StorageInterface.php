<?php
declare(strict_types=1);

namespace FastFoodSC\Contracts;

interface StorageInterface
{
    public function mode(): string;

    public function reset(): void;

    public function transaction(callable $callback): mixed;

    public function usersAll(): array;

    public function userFindByName(string $nombre): ?array;

    public function userFindByCredentials(string $nombre, string $password): ?array;

    public function userCreate(array $user): array;

    public function userDeleteByName(string $nombre): bool;

    public function usersDeleteExcept(array $nombres): int;

    public function usersCount(): int;

    public function productsAll(): array;

    public function productFindById(int $id): ?array;

    public function categoriesAll(): array;

    public function rolesAll(): array;

    public function tablesAll(): array;

    public function statesAll(): array;

    public function ordersAll(): array;

    public function orderFindById(int $id): ?array;

    public function orderCreate(array $order, array $items): array;

    public function orderUpdateStatus(int $id, string $estado, ?string $horaDespacho = null): ?array;

    public function ordersDeleteAll(): int;

    public function ordersCount(): int;
}
