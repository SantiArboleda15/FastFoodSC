<?php
declare(strict_types=1);

namespace FastFoodSC\Services;

use FastFoodSC\Repositories\UserRepository;
use FastFoodSC\Support\ValidationException;

final class UserService
{
    public function __construct(private UserRepository $users)
    {
    }

    public function all(): array
    {
        return $this->users->all();
    }

    public function delete(array $input): array
    {
        $nombre = trim((string) ($input['nombre'] ?? ''));

        if ($nombre === '') {
            throw new ValidationException('El nombre del empleado es obligatorio.');
        }

        $this->users->deleteByName($nombre);

        return ['success' => true, 'nombre' => $nombre];
    }
}
