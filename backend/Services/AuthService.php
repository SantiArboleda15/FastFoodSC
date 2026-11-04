<?php
declare(strict_types=1);

namespace FastFoodSC\Services;

use FastFoodSC\Repositories\UserRepository;
use FastFoodSC\Support\ValidationException;

final class AuthService
{
    public function __construct(private UserRepository $users)
    {
    }

    public function login(array $input): array
    {
        $nombre = trim((string) ($input['user'] ?? ''));
        $password = (string) ($input['pass'] ?? '');

        if ($nombre === '' || $password === '') {
            return ['success' => false, 'error' => 'Datos incompletos'];
        }

        $user = $this->users->findByCredentials($nombre, $password);

        if ($user === null) {
            return ['success' => false, 'error' => 'Usuario o contraseña incorrectos'];
        }

        return [
            'success' => true,
            'nombre' => (string) $user['nombre'],
            'rol' => (string) ($user['rol'] ?? 'mesero'),
        ];
    }

    public function register(array $input): array
    {
        $nombre = trim((string) ($input['nombre'] ?? ''));
        $apellidos = trim((string) ($input['apellidos'] ?? ''));
        $telefono = trim((string) ($input['telefono'] ?? ''));
        $correo = trim((string) ($input['correo'] ?? ''));
        $password = (string) ($input['password'] ?? '');

        if ($nombre === '' || $apellidos === '' || $telefono === '' || $correo === '' || $password === '') {
            throw new ValidationException('Todos los campos son obligatorios.');
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException('Correo electrónico inválido.');
        }

        if (strlen($password) < 4) {
            throw new ValidationException('La contraseña debe tener al menos 4 caracteres.');
        }

        if ($this->users->findByName($nombre) !== null || $this->users->findByEmail($correo) !== null) {
            throw new ValidationException('El nombre de usuario o correo ya está registrado.');
        }

        $user = $this->users->create([
            'nombre' => $nombre,
            'apellidos' => $apellidos,
            'telefono' => $telefono,
            'correo' => $correo,
            'password' => $password,
            'rol' => (string) ($input['rol'] ?? 'mesero'),
        ]);

        return [
            'success' => true,
            'nombre' => (string) $user['nombre'],
            'rol' => (string) ($user['rol'] ?? 'mesero'),
        ];
    }
}
