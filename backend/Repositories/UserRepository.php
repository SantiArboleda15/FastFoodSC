<?php
declare(strict_types=1);

namespace FastFoodSC\Repositories;

use FastFoodSC\Contracts\StorageInterface;

final class UserRepository
{
    public function __construct(private StorageInterface $storage)
    {
    }

    public function all(): array
    {
        return array_map(
            fn (array $user): array => $this->publicUser($user),
            $this->storage->usersAll()
        );
    }

    public function findByCredentials(string $nombre, string $password): ?array
    {
        return $this->storage->userFindByCredentials($nombre, $password);
    }

    public function findByName(string $nombre): ?array
    {
        return $this->storage->userFindByName($nombre);
    }

    public function findByEmail(string $correo): ?array
    {
        foreach ($this->storage->usersAll() as $user) {
            if (strcasecmp((string) $user['correo'], $correo) === 0) {
                return $user;
            }
        }

        return null;
    }

    public function create(array $user): array
    {
        return $this->storage->userCreate($user);
    }

    public function deleteByName(string $nombre): bool
    {
        return $this->storage->userDeleteByName($nombre);
    }

    public function deleteExcept(array $nombres): int
    {
        return $this->storage->usersDeleteExcept($nombres);
    }

    public function count(): int
    {
        return $this->storage->usersCount();
    }

    private function publicUser(array $user): array
    {
        unset($user['password']);

        $fecha = (string) ($user['fechaRegistro'] ?? '');

        if ($fecha !== '') {
            $timestamp = strtotime($fecha);
            $user['fechaRegistro'] = $timestamp === false ? $fecha : date('d/m/Y', $timestamp);
        }

        return $user;
    }
}
