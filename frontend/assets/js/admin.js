/* ============================================================
   FastFoodSC — Lógica del panel administrativo (modo DEMO)
   ============================================================ */

const API = '../api.php';

const STATUS = {
    pendiente: { label: 'Pendiente', cls: 'status-pendiente', color: '#f59e0b' },
    preparando: { label: 'En preparación', cls: 'status-preparando', color: '#3b82f6' },
    listo: { label: 'Listo para entregar', cls: 'status-listo', color: '#10b981' },
    despachado: { label: 'Despachado', cls: 'status-despachado', color: '#94a3b8' }
};

const ICONS = {
    sales: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/></svg>',
    orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>',
    pending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 7l-8-4-8 4 8 4 8-4z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 4.5a3.2 3.2 0 0 1 0 6.2M17.5 14.2A5.5 5.5 0 0 1 20.5 20"/></svg>',
    average: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5M4 19h16"/><path d="M7 15l4-4 3 2 4-5"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5L16 9"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l9 17H3L12 3z"/><path d="M12 9v5M12 17h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
};

const state = {
    me: null,
    orders: [],
    filteredOrders: [],
    products: [],
    users: [],
    catalogs: null,
    stats: null,
    filters: { q: '', estado: '', mesa: '' },
    currentSection: 'dashboard',
    timers: []
};

let modalConfirmResolver = null;

/* ── Utilidades HTTP ── */
async function request(action, options = {}) {
    const url = new URL(API, window.location.href);
    url.searchParams.set('action', action);

    Object.entries(options.params || {}).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            url.searchParams.set(key, value);
        }
    });

    const init = {
        method: options.method || 'GET',
        cache: 'no-store',
        headers: {}
    };

    if (options.body !== undefined) {
        init.headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), init);
    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error('El servidor devolvió una respuesta no válida.');
    }

    if (!response.ok) {
        const error = new Error((data && data.error) || `Error ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

/* ── Utilidades de formato ── */
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[character]));
}

function formatCOP(value) {
    return '$' + Number(value || 0).toLocaleString('es-CO');
}

function orderTotal(order) {
    return (order.items || []).reduce((total, item) => {
        return total + Number(item.precio || 0) * Number(item.cantidad || item.qty || 1);
    }, 0);
}

function orderItemCount(order) {
    return (order.items || []).reduce((total, item) => {
        return total + Number(item.cantidad || item.qty || 1);
    }, 0);
}

function orderDate(order) {
    if (order.timestamp !== undefined && order.timestamp !== null) {
        const date = new Date(Number(order.timestamp));
        if (!Number.isNaN(date.getTime())) return date;
    }

    if (order.createdAt) {
        const date = new Date(String(order.createdAt).replace(' ', 'T'));
        if (!Number.isNaN(date.getTime())) return date;
    }

    return null;
}

function isToday(date) {
    if (!date) return false;
    const now = new Date();
    return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
}

function formatDateTime(order) {
    const date = orderDate(order);

    if (!date) {
        return `${escapeHtml(order.hora || '—')}`;
    }

    return `${date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}
        <span class="cell-sub">${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>`;
}

function initials(name) {
    return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

function statusInfo(status) {
    return STATUS[status] || { label: status || 'Sin estado', cls: 'status-despachado', color: '#94a3b8' };
}

function statusBadge(status) {
    const info = statusInfo(status);
    return `<span class="status-badge ${info.cls}">${escapeHtml(info.label)}</span>`;
}

/* ── Toasts ── */
function showToast(type, title, message = '') {
    const root = document.getElementById('toastRoot');
    if (!root) return;

    const icon = ICONS[type] || ICONS.info;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        ${icon}
        <div>
            <strong>${escapeHtml(title)}</strong>
            ${message ? `<span>${escapeHtml(message)}</span>` : ''}
        </div>`;

    root.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity .2s ease, transform .2s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(12px)';
        setTimeout(() => toast.remove(), 220);
    }, 4200);
}

