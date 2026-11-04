<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

use FastFoodSC\Repositories\CatalogRepository;
use FastFoodSC\Repositories\OrderRepository;
use FastFoodSC\Repositories\ProductRepository;
use FastFoodSC\Repositories\UserRepository;
use FastFoodSC\Services\AdminService;
use FastFoodSC\Services\AuthService;
use FastFoodSC\Services\CatalogService;
use FastFoodSC\Services\OrderService;
use FastFoodSC\Services\SystemService;
use FastFoodSC\Services\UserService;
use FastFoodSC\Support\NotFoundException;
use FastFoodSC\Support\Request;
use FastFoodSC\Support\Response;
use FastFoodSC\Support\ValidationException;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$storage = fastfoodsc_storage();

header('X-FastFoodSC-Mode: ' . $storage->mode());
header('X-FastFoodSC-Demo: ' . ($storage->mode() === 'demo' ? 'true' : 'false'));

$userRepository = new UserRepository($storage);
$productRepository = new ProductRepository($storage);
$catalogRepository = new CatalogRepository($storage);
$orderRepository = new OrderRepository($storage);

$authService = new AuthService($userRepository);
$userService = new UserService($userRepository);
$catalogService = new CatalogService($productRepository, $catalogRepository);
$orderService = new OrderService($orderRepository, $productRepository, $catalogRepository);
$adminService = new AdminService($storage, $orderRepository, $userRepository);
$systemService = new SystemService($storage);

$action = (string) ($_GET['action'] ?? '');

try {
    switch ($action) {
        case 'login':
            Response::json($authService->login(Request::json()));
            break;

        case 'register':
            Response::json($authService->register(Request::json()));
            break;

        case 'get_users':
            Response::json($userService->all());
            break;

        case 'delete_user':
            Response::json($userService->delete(Request::json()));
            break;

        case 'get_products':
            Response::json($catalogService->products());
            break;

        case 'get_catalogs':
            Response::json($catalogService->catalogs());
            break;

        case 'get_orders':
            Response::json($orderService->list([
                'estado' => Request::string('estado'),
                'mesa' => Request::string('mesa'),
                'mesero' => Request::string('mesero'),
                'q' => Request::string('q'),
                'desde' => Request::query('desde'),
                'hasta' => Request::query('hasta'),
                'limit' => Request::int('limit'),
            ]));
            break;

        case 'submit_order':
            Response::json($orderService->create(Request::json()));
            break;

        case 'update_status':
            Response::json($orderService->updateStatus(Request::json()));
            break;

        case 'get_stats':
            Response::json($adminService->stats());
            break;

        case 'clear_orders':
            Response::json($adminService->clearOrders());
            break;

        case 'clear_all':
            Response::json($adminService->clearAll());
            break;

        case 'get_system_info':
            Response::json($systemService->info());
            break;

        case 'demo_reset':
            Response::json($adminService->resetDemo());
            break;

        default:
            Response::error("Acción '$action' no reconocida.", 400);
    }
} catch (ValidationException $e) {
    Response::error($e->getMessage(), 400);
} catch (NotFoundException $e) {
    Response::error($e->getMessage(), 404);
} catch (\Throwable $e) {
    error_log('FastFoodSC API: ' . $e->getMessage());

    $extra = [];
    if (filter_var(env('APP_DEBUG', false), FILTER_VALIDATE_BOOLEAN)) {
        $extra['detalle'] = $e->getMessage();
    }

    Response::error('Error interno del servidor.', 500, $extra);
}
