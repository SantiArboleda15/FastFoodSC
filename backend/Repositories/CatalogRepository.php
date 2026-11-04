<?php
declare(strict_types=1);

namespace FastFoodSC\Repositories;

use FastFoodSC\Contracts\StorageInterface;

final class CatalogRepository
{
    public function __construct(private StorageInterface $storage)
    {
    }

    public function roles(): array
    {
        return $this->storage->rolesAll();
    }

    public function categories(): array
    {
        return $this->storage->categoriesAll();
    }

    public function tables(): array
    {
        return $this->storage->tablesAll();
    }

    public function states(): array
    {
        return $this->storage->statesAll();
    }

    public function findTableByName(string $nombre): ?array
    {
        foreach ($this->tables() as $table) {
            if (strcasecmp((string) $table['nombre'], $nombre) === 0) {
                return $table;
            }
        }

        return null;
    }
}