/* ── Modales ── */
function openModal({ eyebrow = 'Detalle', title, body, actions = [] }) {
    const backdrop = document.getElementById('modalBackdrop');
    const titleEl = document.getElementById('modalTitle');
    const eyebrowEl = document.getElementById('modalEyebrow');
    const bodyEl = document.getElementById('modalBody');
    const footerEl = document.getElementById('modalFooter');

    eyebrowEl.textContent = eyebrow;
    titleEl.textContent = title;
    bodyEl.innerHTML = body;
    footerEl.innerHTML = '';

    actions.forEach(action => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn ${action.className || 'btn-light'}`;
        button.textContent = action.label;
        button.addEventListener('click', () => {
            if (typeof action.onClick === 'function') {
                action.onClick();
            } else {
                closeModal();
            }
        });
        footerEl.appendChild(button);
    });

    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) return;

    backdrop.hidden = true;
    document.body.style.overflow = '';

    if (modalConfirmResolver) {
        modalConfirmResolver(false);
        modalConfirmResolver = null;
    }
}

function confirmDialog({ title, message, confirmLabel = 'Confirmar', dangerous = false }) {
    return new Promise(resolve => {
        modalConfirmResolver = resolve;

        const confirmButton = {
            label: confirmLabel,
            className: dangerous ? 'btn-danger' : 'btn-primary',
            onClick: () => {
                const currentResolver = modalConfirmResolver;
                modalConfirmResolver = null;
                document.getElementById('modalBackdrop').hidden = true;
                document.body.style.overflow = '';
                if (currentResolver) currentResolver(true);
            }
        };

        openModal({
            eyebrow: 'Confirmación',
            title,
            body: `<p style="margin:0;color:var(--text-soft);line-height:1.6">${escapeHtml(message)}</p>`,
            actions: [
                { label: 'Cancelar', className: 'btn-light', onClick: closeModal },
                confirmButton
            ]
        });
    });
}

/* ── Sesión y arranque ── */
async function bootstrap() {
    try {
        const session = await request('me');

        if (!session.success || session.autenticado !== true) {
            denyAccess('Debes iniciar sesión para acceder al panel administrativo.', 'index.html');
            return;
        }

        if (session.rol !== 'administrador') {
            denyAccess('Esta cuenta no tiene permisos para acceder al panel administrativo.', 'roles1.html');
            return;
        }

        state.me = session;
        renderSessionUser();

        document.getElementById('authGate').hidden = true;
        document.getElementById('adminApp').hidden = false;

        bindEvents();

        try {
            await ensureCatalogs();
        } catch (error) {
            showToast('error', 'No se pudieron cargar los catálogos', error.message);
        }

        goTo(sectionFromHash(), { updateHash: false });
        startAutoRefresh();
    } catch (error) {
        denyAccess('No fue posible verificar la sesión con el servidor.', null, true);
    }
}

function denyAccess(message, redirectUrl, retry = false) {
    const gate = document.getElementById('authGate');
    const gateMessage = document.getElementById('gateMessage');

    if (gate) gate.classList.add('is-error');
    if (gateMessage) gateMessage.textContent = message;

    if (!retry && redirectUrl === 'index.html') {
        ['ff_session', 'ff_role', 'ff_user_id', 'usuario'].forEach(key => localStorage.removeItem(key));
    }

    if (redirectUrl) {
        setTimeout(() => window.location.replace(redirectUrl), 1500);
    }
}

function renderSessionUser() {
    const name = state.me.nombre || 'Administrador';
    const role = state.me.rol || 'administrador';

    ['profileName', 'profileMenuName'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = name;
    });

    ['profileRole'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = role;
    });

    const menuRole = document.getElementById('profileMenuRole');
    if (menuRole) menuRole.textContent = `Rol: ${role}`;

    ['profileAvatar', 'profileMenuAvatar'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = initials(name);
    });
}

function sectionFromHash() {
    const value = window.location.hash.replace('#', '');
    return document.getElementById(`section-${value}`) ? value : 'dashboard';
}

function startAutoRefresh() {
    const timer = setInterval(() => {
        if (document.getElementById('modalBackdrop').hidden === false) return;

        if (state.currentSection === 'pedidos') {
            loadPedidos({ silent: true });
        } else if (state.currentSection === 'dashboard') {
            loadDashboard({ silent: true });
        }
    }, 15000);

    state.timers.push(timer);
}

/* ── Navegación ── */
function bindEvents() {
    document.querySelectorAll('.nav-item[data-section]').forEach(button => {
        button.addEventListener('click', () => goTo(button.dataset.section));
    });

    document.querySelectorAll('[data-go]').forEach(button => {
        button.addEventListener('click', () => goTo(button.dataset.go));
    });

    document.getElementById('sidebarCollapse')?.addEventListener('click', toggleSidebarCollapse);
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => toggleMobileSidebar(true));
    document.getElementById('sidebarBackdrop')?.addEventListener('click', () => toggleMobileSidebar(false));

    document.getElementById('sidebarLogout')?.addEventListener('click', logout);
    document.getElementById('profileLogout')?.addEventListener('click', logout);

    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    profileBtn?.addEventListener('click', event => {
        event.stopPropagation();
        toggleDropdown(profileMenu, profileBtn);
    });

    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    notificationsBtn?.addEventListener('click', event => {
        event.stopPropagation();
        toggleDropdown(notificationPanel, notificationsBtn);
    });

    document.addEventListener('click', () => {
        closeDropdown(profileMenu, profileBtn);
        closeDropdown(notificationPanel, notificationsBtn);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModal();
            closeDropdown(profileMenu, profileBtn);
            closeDropdown(notificationPanel, notificationsBtn);
            toggleMobileSidebar(false);
        }
    });

    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalBackdrop')?.addEventListener('click', event => {
        if (event.target === event.currentTarget) closeModal();
    });

    document.getElementById('globalSearchForm')?.addEventListener('submit', event => {
        event.preventDefault();
        const input = document.getElementById('globalSearchInput');
        const query = input ? input.value.trim() : '';
        state.filters.q = query;
        const ordersSearch = document.getElementById('ordersSearch');
        if (ordersSearch) ordersSearch.value = query;
        goTo('pedidos');
    });

    document.getElementById('refreshOrders')?.addEventListener('click', () => loadPedidos());
    document.getElementById('ordersApply')?.addEventListener('click', applyOrderFilters);
    document.getElementById('ordersClear')?.addEventListener('click', clearOrderFilters);

    document.getElementById('exportReport')?.addEventListener('click', exportReport);
    document.getElementById('demoResetBtn')?.addEventListener('click', resetDemo);
    document.getElementById('clearOrdersBtn')?.addEventListener('click', clearOrders);
    document.getElementById('clearAllBtn')?.addEventListener('click', clearAll);

    window.addEventListener('hashchange', () => goTo(sectionFromHash(), { updateHash: false }));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) toggleMobileSidebar(false);
    });
}

function goTo(section, options = {}) {
    if (!document.getElementById(`section-${section}`)) section = 'dashboard';

    state.currentSection = section;

    document.querySelectorAll('.nav-item[data-section]').forEach(button => {
        button.classList.toggle('active', button.dataset.section === section);
    });

    document.querySelectorAll('.admin-section').forEach(panel => {
        panel.hidden = panel.id !== `section-${section}`;
    });

    const active = document.getElementById(`section-${section}`);
    const title = active?.dataset.title || 'Dashboard';
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) titleElement.textContent = title;

    if (options.updateHash !== false) {
        history.replaceState(null, '', `#${section}`);
    }

    toggleMobileSidebar(false);
    loadSection(section);
}

