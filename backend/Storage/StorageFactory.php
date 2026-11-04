<?php
declare(strict_types=1);

namespace FastFoodSC\Storage;

use FastFoodSC\Contracts\StorageInterface;

require_once __DIR__ . '/../helpers/env.php';

final class StorageFactory
{
    public static function create(): StorageInterface
    {
        $driver = strtolower(trim((string) env('STORAGE_DRIVER', 'demo')));

        switch ($driver) {
            case 'demo':
            case 'mock':
            case 'session':
                return new MockStorage();

            case 'pgsql':
            case 'postgres':
            case 'postgresql':
                require_once __DIR__ . '/../config/database.php';

                return new PostgreSQLStorage(fastfoodsc_pgsql_config());

            default:
                throw new \InvalidArgumentException(
                    "STORAGE_DRIVER '$driver' no es válido. Use 'demo' o 'pgsql'."
                );
        }
    }
}
