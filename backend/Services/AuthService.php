<?php
declare(strict_types=1);

namespace FastFoodSC\Services;

use FastFoodSC\Repositories\UserRepository;
use FastFoodSC\Support\ValidationException;

final class AuthService
{
    private const SESSION_KEY = 'fastfoodsc_auth';

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

        if ($user === null || ($user['activo'] ?? true) !== true) {
            return ['success' => false, 'error' => 'Usuario o contraseña incorrectos'];
        }

        $sessionUser = [
            'id' => (int) ($user['id'] ?? 0),
            'nombre' => (string) $user['nombre'],
            'rol' => (string) ($user['rol'] ?? 'mesero'),
            'loginAt' => date('c'),
        ];

        $this->writeSession($sessionUser);

        return array_merge(['success' => true], $sessionUser);
    }

    public function register(array $input): array
    {
        $nombre = trim((string) ($input['nombre'] ?? ''));
        $apellidos = trim((string) ($input['apellidos'] ?? ''));
        $telefono = trim((string) ($input['telefono'] ?? ''));
        $correo = trim((string) ($input['correo'] ?? ''));
        $password = (string) ($input['password'] ?? '');
        $rol = strtolower(trim((string) ($input['rol'] ?? 'mesero')));

        if ($nombre === '' || $apellidos === '' || $telefono === '' || $correo === '' || $password === '') {
            throw new ValidationException('Todos los campos son obligatorios.');
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException('Correo electrónico inválido.');
        }

        if (strlen($password) < 4) {
            throw new ValidationException('La contraseña debe tener al menos 4 caracteres.');
        }

        if (!in_array($rol, ['mesero', 'cocinero'], true)) {
            throw new ValidationException('El rol solicitado no está permitido en el registro público.');
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
            'rol' => $rol,
            'activo' => true,
        ]);

        $sessionUser = [
            'id' => (int) ($user['id'] ?? 0),
            'nombre' => (string) $user['nombre'],
            'rol' => (string) ($user['rol'] ?? $rol),
            'loginAt' => date('c'),
        ];

        $this->writeSession($sessionUser);

        return array_merge(['success' => true], $sessionUser);
    }

    public function currentUser(): ?array
    {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }

        $user = $_SESSION[self::SESSION_KEY] ?? null;

        return is_array($user) ? $user : null;
    }

    public function logout(): array
    {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }

        unset($_SESSION[self::SESSION_KEY]);

        if (session_status() === PHP_SESSION_ACTIVE) {
            @session_regenerate_id(true);
        }

        return ['success' => true, 'mensaje' => 'Sesión cerrada correctamente.'];
    }

    private function writeSession(array $user): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }

        if (session_status() === PHP_SESSION_ACTIVE) {
            @session_regenerate_id(true);
        }

        $_SESSION[self::SESSION_KEY] = $user;
    }
}