function loadSection(section) {
    switch (section) {
        case 'dashboard': return loadDashboard();
        case 'pedidos': return loadPedidos();
        case 'productos': return loadProductos();
        case 'categorias': return loadCategorias();
        case 'mesas': return loadMesas();
        case 'usuarios': return loadUsuarios();
        case 'reportes': return loadReportes();
        case 'configuracion': return loadConfiguracion();
        default: return null;
    }
}

function toggleSidebarCollapse() {
    const shell = document.getElementById('adminApp');
    if (!shell) return;

    shell.classList.toggle('sidebar-collapsed');
    localStorage.setItem('ff_admin_sidebar', shell.classList.contains('sidebar-collapsed') ? 'collapsed' : 'open');
}

function toggleMobileSidebar(open) {
    const shell = document.getElementById('adminApp');
    if (!shell) return;

    shell.classList.toggle('sidebar-open', Boolean(open));
}

function toggleDropdown(menu, button) {
    if (!menu || !button) return;

    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
}

function closeDropdown(menu, button) {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    button?.setAttribute('aria-expanded', 'false');
}

async function logout() {
    try {
        await request('logout', { method: 'POST' });
    } catch (error) {
        // La sesión local se limpia incluso si la red falla.
    }

    ['ff_session', 'ff_role', 'ff_user_id', 'usuario'].forEach(key => localStorage.removeItem(key));
    window.location.replace('index.html');
}

/* ── Catálogos compartidos ── */
async function ensureCatalogs() {
    if (state.catalogs) return state.catalogs;

    state.catalogs = await request('get_catalogs');
    populateCatalogSelects();
    return state.catalogs;
}

function populateCatalogSelects() {
    const stateSelect = document.getElementById('ordersState');
    const mesaSelect = document.getElementById('ordersMesa');
    const catalogs = state.catalogs;

    if (!catalogs) return;

    if (stateSelect && stateSelect.options.length <= 1) {
        const extra = document.createElement('option');
        extra.value = 'activos';
        extra.textContent = 'Solo activos';
        stateSelect.appendChild(extra);

        (catalogs.estados || []).forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre;
            stateSelect.appendChild(option);
        });
    }

    if (mesaSelect && mesaSelect.options.length <= 1) {
        (catalogs.mesas || []).forEach(item => {
            const option = document.createElement('option');
            option.value = item.nombre;
            option.textContent = item.nombre;
            mesaSelect.appendChild(option);
        });
    }
}

function catalogName(collection, id, fallback = '—') {
    const found = (collection || []).find(item => String(item.id) === String(id));
    return found ? found.nombre : fallback;
}

/* ── Dashboard ── */
async function loadDashboard(options = {}) {
    const statsContainer = document.getElementById('dashStats');

    if (!options.silent && statsContainer) {
        statsContainer.innerHTML = skeletonStats();
    }

    try {
        const [stats, orders, products] = await Promise.all([
            request('get_stats'),
            request('get_orders', { params: { limit: 300 } }),
            state.products.length ? Promise.resolve(state.products) : request('get_products')
        ]);

        state.stats = stats;
        state.orders = Array.isArray(orders) ? orders : [];
        state.products = Array.isArray(products) ? products : [];

        renderDashboardStats();
        renderSalesChart();
        renderStatusChart();
        renderRecentOrders();
        renderActiveOrders();
        updateNotifications();
    } catch (error) {
        if (statsContainer) {
            statsContainer.innerHTML = `<div class="panel" style="grid-column:1/-1">
                <div class="empty-state"><h3>No se pudo cargar el dashboard</h3><p>${escapeHtml(error.message)}</p></div>
            </div>`;
        }
        showToast('error', 'Error al cargar el dashboard', error.message);
    }
}

function skeletonStats() {
    return Array.from({ length: 5 }).map(() => `
        <div class="stat-card" style="--stat-color:#e2e8f0">
            <span class="loading-line" style="width:45%"></span>
            <span class="loading-line" style="width:70%;height:26px;margin-top:16px"></span>
            <span class="loading-line" style="width:55%;margin-top:10px"></span>
        </div>`).join('');
}

function statCard({ label, value, foot, color, soft, icon }) {
    return `
        <article class="stat-card" style="--stat-color:${color};--stat-soft:${soft}">
            <div class="stat-top">
                <span class="stat-icon">${icon}</span>
                <span class="stat-label">${escapeHtml(label)}</span>
            </div>
            <p class="stat-value">${value}</p>
            <p class="stat-foot">${escapeHtml(foot || '')}</p>
        </article>`;
}

function renderDashboardStats() {
    const container = document.getElementById('dashStats');
    if (!container || !state.stats) return;

    const todayOrders = state.orders.filter(order => isToday(orderDate(order)));
    const pending = state.orders.filter(order => order.estado === 'pendiente').length;
    const activeKitchen = state.orders.filter(order => ['pendiente','preparando','listo'].includes(order.estado)).length;
    const available = state.products.filter(product => product.disponible !== false).length;

    container.innerHTML = [
        statCard({
            label: 'Ventas totales',
            value: formatCOP(state.stats.ingresos),
            foot: `${state.stats.completados} pedido(s) despachado(s)`,
            color: '#0f9f6e',
            soft: '#e7f8f1',
            icon: ICONS.sales
        }),
        statCard({
            label: 'Pedidos del día',
            value: todayOrders.length,
            foot: 'Registrados en la fecha actual',
            color: '#2563eb',
            soft: '#eef4ff',
            icon: ICONS.orders
        }),
        statCard({
            label: 'Pedidos pendientes',
            value: pending,
            foot: `${activeKitchen} activo(s) en cocina`,
            color: '#d97706',
            soft: '#fff7e6',
            icon: ICONS.pending
        }),
        statCard({
            label: 'Productos disponibles',
            value: available,
            foot: `${state.products.length} producto(s) en catálogo`,
            color: '#ea580c',
            soft: '#fff1e7',
            icon: ICONS.products
        }),
        statCard({
            label: 'Empleados',
            value: state.stats.empleados,
            foot: 'Usuarios registrados',
            color: '#7c3aed',
            soft: '#f4efff',
            icon: ICONS.users
        })
    ].join('');
}

