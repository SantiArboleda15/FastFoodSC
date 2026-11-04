<?php
declare(strict_types=1);

namespace FastFoodSC\Repositories;

use FastFoodSC\Contracts\StorageInterface;

final class ProductRepository
{
    public function __construct(private StorageInterface $storage)
    {
    }

    public function all(): array
    {
        return $this->storage->productsAll();
    }

    public function findById(int $id): ?array
    {
        return $this->storage->productFindById($id);
    }
}
