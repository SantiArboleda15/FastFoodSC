<?php
declare(strict_types=1);

namespace FastFoodSC\Data;

/**
 * Datos simulados de FastFoodSC 3.0.
 *
 * Este archivo es la única fuente de verdad del modo DEMO. Los repositorios y
 * servicios no deben declarar productos, usuarios ni pedidos por su cuenta.
 */
final class DemoData
{
    public static function make(): array
    {
        $now    = time();
        $iso    = static fn (int $offset): string => date('Y-m-d H:i:s', $now + $offset);
        $hora   = static fn (int $offset): string => date('H:i', $now + $offset);
        $millis = static fn (int $offset): int => ($now + $offset) * 1000;

        return [
            'meta' => [
                'seed_version' => '3.0-demo',
                'generated_at' => $iso(0),
            ],

            'next_ids' => [
                'user'       => 5,
                'product'    => 13,
                'order'      => 6,
                'order_item' => 11,
            ],

            'roles' => [
                ['id' => 'administrador', 'nombre' => 'Administrador', 'ruta' => 'admin.html', 'descripcion' => 'Consulta estadísticas y gestiona empleados.'],
                ['id' => 'mesero', 'nombre' => 'Mesero', 'ruta' => 'meseros1.html', 'descripcion' => 'Toma pedidos y consulta el menú.'],
                ['id' => 'cocinero', 'nombre' => 'Cocinero', 'ruta' => 'cosina1.html', 'descripcion' => 'Prepara pedidos y actualiza su estado.'],
            ],

            'categories' => [
                ['id' => 'combo', 'nombre' => 'Combos', 'icono' => '🍗', 'orden' => 1],
                ['id' => 'pollo', 'nombre' => 'Pollo', 'icono' => '🍗', 'orden' => 2],
                ['id' => 'burger', 'nombre' => 'Burgers', 'icono' => '🍔', 'orden' => 3],
                ['id' => 'extra', 'nombre' => 'Extras', 'icono' => '🍟', 'orden' => 4],
            ],

            'states' => [
                ['id' => 'pendiente', 'nombre' => 'Pendiente', 'orden' => 1, 'siguiente' => 'preparando', 'final' => false],
                ['id' => 'preparando', 'nombre' => 'En preparación', 'orden' => 2, 'siguiente' => 'listo', 'final' => false],
                ['id' => 'listo', 'nombre' => 'Listo para entregar', 'orden' => 3, 'siguiente' => 'despachado', 'final' => false],
                ['id' => 'despachado', 'nombre' => 'Despachado', 'orden' => 4, 'siguiente' => null, 'final' => true],
            ],

            'tables' => [
                ['id' => 1, 'nombre' => 'Mesa 1', 'tipo' => 'mesa', 'capacidad' => 4, 'disponible' => true],
                ['id' => 2, 'nombre' => 'Mesa 2', 'tipo' => 'mesa', 'capacidad' => 4, 'disponible' => true],
                ['id' => 3, 'nombre' => 'Mesa 3', 'tipo' => 'mesa', 'capacidad' => 4, 'disponible' => true],
                ['id' => 4, 'nombre' => 'Mesa 4', 'tipo' => 'mesa', 'capacidad' => 6, 'disponible' => true],
                ['id' => 5, 'nombre' => 'Mesa 5', 'tipo' => 'mesa', 'capacidad' => 6, 'disponible' => true],
                ['id' => 6, 'nombre' => 'Para Llevar', 'tipo' => 'llevar', 'capacidad' => 0, 'disponible' => true],
                ['id' => 7, 'nombre' => 'Domicilio', 'tipo' => 'domicilio', 'capacidad' => 0, 'disponible' => true],
            ],

            'users' => [
                [
                    'id' => 1,
                    'nombre' => 'fastfood',
                    'apellidos' => 'Admin',
                    'telefono' => '3000000000',
                    'correo' => 'admin@fastfood.com',
                    'password' => '1234',
                    'rol' => 'administrador',
                    'fechaRegistro' => $iso(-86400 * 30),
                ],
                [
                    'id' => 2,
                    'nombre' => 'maria',
                    'apellidos' => 'Gómez',
                    'telefono' => '3001112233',
                    'correo' => 'maria@fastfood.com',
                    'password' => '1234',
                    'rol' => 'mesero',
                    'fechaRegistro' => $iso(-86400 * 12),
                ],
                [
                    'id' => 3,
                    'nombre' => 'carlos',
                    'apellidos' => 'Pérez',
                    'telefono' => '3004445566',
                    'correo' => 'carlos@fastfood.com',
                    'password' => '1234',
                    'rol' => 'cocinero',
                    'fechaRegistro' => $iso(-86400 * 8),
                ],
                [
                    'id' => 4,
                    'nombre' => 'laura',
                    'apellidos' => 'Rodríguez',
                    'telefono' => '3007778899',
                    'correo' => 'laura@fastfood.com',
                    'password' => '1234',
                    'rol' => 'mesero',
                    'fechaRegistro' => $iso(-86400 * 3),
                ],
            ],

            'products' => [
                [
                    'id' => 1,
                    'nombre' => 'Bucket 8 Piezas',
                    'descripcion' => '8 piezas de pollo crujiente + 2 complementos + 2 bebidas',
                    'precio' => 189,
                    'categoria' => 'combo',
                    'imagen' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 1,
                ],
                [
                    'id' => 2,
                    'nombre' => 'Mega Combo Familiar',
                    'descripcion' => '12 piezas + 4 complementos + 4 bebidas + 4 postres',
                    'precio' => 299,
                    'categoria' => 'combo',
                    'imagen' => 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 2,
                ],
                [
                    'id' => 3,
                    'nombre' => '2 Piezas de Pollo',
                    'descripcion' => 'Pollo original crujiente, jugoso por dentro',
                    'precio' => 89,
                    'categoria' => 'pollo',
                    'imagen' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 1,
                ],
                [
                    'id' => 4,
                    'nombre' => '3 Piezas de Pollo',
                    'descripcion' => 'Triple porción de pollo frito dorado',
                    'precio' => 119,
                    'categoria' => 'pollo',
                    'imagen' => 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 2,
                ],
                [
                    'id' => 5,
                    'nombre' => 'Zinger Burger',
                    'descripcion' => 'Filete de pollo picante, lechuga, mayonesa, pan brioche',
                    'precio' => 95,
                    'categoria' => 'burger',
                    'imagen' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 1,
                ],
                [
                    'id' => 6,
                    'nombre' => 'Doble Crunch Burger',
                    'descripcion' => 'Doble filete crujiente, queso cheddar, salsa BBQ',
                    'precio' => 115,
                    'categoria' => 'burger',
                    'imagen' => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 2,
                ],
                [
                    'id' => 7,
                    'nombre' => 'Papas Fritas Grandes',
                    'descripcion' => 'Papas doradas y crujientes, tamaño familiar',
                    'precio' => 45,
                    'categoria' => 'extra',
                    'imagen' => 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 1,
                ],
                [
                    'id' => 8,
                    'nombre' => 'Puré de Papa con Gravy',
                    'descripcion' => 'Puré cremoso con salsa gravy casera',
                    'precio' => 39,
                    'categoria' => 'extra',
                    'imagen' => 'https://images.unsplash.com/photo-1574484284008-7d1f3c4d9e0a?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 2,
                ],
                [
                    'id' => 9,
                    'nombre' => 'Coleslaw',
                    'descripcion' => 'Repollo fresco con aderezo especial',
                    'precio' => 35,
                    'categoria' => 'extra',
                    'imagen' => 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 3,
                ],
                [
                    'id' => 10,
                    'nombre' => 'Biscuit de Miel',
                    'descripcion' => 'Panecillo suave con mantequilla de miel',
                    'precio' => 25,
                    'categoria' => 'extra',
                    'imagen' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 4,
                ],
                [
                    'id' => 11,
                    'nombre' => 'Refresco 600ml',
                    'descripcion' => 'Coca-Cola, Sprite, Fanta o agua',
                    'precio' => 28,
                    'categoria' => 'extra',
                    'imagen' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 5,
                ],
                [
                    'id' => 12,
                    'nombre' => 'Pie de Manzana',
                    'descripcion' => 'Postre caliente con canela y manzana',
                    'precio' => 32,
                    'categoria' => 'extra',
                    'imagen' => 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop',
                    'disponible' => true,
                    'orden' => 6,
                ],
            ],

            'orders' => [
                [
                    'id' => 1,
                    'numero' => '101',
                    'mesa_id' => 2,
                    'mesa' => 'Mesa 2',
                    'mesero' => 'maria',
                    'notas' => 'Sin cebolla',
                    'hora' => $hora(-3 * 60),
                    'horaDespacho' => null,
                    'estado' => 'pendiente',
                    'timestamp' => $millis(-3 * 60),
                    'createdAt' => $iso(-3 * 60),
                ],
                [
                    'id' => 2,
                    'numero' => '102',
                    'mesa_id' => 5,
                    'mesa' => 'Mesa 5',
                    'mesero' => 'laura',
                    'notas' => 'Bebidas sin hielo',
                    'hora' => $hora(-9 * 60),
                    'horaDespacho' => null,
                    'estado' => 'preparando',
                    'timestamp' => $millis(-9 * 60),
                    'createdAt' => $iso(-9 * 60),
                ],
                [
                    'id' => 3,
                    'numero' => '103',
                    'mesa_id' => 6,
                    'mesa' => 'Para Llevar',
                    'mesero' => 'maria',
                    'notas' => 'Empacar por separado',
                    'hora' => $hora(-14 * 60),
                    'horaDespacho' => null,
                    'estado' => 'listo',
                    'timestamp' => $millis(-14 * 60),
                    'createdAt' => $iso(-14 * 60),
                ],
                [
                    'id' => 4,
                    'numero' => '104',
                    'mesa_id' => 1,
                    'mesa' => 'Mesa 1',
                    'mesero' => 'fastfood',
                    'notas' => '',
                    'hora' => $hora(-38 * 60),
                    'horaDespacho' => $hora(-30 * 60),
                    'estado' => 'despachado',
                    'timestamp' => $millis(-38 * 60),
                    'createdAt' => $iso(-38 * 60),
                ],
                [
                    'id' => 5,
                    'numero' => '105',
                    'mesa_id' => 7,
                    'mesa' => 'Domicilio',
                    'mesero' => 'laura',
                    'notas' => 'Llamar al llegar',
                    'hora' => $hora(-55 * 60),
                    'horaDespacho' => $hora(-42 * 60),
                    'estado' => 'despachado',
                    'timestamp' => $millis(-55 * 60),
                    'createdAt' => $iso(-55 * 60),
                ],
            ],

            'order_items' => [
                ['id' => 1, 'pedido_id' => 1, 'producto_id' => 3, 'nombre' => '2 Piezas de Pollo', 'cantidad' => 2, 'precio_unitario' => 89, 'subtotal' => 178],
                ['id' => 2, 'pedido_id' => 1, 'producto_id' => 7, 'nombre' => 'Papas Fritas Grandes', 'cantidad' => 1, 'precio_unitario' => 45, 'subtotal' => 45],
                ['id' => 3, 'pedido_id' => 2, 'producto_id' => 1, 'nombre' => 'Bucket 8 Piezas', 'cantidad' => 1, 'precio_unitario' => 189, 'subtotal' => 189],
                ['id' => 4, 'pedido_id' => 2, 'producto_id' => 11, 'nombre' => 'Refresco 600ml', 'cantidad' => 2, 'precio_unitario' => 28, 'subtotal' => 56],
                ['id' => 5, 'pedido_id' => 3, 'producto_id' => 5, 'nombre' => 'Zinger Burger', 'cantidad' => 2, 'precio_unitario' => 95, 'subtotal' => 190],
                ['id' => 6, 'pedido_id' => 3, 'producto_id' => 9, 'nombre' => 'Coleslaw', 'cantidad' => 1, 'precio_unitario' => 35, 'subtotal' => 35],
                ['id' => 7, 'pedido_id' => 4, 'producto_id' => 2, 'nombre' => 'Mega Combo Familiar', 'cantidad' => 1, 'precio_unitario' => 299, 'subtotal' => 299],
                ['id' => 8, 'pedido_id' => 4, 'producto_id' => 12, 'nombre' => 'Pie de Manzana', 'cantidad' => 1, 'precio_unitario' => 32, 'subtotal' => 32],
                ['id' => 9, 'pedido_id' => 5, 'producto_id' => 6, 'nombre' => 'Doble Crunch Burger', 'cantidad' => 1, 'precio_unitario' => 115, 'subtotal' => 115],
                ['id' => 10, 'pedido_id' => 5, 'producto_id' => 7, 'nombre' => 'Papas Fritas Grandes', 'cantidad' => 2, 'precio_unitario' => 45, 'subtotal' => 90],
            ],
        ];
    }
}