function renderSalesChart() {
    const container = document.getElementById('salesChart');
    const totalLabel = document.getElementById('salesChartTotal');
    if (!container) return;

    const days = [];
    const now = new Date();

    for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
        days.push({
            date,
            label: offset === 0 ? 'Hoy' : date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }),
            total: 0
        });
    }

    state.orders.filter(order => order.estado === 'despachado').forEach(order => {
        const date = orderDate(order);
        if (!date) return;

        const target = days.find(day => day.date.toDateString() === date.toDateString());
        if (target) target.total += orderTotal(order);
    });

    const max = Math.max(...days.map(day => day.total), 0);
    const total = days.reduce((sum, day) => sum + day.total, 0);

    if (totalLabel) totalLabel.textContent = formatCOP(total);

    if (max === 0) {
        container.innerHTML = `<div class="empty-state compact" style="width:100%">
            <p>Aún no hay ventas despachadas para graficar.</p>
        </div>`;
        return;
    }

    container.innerHTML = days.map(day => {
        const height = Math.max(3, Math.round((day.total / max) * 100));
        return `
            <div class="chart-column" title="${escapeHtml(day.label)}: ${formatCOP(day.total)}">
                <span class="chart-value">${day.total > 0 ? formatCOP(day.total) : '—'}</span>
                <div class="chart-bar-wrap"><div class="chart-bar" style="height:${height}%"></div></div>
                <span class="chart-label">${escapeHtml(day.label)}</span>
            </div>`;
    }).join('');
}

function renderStatusChart() {
    const container = document.getElementById('statusChart');
    if (!container) return;

    const counts = { pendiente: 0, preparando: 0, listo: 0, despachado: 0 };
    state.orders.forEach(order => {
        if (counts[order.estado] !== undefined) counts[order.estado] += 1;
    });

    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

    if (total === 0) {
        container.innerHTML = '<div class="empty-state compact"><p>No hay pedidos registrados.</p></div>';
        return;
    }

    const degrees = {};
    let accumulated = 0;

    Object.entries(counts).forEach(([key, value]) => {
        accumulated += (value / total) * 360;
        degrees[key] = accumulated;
    });

    const legend = Object.entries(counts).map(([key, value]) => `
        <div class="legend-item">
            <span class="legend-dot" style="background:${statusInfo(key).color}"></span>
            <span>${escapeHtml(statusInfo(key).label)}</span>
            <strong>${value}</strong>
        </div>`).join('');

    container.innerHTML = `
        <div class="donut" style="--p1:${degrees.pendiente}deg;--p2:${degrees.preparando}deg;--p3:${degrees.listo}deg">
            <div class="donut-center"><strong>${total}</strong><span>pedidos</span></div>
        </div>
        <div class="legend">${legend}</div>`;
}

function renderRecentOrders() {
    const tbody = document.getElementById('dashRecentOrders');
    const empty = document.getElementById('dashRecentEmpty');
    if (!tbody) return;

    const orders = [...state.orders]
        .sort((a, b) => (orderDate(b)?.getTime() || 0) - (orderDate(a)?.getTime() || 0))
        .slice(0, 6);

    if (orders.length === 0) {
        tbody.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td class="cell-mono">#${escapeHtml(order.numero || order.id)}</td>
            <td class="cell-title">${escapeHtml(order.mesa || '—')}</td>
            <td>${escapeHtml(order.mesero || '—')}</td>
            <td class="cell-title">${formatCOP(orderTotal(order))}</td>
            <td>${statusBadge(order.estado)}</td>
        </tr>`).join('');
}

function renderActiveOrders() {
    const container = document.getElementById('dashActiveOrders');
    const count = document.getElementById('dashActiveCount');
    if (!container) return;

    const active = state.orders
        .filter(order => order.estado !== 'despachado')
        .sort((a, b) => (orderDate(a)?.getTime() || 0) - (orderDate(b)?.getTime() || 0));

    if (count) count.textContent = active.length;

    if (active.length === 0) {
        container.innerHTML = '<div class="empty-state compact"><p>Sin pedidos activos en cocina.</p></div>';
        return;
    }

    container.innerHTML = active.slice(0, 6).map(order => `
        <div class="active-card ${escapeHtml(order.estado)}">
            <div class="active-card-top">
                <strong>#${escapeHtml(order.numero || order.id)} · ${escapeHtml(order.mesa || '—')}</strong>
                ${statusBadge(order.estado)}
            </div>
            <div class="active-card-meta">
                <span>Mesero: <b>${escapeHtml(order.mesero || '—')}</b></span>
                <span>${escapeHtml(order.hora || '—')}</span>
                <b>${formatCOP(orderTotal(order))}</b>
            </div>
        </div>`).join('');
}

function updateNotifications() {
    const active = state.orders.filter(order => order.estado !== 'despachado');
    const badge = document.getElementById('navOrdersBadge');
    const dot = document.getElementById('notificationDot');
    const count = document.getElementById('notificationCount');
    const list = document.getElementById('notificationList');

    if (badge) badge.textContent = String(active.length);
    if (dot) dot.hidden = active.length === 0;
    if (count) count.textContent = String(active.length);

    if (!list) return;

    if (active.length === 0) {
        list.innerHTML = '<div class="notification-empty">No hay pedidos en curso.</div>';
        return;
    }

    list.innerHTML = active.slice(0, 6).map(order => `
        <button type="button" class="notification-item" data-order-id="${escapeHtml(order.id)}">
            <span class="avatar" style="width:30px;height:30px;border-radius:8px;font-size:11px">${escapeHtml(initials(order.mesa))}</span>
            <span class="notification-copy">
                <strong>#${escapeHtml(order.numero || order.id)} · ${escapeHtml(order.mesa || '—')}</strong>
                <span>${escapeHtml(orderItemCount(order))} ítem(s) · ${escapeHtml(statusInfo(order.estado).label)}</span>
            </span>
        </button>`).join('');

    list.querySelectorAll('[data-order-id]').forEach(button => {
        button.addEventListener('click', () => {
            const order = state.orders.find(item => String(item.id) === button.dataset.orderId);
            if (order) openOrderDetail(order);
            closeDropdown(document.getElementById('notificationPanel'), document.getElementById('notificationsBtn'));
        });
    });
}

/* ── Pedidos ── */
async function loadPedidos(options = {}) {
    try {
        await ensureCatalogs();

        const orders = await request('get_orders', {
            params: {
                q: state.filters.q,
                estado: state.filters.estado,
                mesa: state.filters.mesa,
                limit: 300
            }
        });

        state.filteredOrders = Array.isArray(orders) ? orders : [];
        renderOrdersTable();

        if (!options.silent) {
            updateNotifications();
        }
    } catch (error) {
        showToast('error', 'Error al cargar pedidos', error.message);
    }
}

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const empty = document.getElementById('ordersEmpty');
    const count = document.getElementById('ordersCount');
    if (!tbody) return;

    const orders = state.filteredOrders;

    if (count) {
        count.textContent = `${orders.length} pedido(s)`;
    }

    if (orders.length === 0) {
        tbody.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td class="cell-mono">#${escapeHtml(order.numero || order.id)}</td>
            <td class="cell-title">${escapeHtml(order.mesa || '—')}</td>
            <td>${escapeHtml(order.mesero || '—')}</td>
            <td>${formatDateTime(order)}</td>
            <td>${orderItemCount(order)} ítem(s)</td>
            <td class="cell-title">${formatCOP(orderTotal(order))}</td>
            <td>${statusBadge(order.estado)}</td>
            <td class="align-right">
                <button class="btn btn-light btn-sm" type="button" data-view-order="${escapeHtml(order.id)}">Ver detalle</button>
            </td>
        </tr>`).join('');

    tbody.querySelectorAll('[data-view-order]').forEach(button => {
        button.addEventListener('click', () => {
            const order = orders.find(item => String(item.id) === button.dataset.viewOrder);
            if (order) openOrderDetail(order);
        });
    });
}

