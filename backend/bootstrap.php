<?php
declare(strict_types=1);

if (!defined('FASTFOODSC_ROOT')) {
    define('FASTFOODSC_ROOT', dirname(__DIR__));
}

require_once __DIR__ . '/helpers/env.php';

loadEnv(FASTFOODSC_ROOT . '/.env');

spl_autoload_register(static function (string $class): void {
    $prefix = 'FastFoodSC\\';

    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $file = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';

    if (is_file($file)) {
        require_once $file;
    }
});

if (session_status() === PHP_SESSION_NONE) {
    $sessionDir = FASTFOODSC_ROOT . '/storage/demo/sessions';

    if (!is_dir($sessionDir)) {
        @mkdir($sessionDir, 0775, true);
    }

    if (is_dir($sessionDir) && is_writable($sessionDir)) {
        @session_save_path($sessionDir);
    }

    @session_name('fastfoodsc_demo');

    if (!@session_start()) {
        error_log('FastFoodSC: no fue posible iniciar la sesión PHP para MockStorage.');
    }
}

if (!function_exists('fastfoodsc_storage')) {
    function fastfoodsc_storage(): \FastFoodSC\Contracts\StorageInterface
    {
        static $storage = null;

        if ($storage === null) {
            $storage = \FastFoodSC\Storage\StorageFactory::create();
        }

        return $storage;
    }
}
