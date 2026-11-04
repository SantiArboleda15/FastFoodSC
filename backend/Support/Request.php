<?php
declare(strict_types=1);

namespace FastFoodSC\Support;

final class Request
{
    public static function json(): array
    {
        $raw = file_get_contents('php://input');

        if ($raw === false || trim($raw) === '') {
            return [];
        }

        $data = json_decode($raw, true);

        if (!is_array($data)) {
            throw new ValidationException('El cuerpo JSON no es válido.');
        }

        return $data;
    }

    public static function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    public static function string(string $key, string $default = ''): string
    {
        $value = $_GET[$key] ?? $default;

        return is_scalar($value) ? trim((string) $value) : $default;
    }

    public static function int(string $key, int $default = 0): int
    {
        $value = $_GET[$key] ?? null;

        return is_numeric($value) ? (int) $value : $default;
    }
}