function applyOrderFilters() {
    state.filters.q = document.getElementById('ordersSearch')?.value.trim() || '';
    state.filters.estado = document.getElementById('ordersState')?.value || '';
    state.filters.mesa = document.getElementById('ordersMesa')?.value || '';
    loadPedidos();
}

function clearOrderFilters() {
    state.filters = { q: '', estado: '', mesa: '' };

    const search = document.getElementById('ordersSearch');
    const stateSelect = document.getElementById('ordersState');
    const mesaSelect = document.getElementById('ordersMesa');
    const globalSearch = document.getElementById('globalSearchInput');

    if (search) search.value = '';
    if (stateSelect) stateSelect.value = '';
    if (mesaSelect) mesaSelect.value = '';
    if (globalSearch) globalSearch.value = '';

    loadPedidos();
}

function nextStatus(order) {
    const states = state.catalogs?.estados || [];
    const current = states.find(item => item.id === order.estado);

    if (current && current.siguiente) {
        return current.siguiente;
    }

    const fallback = { pendiente: 'preparando', preparando: 'listo', listo: 'despachado' };
    return fallback[order.estado] || null;
}

function openOrderDetail(order) {
    const items = order.items || [];
    const itemRows = items.map(item => `
        <tr>
            <td>${escapeHtml(item.nombre || 'Producto')}</td>
            <td>${escapeHtml(item.cantidad || item.qty || 1)}</td>
            <td>${formatCOP(item.precio || 0)}</td>
            <td style="text-align:right;font-weight:600">${formatCOP(Number(item.precio || 0) * Number(item.cantidad || item.qty || 1))}</td>
        </tr>`).join('');

    const next = nextStatus(order);
    const actions = [];

    if (next) {
        actions.push({
            label: `Pasar a ${statusInfo(next).label}`,
            className: 'btn-primary',
            onClick: async () => {
                try {
                    await request('update_status', {
                        method: 'POST',
                        body: { id: Number(order.id), nuevoEstado: next }
                    });
                    closeModal();
                    showToast('success', 'Pedido actualizado', `Ahora está en estado "${statusInfo(next).label}".`);
                    await loadDashboard({ silent: true });
                    if (state.currentSection === 'pedidos') await loadPedidos({ silent: true });
                } catch (error) {
                    showToast('error', 'No se pudo actualizar el pedido', error.message);
                }
            }
        });
    }

    actions.push({ label: 'Cerrar', className: 'btn-light', onClick: closeModal });

    openModal({
        eyebrow: `Pedido #${order.numero || order.id}`,
        title: order.mesa || 'Detalle del pedido',
        body: `
            <div class="detail-grid">
                <div class="detail-item"><span>Estado</span><strong>${statusBadge(order.estado)}</strong></div>
                <div class="detail-item"><span>Mesero</span><strong>${escapeHtml(order.mesero || '—')}</strong></div>
                <div class="detail-item"><span>Hora</span><strong>${escapeHtml(order.hora || '—')}</strong></div>
                <div class="detail-item"><span>Ítems</span><strong>${orderItemCount(order)}</strong></div>
            </div>
            ${order.notas ? `<div class="notice" style="margin-bottom:14px">${ICONS.info}<p>${escapeHtml(order.notas)}</p></div>` : ''}
            <table class="detail-items">
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th style="text-align:right">Subtotal</th></tr></thead>
                <tbody>${itemRows || '<tr><td colspan="4">Sin ítems registrados.</td></tr>'}</tbody>
            </table>
            <div class="detail-total"><span>Total del pedido</span><strong>${formatCOP(orderTotal(order))}</strong></div>`,
        actions
    });
}

