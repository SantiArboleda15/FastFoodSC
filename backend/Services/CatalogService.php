<?php
declare(strict_types=1);

namespace FastFoodSC\Services;

use FastFoodSC\Repositories\CatalogRepository;
use FastFoodSC\Repositories\ProductRepository;

final class CatalogService
{
    public function __construct(
        private ProductRepository $products,
        private CatalogRepository $catalogs
    ) {
    }

    public function products(): array
    {
        return $this->products->all();
    }

    public function catalogs(): array
    {
        return [
            'roles' => $this->catalogs->roles(),
            'categorias' => $this->catalogs->categories(),
            'mesas' => $this->catalogs->tables(),
            'estados' => $this->catalogs->states(),
        ];
    }
}
