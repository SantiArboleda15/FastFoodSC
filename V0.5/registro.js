
document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.getElementById('regForm');
    if (regForm) {
        regForm.onsubmit = (e) => {
            e.preventDefault();
            const empleado = {
                nombre: document.getElementById('nombre').value,
                apellidos: document.getElementById('apellidos').value,
                salud: document.getElementById('salud').value,
                fechaRegistro: new Date().toLocaleDateString()
            };
            localStorage.setItem('usuario', empleado.nombre);
            localStorage.setItem('empleadoActivo', JSON.stringify(empleado));
            alert("¡Registro completado!");
            window.location.href = 'roles1.html';
        };
    }
    
    
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = localStorage.getItem('usuario') || "Sin Usuario";
        renderizarMenu();
    }
});


const productos = [
    { categoria: "🍔 HAMBURGUESAS", items: [{ n: "Sencilla", p: 15000 }, { n: "Doble", p: 22000 }] },
    { categoria: "🍟 ACOMPAÑANTES", items: [{ n: "Papas", p: 8000 }, { n: "Nuggets", p: 12000 }] },
    { categoria: "🥤 BEBIDAS", items: [{ n: "Gaseosa", p: 5000 }, { n: "Agua", p: 3000 }] }
];

let pedidoActual = [];

function renderizarMenu() {
    const contenedor = document.getElementById('contenedor-menu');
    if (!contenedor) return;
    contenedor.innerHTML = productos.map(cat => `
        <div class="mb-4">
            <h3 class="text-BLACK-500 text-[10px] font-black mb-3">${cat.categoria}</h3>
            <div class="grid grid-cols-2 gap-2">
                ${cat.items.map(p => `
                    <button onclick="agregarItem('${p.n}', ${p.p})" class="p-3 rounded-lg border -700 text-BLACK text-BLACK">
                        ${p.n} <br> <span class="text-BLACK-400">$${p.p}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function agregarItem(nombre, precio) {
    pedidoActual.push({ id: Date.now(), nombre, precio });
    actualizarTicket();
}

function actualizarTicket() {
    const lista = document.getElementById('lista-seleccionada');
    const totalDisplay = document.getElementById('total-precio');
    if (!lista) return;

    lista.innerHTML = pedidoActual.map(item => `
        <div class="flex justify-between bg-black/30 p-2 mb-1 rounded text-white text-xs">
            <span>${item.nombre}</span>
            <button onclick="eliminarItem(${item.id})" class="text-red-500">×</button>
        </div>
    `).join('') || "Vacío";

    const total = pedidoActual.reduce((acc, cur) => acc + cur.precio, 0);
    totalDisplay.textContent = "$" + total.toLocaleString();
}

function eliminarItem(id) {
    pedidoActual = pedidoActual.filter(i => i.id !== id);
    actualizarTicket();
}

function enviarPedido() {
    if (pedidoActual.length === 0) return alert("Pedido vacío");

    const nuevoTicket = {
        id: Date.now(),
        mesa: document.getElementById('mesa').value,
        mesero: localStorage.getItem('usuario'),
        items: pedidoActual,
        notas: document.getElementById('observaciones').value,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let cola = JSON.parse(localStorage.getItem('pedidos') || "[]");
    cola.push(nuevoTicket);
    localStorage.setItem('pedidos', JSON.stringify(cola));

    alert("✅ Enviado a Cocina");
    pedidoActual = [];
    document.getElementById('observaciones').value = "";
    actualizarTicket();
}


function cargarPedidos() {
    const contenedor = document.getElementById('listaPedidos');
    if (!contenedor) return; 

    const cola = JSON.parse(localStorage.getItem('pedidos') || "[]");
    contenedor.innerHTML = cola.map(p => `
        <div class="bg-slate-800 rounded-xl border-t-8 border-amber-500 p-5 mb-4 shadow-2xl ticket-animado">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-4xl font-black text-white">${p.mesa}</h2>
                <span class="text-xs text-slate-400 font-mono">${p.hora}</span>
            </div>
            <div class="bg-slate-700 p-2 rounded mb-3">
                <p class="text-[10px] text-amber-500 font-bold uppercase">Mesero:</p>
                <p class="text-white font-black">${p.mesero || 'General'}</p>
            </div>
            <div class="text-slate-200 text-sm mb-4">
                ${p.items.map(i => `<p>• ${i.nombre || i.n}</p>`).join('')}
            </div>
            ${p.notas ? `<p class="bg-amber-900/20 text-amber-300 p-2 text-xs italic mb-4">"${p.notas}"</p>` : ''}
            <button onclick="entregar(${p.id})" class="w-full bg-emerald-600 py-3 rounded-lg font-black text-white uppercase text-xs">
                DESPACHAR PEDIDO ✓
            </button>
        </div>
    `).join('') || '<p class="text-slate-500 text-center">Sin pedidos</p>';
}

function entregar(id) {
    let cola = JSON.parse(localStorage.getItem('pedidos') || "[]");
    cola = cola.filter(p => p.id !== id);
    localStorage.setItem('pedidos', JSON.stringify(cola));
    cargarPedidos();
}


if (document.getElementById('listaPedidos')) {
    setInterval(cargarPedidos, 2000);
    window.onload = cargarPedidos;
}   