/* ── Productos ── */
async function loadProductos() {
    try {
        await ensureCatalogs();
        const products = await request('get_products');
        state.products = Array.isArray(products) ? products : [];
        renderProductsTable();
    } catch (error) {
        showToast('error', 'Error al cargar productos', error.message);
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const empty = document.getElementById('productsEmpty');
    if (!tbody) return;

    if (state.products.length === 0) {
        tbody.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;

    tbody.innerHTML = state.products.map(product => {
        const category = catalogName(state.catalogs?.categorias, product.categoria, product.categoria || '—');
        const available = product.disponible !== false;
        const image = product.imagen
            ? `<img class="product-thumb" src="${escapeHtml(product.imagen)}" alt="${escapeHtml(product.nombre)}" loading="lazy">`
            : `<span class="product-thumb" style="display:grid;place-items:center;color:var(--muted)">${ICONS.products}</span>`;

        return `
            <tr>
                <td>
                    <div class="product-cell">
                        ${image}
                        <div>
                            <span class="cell-title">${escapeHtml(product.nombre)}</span>
                            <span class="cell-sub">${escapeHtml(product.descripcion || 'Sin descripción')}</span>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(category)}</td>
                <td class="cell-title">${formatCOP(product.precio)}</td>
                <td>${available
                    ? '<span class="status-badge status-listo">Disponible</span>'
                    : '<span class="status-badge status-despachado">No disponible</span>'}</td>
                <td class="align-right">
                    <button class="btn btn-light btn-sm" type="button" data-view-product="${escapeHtml(product.id)}">Ver detalle</button>
                </td>
            </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-view-product]').forEach(button => {
        button.addEventListener('click', () => {
            const product = state.products.find(item => String(item.id) === button.dataset.viewProduct);
            if (product) openProductDetail(product);
        });
    });
}

function openProductDetail(product) {
    const category = catalogName(state.catalogs?.categorias, product.categoria, product.categoria || '—');
    const available = product.disponible !== false;

    openModal({
        eyebrow: 'Producto DEMO',
        title: product.nombre || 'Detalle del producto',
        body: `
            ${product.imagen ? `<img src="${escapeHtml(product.imagen)}" alt="${escapeHtml(product.nombre)}" style="width:100%;max-height:240px;object-fit:cover;border-radius:12px;margin-bottom:16px;border:1px solid var(--border)">` : ''}
            <div class="detail-grid">
                <div class="detail-item"><span>Categoría</span><strong>${escapeHtml(category)}</strong></div>
                <div class="detail-item"><span>Precio</span><strong>${formatCOP(product.precio)}</strong></div>
                <div class="detail-item"><span>Disponibilidad</span><strong>${available ? 'Disponible' : 'No disponible'}</strong></div>
                <div class="detail-item"><span>ID</span><strong>${escapeHtml(product.id)}</strong></div>
            </div>
            <p style="margin:0;color:var(--text-soft);line-height:1.6">${escapeHtml(product.descripcion || 'Sin descripción registrada.')}</p>
            <div class="notice" style="margin-top:16px;margin-bottom:0">${ICONS.info}<p>La edición y eliminación de productos todavía no está implementada en la API.</p></div>`,
        actions: [{ label: 'Cerrar', className: 'btn-light', onClick: closeModal }]
    });
}

/* ── Categorías ── */
async function loadCategorias() {
    try {
        await ensureCatalogs();
        const products = state.products.length ? state.products : await request('get_products');
        state.products = Array.isArray(products) ? products : [];
        renderCategories();
    } catch (error) {
        showToast('error', 'Error al cargar categorías', error.message);
    }
}

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    const categories = state.catalogs?.categorias || [];

    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Sin categorías</h3><p>El catálogo DEMO no contiene categorías.</p></div>';
        return;
    }

    container.innerHTML = categories.map(category => {
        const count = state.products.filter(product => String(product.categoria) === String(category.id)).length;
        const label = String(category.nombre || '').trim();
        const prefix = label.slice(0, 2).toUpperCase();

        return `
            <article class="category-card">
                <div class="category-icon">${escapeHtml(prefix)}</div>
                <h3>${escapeHtml(label)}</h3>
                <p>ID de catálogo: ${escapeHtml(category.id)}</p>
                <div class="category-meta">
                    <span>Productos asociados</span>
                    <strong>${count}</strong>
                </div>
            </article>`;
    }).join('');
}

/* ── Mesas ── */
async function loadMesas() {
    try {
        await ensureCatalogs();
        const orders = await request('get_orders', { params: { estado: 'activos', limit: 300 } });
        renderTables(Array.isArray(orders) ? orders : []);
    } catch (error) {
        showToast('error', 'Error al cargar mesas', error.message);
    }
}

function renderTables(activeOrders) {
    const container = document.getElementById('tablesGrid');
    if (!container) return;

    const tables = state.catalogs?.mesas || [];

    if (tables.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Sin mesas</h3><p>El catálogo DEMO no contiene mesas.</p></div>';
        return;
    }

    container.innerHTML = tables.map(table => {
        const orders = activeOrders.filter(order => order.mesa === table.nombre);
        const occupied = orders.length > 0;
        const typeLabels = { mesa: 'Mesa', llevar: 'Para llevar', domicilio: 'Domicilio' };

        return `
            <article class="table-card ${occupied ? 'occupied' : ''}">
                <div class="table-card-head">
                    <div>
                        <h3>${escapeHtml(table.nombre)}</h3>
                        <span class="table-type">${escapeHtml(typeLabels[table.tipo] || table.tipo || 'Punto de entrega')}</span>
                    </div>
                    <span class="table-state">${occupied ? 'Ocupada' : 'Disponible'}</span>
                </div>
                <div class="table-card-body">
                    <span>Capacidad: <strong>${Number(table.capacidad || 0) > 0 ? table.capacidad + ' personas' : 'No aplica'}</strong></span>
                    <span>Pedidos activos: <strong>${orders.length}</strong></span>
                </div>
            </article>`;
    }).join('');
}

/* ── Usuarios ── */
async function loadUsuarios() {
    try {
        const users = await request('get_users');
        state.users = Array.isArray(users) ? users : [];
        renderUsers();
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            showToast('error', 'Sesión no autorizada', error.message);
            return;
        }
        showToast('error', 'Error al cargar usuarios', error.message);
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    const empty = document.getElementById('usersEmpty');
    if (!tbody) return;

    if (state.users.length === 0) {
        tbody.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;

    tbody.innerHTML = state.users.map(user => {
        const isAdmin = String(user.rol) === 'administrador';
        const isProtected = String(user.nombre).toLowerCase() === 'admin';
        const isSelf = state.me && String(user.nombre) === String(state.me.nombre);
        const active = user.activo !== false;

        let action = '<span class="cell-sub">Protegido</span>';
        if (!isProtected && !isSelf) {
            action = `<button class="btn btn-danger-light btn-sm" type="button" data-delete-user="${escapeHtml(user.nombre)}">Eliminar</button>`;
        } else if (isSelf) {
            action = '<span class="cell-sub">Tu cuenta</span>';
        }

        return `
            <tr>
                <td>
                    <div class="product-cell">
                        <span class="avatar">${escapeHtml(initials(user.nombre))}</span>
                        <div>
                            <span class="cell-title">${escapeHtml(user.nombre)} ${escapeHtml(user.apellidos || '')}</span>
                            <span class="cell-sub">${escapeHtml(user.correo || 'Sin correo')}</span>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(user.telefono || '—')}</td>
                <td><span class="role-badge ${isAdmin ? 'admin' : ''}">${escapeHtml(user.rol || 'mesero')}</span></td>
                <td><span class="status-badge ${active ? 'active-badge' : 'inactive-badge'}">${active ? 'Activo' : 'Inactivo'}</span></td>
                <td>${escapeHtml(user.fechaRegistro || '—')}</td>
                <td class="align-right">${action}</td>
            </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-delete-user]').forEach(button => {
        button.addEventListener('click', () => confirmDeleteUser(button.dataset.deleteUser));
    });
}

