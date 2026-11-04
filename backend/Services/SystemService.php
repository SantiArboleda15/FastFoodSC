<?php
declare(strict_types=1);

namespace FastFoodSC\Services;

use FastFoodSC\Contracts\StorageInterface;

final class SystemService
{
    public function __construct(private StorageInterface $storage)
    {
    }

    public function info(): array
    {
        $mode = $this->storage->mode();

        return [
            'version' => '3.0.0-demo',
            'modo' => $mode,
            'demo' => $mode === 'demo',
            'storage' => get_class($this->storage),
            'persistencia' => $mode === 'demo' ? 'Sesión PHP (MockStorage)' : 'PostgreSQL',
            'mensaje' => $mode === 'demo'
                ? 'Datos simulados. No hay MySQL ni PostgreSQL conectados.'
                : 'Proveedor PostgreSQL seleccionado, pendiente de implementación.',
        ];
    }
}
