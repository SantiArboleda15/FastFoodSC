<?php
declare(strict_types=1);

namespace FastFoodSC\Support;

final class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(array $extra = [], int $status = 200): void
    {
        self::json(array_merge($extra, ['success' => true]), $status);
    }

    public static function error(string $message, int $status = 400, array $extra = []): void
    {
        self::json(array_merge($extra, ['success' => false, 'error' => $message]), $status);
    }
}
