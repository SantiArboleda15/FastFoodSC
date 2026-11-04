<?php
declare(strict_types=1);

use FastFoodSC\Repositories\CatalogRepository;
use FastFoodSC\Repositories\OrderRepository;
use FastFoodSC\Repositories\ProductRepository;
use FastFoodSC\Repositories\UserRepository;
use FastFoodSC\Services\AdminService;
use FastFoodSC\Services\CatalogService;
use FastFoodSC\Services\OrderService;
use FastFoodSC\Services\SystemService;
use FastFoodSC\Storage\PostgreSQLStorage;

$root = dirname(__DIR__);

$requiredFiles = [
    'README.md',
    '.env.example',
    'composer.json',
    'index.php',
    'frontend/index.php',
    'frontend/api.php',
    'frontend/pages/index.html',
    'frontend/pages/registro1.html',
    'frontend/pages/roles1.html',
    'frontend/pages/meseros1.html',
    'frontend/pages/cosina1.html',
    'frontend/pages/admin.html',
    'frontend/assets/css/style.css',
    'frontend/assets/js/registro.js',
    'frontend/assets/img/image_414dac.png',
    'backend/bootstrap.php',
    'backend/Contracts/StorageInterface.php',
    'backend/Data/DemoData.php',
    'backend/Storage/MockStorage.php',
    'backend/Storage/PostgreSQLStorage.php',
    'backend/Storage/StorageFactory.php',
    'backend/Repositories/UserRepository.php',
    'backend/Repositories/ProductRepository.php',
    'backend/Repositories/OrderRepository.php',
    'backend/Repositories/CatalogRepository.php',
    'backend/Services/AuthService.php',
    'backend/Services/UserService.php',
    'backend/Services/CatalogService.php',
    'backend/Services/OrderService.php',
    'backend/Services/AdminService.php',
    'backend/Services/SystemService.php',
    'backend/routes/api.php',
    'backend/config/database.php',
    'backend/helpers/env.php',
    'database/legacy/mysql/fastfoodsc.sql',
    'database/postgresql/README.md',
];

$failures = [];

function check(bool $condition, string $message, array &$failures): void
{
    echo ($condition ? '[OK]   ' : '[FALLA] ') . $message . PHP_EOL;

    if (!$condition) {
        $failures[] = $message;
    }
}

echo "FastFoodSC 3.0 - Verificación de estructura y modo DEMO\n";
echo "========================================================\n";

foreach ($requiredFiles as $file) {
    check(is_file($root . '/' . $file), 'Archivo: ' . $file, $failures);
}

require_once $root . '/backend/bootstrap.php';

try {
    $storage = fastfoodsc_storage();
    $storage->reset();

    $users = new UserRepository($storage);
    $productRepository = new ProductRepository($storage);
    $catalogRepository = new CatalogRepository($storage);
    $orderRepository = new OrderRepository($storage);

    $catalogService = new CatalogService($productRepository, $catalogRepository);
    $orderService = new OrderService($orderRepository, $productRepository, $catalogRepository);
    $adminService = new AdminService($storage, $orderRepository, $users);
    $systemService = new SystemService($storage);

    $info = $systemService->info();
    check($storage->mode() === 'demo', 'STORAGE_DRIVER activo: demo', $failures);
    check($info['demo'] === true, 'get_system_info identifica el modo DEMO', $failures);
    check($users->count() >= 4, 'Usuarios DEMO disponibles', $failures);
    check(count($catalogService->products()) >= 12, 'Productos DEMO disponibles', $failures);
    check(count($catalogRepository->categories()) >= 4, 'Categorías DEMO disponibles', $failures);
    check(count($catalogRepository->tables()) >= 7, 'Mesas DEMO disponibles', $failures);
    check(count($catalogRepository->states()) === 4, 'Estados de preparación disponibles', $failures);

    $stats = $adminService->stats();
    check($stats['completados'] === 2 && $stats['activos'] === 3, 'Estadísticas DEMO coherentes', $failures);
    check(count($orderService->list(['estado' => 'activos'])) === 3, 'Filtro de pedidos activos', $failures);
    check(count($orderService->list(['estado' => 'despachado'])) === 2, 'Filtro de pedidos despachados', $failures);

    $created = $orderService->create([
        'numero' => 'SMOKE',
        'mesa' => 'Mesa 1',
        'mesero' => 'smoke-test',
        'notas' => 'Pedido temporal de verificación',
        'items' => [
            ['producto_id' => 1, 'cantidad' => 1],
            ['producto_id' => 7, 'cantidad' => 2],
        ],
    ]);

    check(($created['success'] ?? false) === true, 'Crear pedido DEMO', $failures);

    $updated = $orderService->updateStatus([
        'id' => (int) $created['id'],
        'nuevoEstado' => 'preparando',
    ]);

    check(($updated['success'] ?? false) === true, 'Cambiar estado de pedido DEMO', $failures);

    $filtered = $orderService->list(['mesa' => 'Mesa 1', 'q' => 'SMOKE']);
    check(count($filtered) === 1, 'Filtrar pedidos por mesa y texto', $failures);
    $storage->reset();
} catch (Throwable $e) {
    check(false, 'Error en el flujo DEMO: ' . $e->getMessage(), $failures);
}

try {
    $pgsql = new PostgreSQLStorage([]);
    check($pgsql->mode() === 'pgsql', 'Proveedor PostgreSQL seleccionable', $failures);

    try {
        $pgsql->usersAll();
        check(false, 'PostgreSQLStorage debe rechazar operaciones hasta implementarse', $failures);
    } catch (RuntimeException $e) {
        check(true, 'PostgreSQLStorage rechaza operaciones hasta implementarse', $failures);
    }
} catch (Throwable $e) {
    check(false, 'Error al validar PostgreSQLStorage: ' . $e->getMessage(), $failures);
}

if ($failures === []) {
    echo PHP_EOL . 'Resultado: todas las verificaciones estáticas y DEMO pasaron.' . PHP_EOL;
    exit(0);
}

echo PHP_EOL . 'Resultado: ' . count($failures) . ' verificación(es) fallaron.' . PHP_EOL;
exit(1);