async function confirmDeleteUser(name) {
    const confirmed = await confirmDialog({
        title: 'Eliminar usuario',
        message: `¿Eliminar al empleado "${name}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar usuario',
        dangerous: true
    });

    if (!confirmed) return;

    try {
        await request('delete_user', { method: 'POST', body: { nombre: name } });
        showToast('success', 'Usuario eliminado', `"${name}" ya no forma parte del sistema.`);
        await loadUsuarios();
        await loadDashboard({ silent: true });
    } catch (error) {
        showToast('error', 'No se pudo eliminar el usuario', error.message);
    }
}

/* ── Reportes ── */
async function loadReportes() {
    try {
        await ensureCatalogs();

        const [orders, products] = await Promise.all([
            request('get_orders', { params: { limit: 500 } }),
            state.products.length ? Promise.resolve(state.products) : request('get_products')
        ]);

        const allOrders = Array.isArray(orders) ? orders : [];
        state.products = Array.isArray(products) ? products : [];

        renderReportStats(allOrders);
        renderCategorySales(allOrders);
        renderTopProducts(allOrders);
    } catch (error) {
        showToast('error', 'Error al cargar reportes', error.message);
    }
}

function renderReportStats(orders) {
    const container = document.getElementById('reportStats');
    if (!container) return;

    const completed = orders.filter(order => order.estado === 'despachado');
    const revenue = completed.reduce((sum, order) => sum + orderTotal(order), 0);
    const items = orders.reduce((sum, order) => sum + orderItemCount(order), 0);
    const average = completed.length ? Math.round(revenue / completed.length) : 0;

    container.innerHTML = [
        statCard({
            label: 'Ingresos despachados',
            value: formatCOP(revenue),
            foot: `${completed.length} pedido(s) completados`,
            color: '#0f9f6e',
            soft: '#e7f8f1',
            icon: ICONS.sales
        }),
        statCard({
            label: 'Pedidos totales',
            value: orders.length,
            foot: 'Todos los estados',
            color: '#2563eb',
            soft: '#eef4ff',
            icon: ICONS.orders
        }),
        statCard({
            label: 'Ticket promedio',
            value: formatCOP(average),
            foot: 'Sobre pedidos despachados',
            color: '#ea580c',
            soft: '#fff1e7',
            icon: ICONS.average
        }),
        statCard({
            label: 'Ítems vendidos',
            value: items,
            foot: 'Unidades registradas',
            color: '#7c3aed',
            soft: '#f4efff',
            icon: ICONS.products
        })
    ].join('');
}

function productCategory(productId) {
    const product = state.products.find(item => String(item.id) === String(productId));

    if (product) return product.categoria;

    const name = state.products.find(item => String(item.nombre) === String(productId));
    return name ? name.categoria : null;
}

function renderCategorySales(orders) {
    const container = document.getElementById('categorySales');
    if (!container) return;

    const totals = {};

    orders.filter(order => order.estado === 'despachado').forEach(order => {
        (order.items || []).forEach(item => {
            const categoryId = productCategory(item.producto_id);
            if (!categoryId) return;

            const amount = Number(item.precio || 0) * Number(item.cantidad || item.qty || 1);
            totals[categoryId] = (totals[categoryId] || 0) + amount;
        });
    });

    const entries = Object.entries(totals)
        .map(([categoryId, amount]) => ({
            label: catalogName(state.catalogs?.categorias, categoryId, categoryId),
            amount
        }))
        .sort((a, b) => b.amount - a.amount);

    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state compact"><p>Sin ventas despachadas para calcular categorías.</p></div>';
        return;
    }

    const max = Math.max(...entries.map(entry => entry.amount), 1);

    container.innerHTML = entries.map(entry => `
        <div class="bar-row">
            <div class="bar-row-top">
                <strong>${escapeHtml(entry.label)}</strong>
                <span>${formatCOP(entry.amount)}</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round((entry.amount / max) * 100)}%"></div></div>
        </div>`).join('');
}

function renderTopProducts(orders) {
    const container = document.getElementById('topProducts');
    if (!container) return;

    const totals = {};

    orders.forEach(order => {
        (order.items || []).forEach(item => {
            const name = item.nombre || 'Producto';
            const quantity = Number(item.cantidad || item.qty || 1);
            totals[name] = (totals[name] || 0) + quantity;
        });
    });

    const entries = Object.entries(totals)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8);

    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state compact"><p>Sin productos vendidos todavía.</p></div>';
        return;
    }

    const max = Math.max(...entries.map(entry => entry.quantity), 1);

    container.innerHTML = entries.map(entry => `
        <div class="bar-row">
            <div class="bar-row-top">
                <strong>${escapeHtml(entry.name)}</strong>
                <span>${entry.quantity} und.</span>
            </div>
            <div class="bar-track"><div class="bar-fill blue" style="width:${Math.round((entry.quantity / max) * 100)}%"></div></div>
        </div>`).join('');
}

async function exportReport() {
    try {
        const [orders, products, users] = await Promise.all([
            request('get_orders', { params: { limit: 500 } }),
            request('get_products'),
            request('get_users')
        ]);

        const report = {
            generado: new Date().toISOString(),
            modo: 'demo',
            pedidos: orders,
            productos: products,
            usuarios: (users || []).map(user => ({
                nombre: user.nombre,
                apellidos: user.apellidos,
                correo: user.correo,
                telefono: user.telefono,
                rol: user.rol,
                activo: user.activo
            }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fastfoodsc-reporte-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        showToast('success', 'Reporte exportado', 'Se descargó un archivo JSON con los datos DEMO.');
    } catch (error) {
        showToast('error', 'No se pudo exportar el reporte', error.message);
    }
}

/* ── Configuración ── */
async function loadConfiguracion() {
    try {
        const info = await request('get_system_info');
        const container = document.getElementById('systemInfo');

        if (!container) return;

        container.innerHTML = [
            ['Versión', info.version || '—'],
            ['Modo', info.modo || '—'],
            ['Persistencia', info.persistencia || '—'],
            ['Almacenamiento', info.storage || '—'],
            ['Autenticación', 'Sesión PHP + contraseñas con hash'],
            ['Base de datos', 'No conectada (modo DEMO)']
        ].map(([label, value]) => `
            <div class="info-item">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
            </div>`).join('');
    } catch (error) {
        showToast('error', 'Error al cargar configuración', error.message);
    }
}

async function resetDemo() {
    const confirmed = await confirmDialog({
        title: 'Restaurar datos DEMO',
        message: 'Se restaurarán los pedidos, productos y usuarios de demostración. Los cambios actuales se perderán.',
        confirmLabel: 'Restaurar datos',
        dangerous: false
    });

    if (!confirmed) return;

    try {
        await request('demo_reset', { method: 'POST' });
        state.products = [];
        state.users = [];
        showToast('success', 'Datos DEMO restaurados', 'La información inicial volvió a cargarse.');
        await loadConfiguracion();
        await loadDashboard({ silent: true });
    } catch (error) {
        showToast('error', 'No se pudieron restaurar los datos', error.message);
    }
}

async function clearOrders() {
    const confirmed = await confirmDialog({
        title: 'Limpiar pedidos',
        message: 'Se eliminarán todos los pedidos registrados. Los usuarios y el catálogo se conservarán.',
        confirmLabel: 'Limpiar pedidos',
        dangerous: true
    });

    if (!confirmed) return;

    try {
        await request('clear_orders', { method: 'POST' });
        showToast('success', 'Pedidos eliminados', 'La operación se completó correctamente.');
        await loadDashboard({ silent: true });
        if (state.currentSection === 'pedidos') await loadPedidos({ silent: true });
    } catch (error) {
        showToast('error', 'No se pudieron limpiar los pedidos', error.message);
    }
}

async function clearAll() {
    const confirmed = await confirmDialog({
        title: 'Reiniciar todo el sistema',
        message: 'Se eliminarán todos los pedidos y los usuarios, excepto las cuentas administradoras protegidas. Esta acción no se puede deshacer.',
        confirmLabel: 'Reiniciar sistema',
        dangerous: true
    });

    if (!confirmed) return;

    try {
        await request('clear_all', { method: 'POST' });
        state.products = [];
        state.users = [];
        showToast('success', 'Sistema reiniciado', 'Los datos de demostración se restablecieron.');
        await loadDashboard({ silent: true });
        if (state.currentSection !== 'dashboard') await loadSection(state.currentSection);
    } catch (error) {
        showToast('error', 'No se pudo reiniciar el sistema', error.message);
    }
}

/* ── Inicio ── */
document.addEventListener('DOMContentLoaded', () => {
    const shell = document.getElementById('adminApp');
    if (shell && localStorage.getItem('ff_admin_sidebar') === 'collapsed') {
        shell.classList.add('sidebar-collapsed');
    }

    bootstrap();
});
