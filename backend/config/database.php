<?php
declare(strict_types=1);

require_once __DIR__ . '/../helpers/env.php';

loadEnv(dirname(__DIR__, 2) . '/.env');

/*
 * Configuración preparada para PostgreSQL.
 * No abre ninguna conexión todavía: el modo DEMO usa MockStorage.
 */

if (!function_exists('fastfoodsc_pgsql_config')) {
    function fastfoodsc_pgsql_config(): array
    {
        return [
            'driver'   => 'pgsql',
            'host'     => (string) env('DB_HOST', 'localhost'),
            'port'     => (string) env('DB_PORT', '5432'),
            'database' => (string) env('DB_NAME', 'fastfoodsc'),
            'username' => (string) env('DB_USER', 'postgres'),
            'password' => (string) env('DB_PASS', ''),
            'charset'  => (string) env('DB_CHARSET', 'utf8'),
            'sslmode'  => (string) env('DB_SSLMODE', 'prefer'),
        ];
    }
}

if (!function_exists('fastfoodsc_pgsql_dsn')) {
    function fastfoodsc_pgsql_dsn(): string
    {
        $config = fastfoodsc_pgsql_config();

        return sprintf(
            'pgsql:host=%s;port=%s;dbname=%s;sslmode=%s',
            $config['host'],
            $config['port'],
            $config['database'],
            $config['sslmode']
        );
    }
}
