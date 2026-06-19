// ============================================================
//  Fast Food Service — Theme Editor (Editor de Estilos)
//  Panel deslizable para personalizar el tema en tiempo real
// ============================================================

(function() {
    'use strict';

    // ── CONFIGURACIÓN ──
    const STORAGE_KEY = 'ff_theme_config';
    const CSS_VARS = [
        { id: 'bg', label: 'Fondo General', type: 'color', default: '#ffffff', cssVar: '--bg' },
        { id: 'card', label: 'Fondo Tarjetas', type: 'color', default: 'rgba(255,255,255,0.85)', cssVar: '--card' },
        { id: 'text', label: 'Texto Principal', type: 'color', default: '#111827', cssVar: '--text' },
        { id: 'textMuted', label: 'Texto Secundario', type: 'color', default: '#6b7280', cssVar: '--text-muted' },
        { id: 'border', label: 'Bordes', type: 'color', default: 'rgba(0,0,0,0.12)', cssVar: '--border' },
        { id: 'primary', label: 'Color Principal', type: 'color', default: '#ffffff', cssVar: '--primary' },
        { id: 'primaryDark', label: 'Color Principal Hover', type: 'color', default: '#f3f4f6', cssVar: '--primary-dark' },
        { id: 'accentCyan', label: 'Acento Cyan', type: 'color', default: '#06b6d4', cssVar: '--accent-cyan' },
        { id: 'accentAmber', label: 'Acento Ámbar', type: 'color', default: '#f59e0b', cssVar: '--accent-amber' },
        { id: 'accentEmerald', label: 'Acento Verde', type: 'color', default: '#10b981', cssVar: '--accent-emerald' },
        { id: 'accentViolet', label: 'Acento Violeta', type: 'color', default: '#8b5cf6', cssVar: '--accent-violet' },
        { id: 'accentRed', label: 'Acento Rojo', type: 'color', default: '#ef4444', cssVar: '--accent-red' },
        { id: 'glassBlur', label: 'Desenfoque Glass', type: 'range', default: '20', min: '0', max: '40', cssVar: '--glass-blur' },
        { id: 'glassOpacity', label: 'Opacidad Glass', type: 'range', default: '0.45', min: '0', max: '1', step: '0.05', cssVar: '--glass-opacity' },
        { id: 'borderRadius', label: 'Radio Bordes', type: 'range', default: '16', min: '0', max: '32', cssVar: '--border-radius' },
        { id: 'fontSize', label: 'Tamaño Fuente', type: 'range', default: '1', min: '0.8', max: '1.3', step: '0.05', cssVar: '--font-scale' },
    ];

    const PRESETS = [
        { name: '☀️ Claro Industrial', values: {
            bg: '#ffffff', card: 'rgba(255,255,255,0.85)', text: '#111827', textMuted: '#6b7280',
            border: 'rgba(0,0,0,0.12)', primary: '#ffffff', primaryDark: '#f3f4f6',
            accentCyan: '#06b6d4', accentAmber: '#f59e0b', accentEmerald: '#10b981',
            accentViolet: '#8b5cf6', accentRed: '#ef4444', glassBlur: '20', glassOpacity: '0.45',
            borderRadius: '16', fontSize: '1'
        }},
        { name: '🌑 Oscuro Premium', values: {
            bg: '#0f172a', card: 'rgba(30,41,59,0.85)', text: '#f1f5f9', textMuted: '#94a3b8',
            border: 'rgba(255,255,255,0.12)', primary: '#06b6d4', primaryDark: '#0891b2',
            accentCyan: '#06b6d4', accentAmber: '#f59e0b', accentEmerald: '#10b981',
            accentViolet: '#8b5cf6', accentRed: '#ef4444', glassBlur: '20', glassOpacity: '0.25',
            borderRadius: '16', fontSize: '1'
        }},
        { name: '🍔 Fast Food Classic', values: {
            bg: '#fef3c7', card: 'rgba(255,255,255,0.9)', text: '#451a03', textMuted: '#92400e',
            border: 'rgba(180,83,9,0.15)', primary: '#f59e0b', primaryDark: '#d97706',
            accentCyan: '#0ea5e9', accentAmber: '#f59e0b', accentEmerald: '#22c55e',
            accentViolet: '#a855f7', accentRed: '#dc2626', glassBlur: '16', glassOpacity: '0.55',
            borderRadius: '20', fontSize: '1.05'
        }},
        { name: '🌊 Océano Profesional', values: {
            bg: '#ecfeff', card: 'rgba(255,255,255,0.88)', text: '#164e63', textMuted: '#0e7490',
            border: 'rgba(8,145,178,0.15)', primary: '#06b6d4', primaryDark: '#0891b2',
            accentCyan: '#06b6d4', accentAmber: '#f59e0b', accentEmerald: '#14b8a6',
            accentViolet: '#6366f1', accentRed: '#ef4444', glassBlur: '18', glassOpacity: '0.5',
            borderRadius: '14', fontSize: '1'
        }},
        { name: '🌸 Rosa Elegante', values: {
            bg: '#fdf2f8', card: 'rgba(255,255,255,0.9)', text: '#831843', textMuted: '#be185d',
            border: 'rgba(219,39,119,0.12)', primary: '#ec4899', primaryDark: '#db2777',
            accentCyan: '#06b6d4', accentAmber: '#f59e0b', accentEmerald: '#10b981',
            accentViolet: '#8b5cf6', accentRed: '#ef4444', glassBlur: '22', glassOpacity: '0.5',
            borderRadius: '18', fontSize: '1.02'
        }}
    ];

    let panelOpen = false;
    let currentValues = {};

    // ── INICIALIZAR ──
    function init() {
        loadConfig();
        injectStyles();
        createPanel();
        applyValues();
        createToggleButton();
    }

    // ── CARGAR CONFIG ──
    function loadConfig() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try { currentValues = JSON.parse(saved); } catch(e) { currentValues = {}; }
        }
        // Rellenar defaults faltantes
        CSS_VARS.forEach(v => {
            if (currentValues[v.id] === undefined) currentValues[v.id] = v.default;
        });
    }

    // ── GUARDAR CONFIG ──
    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentValues));
    }

    // ── INYECTAR ESTILOS DINÁMICOS ──
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'ff-theme-dynamic';
        style.textContent = `
            :root {
                --glass-blur: ${currentValues.glassBlur || '20'}px;
                --glass-opacity: ${currentValues.glassOpacity || '0.45'};
                --border-radius: ${currentValues.borderRadius || '16'}px;
                --font-scale: ${currentValues.fontSize || '1'};
                --accent-cyan: ${currentValues.accentCyan || '#06b6d4'};
                --accent-amber: ${currentValues.accentAmber || '#f59e0b'};
                --accent-emerald: ${currentValues.accentEmerald || '#10b981'};
                --accent-violet: ${currentValues.accentViolet || '#8b5cf6'};
                --accent-red: ${currentValues.accentRed || '#ef4444'};
            }
            body { font-size: calc(0.875rem * var(--font-scale)); }
            .card, .stat-card, .bg-slate-800, .bg-slate-900, .bg-gray-800, .bg-gray-900 {
                border-radius: var(--border-radius) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ── APLICAR VALORES ──
    function applyValues() {
        const root = document.documentElement;
        CSS_VARS.forEach(v => {
            let val = currentValues[v.id] || v.default;
            if (v.type === 'range' && v.id === 'glassBlur') val += 'px';
            root.style.setProperty(v.cssVar, val);
        });
        // Actualizar estilo dinámico
        const dyn = document.getElementById('ff-theme-dynamic');
        if (dyn) {
            dyn.textContent = `
                :root {
                    --glass-blur: ${currentValues.glassBlur || '20'}px;
                    --glass-opacity: ${currentValues.glassOpacity || '0.45'};
                    --border-radius: ${currentValues.borderRadius || '16'}px;
                    --font-scale: ${currentValues.fontSize || '1'};
                    --accent-cyan: ${currentValues.accentCyan || '#06b6d4'};
                    --accent-amber: ${currentValues.accentAmber || '#f59e0b'};
                    --accent-emerald: ${currentValues.accentEmerald || '#10b981'};
                    --accent-violet: ${currentValues.accentViolet || '#8b5cf6'};
                    --accent-red: ${currentValues.accentRed || '#ef4444'};
                }
                body { font-size: calc(0.875rem * var(--font-scale)); }
            `;
        }
        // Forzar colores en elementos Tailwind
        updateTailwindColors();
        saveConfig();
    }

    // ── ACTUALIZAR COLORES TAILWIND ──
    function updateTailwindColors() {
        // Inyectar reglas para sobreescribir clases Tailwind
        let css = document.getElementById('ff-theme-tailwind');
        if (!css) {
            css = document.createElement('style');
            css.id = 'ff-theme-tailwind';
            document.head.appendChild(css);
        }
        const isDark = currentValues.bg === '#0f172a' || currentValues.bg === '#1e293b';
        const textColor = currentValues.text || '#111827';
        const mutedColor = currentValues.textMuted || '#6b7280';

        css.textContent = `
            .text-white, .text-slate-200, .text-slate-300 { color: ${textColor} !important; }
            .text-slate-400, .text-gray-400, .text-gray-500 { color: ${mutedColor} !important; }
            .text-cyan-400 { color: ${currentValues.accentCyan || '#06b6d4'} !important; }
            .text-cyan-500 { color: ${currentValues.accentCyan || '#06b6d4'} !important; }
            .text-amber-400 { color: ${currentValues.accentAmber || '#f59e0b'} !important; }
            .text-emerald-400 { color: ${currentValues.accentEmerald || '#10b981'} !important; }
            .text-violet-400 { color: ${currentValues.accentViolet || '#8b5cf6'} !important; }
            .bg-cyan-600 { background-color: ${currentValues.accentCyan || '#06b6d4'} !important; }
            .bg-amber-600 { background-color: ${currentValues.accentAmber || '#f59e0b'} !important; }
            .bg-violet-700 { background-color: ${currentValues.accentViolet || '#8b5cf6'} !important; }
            .border-cyan-500 { border-color: ${currentValues.accentCyan || '#06b6d4'} !important; }
            .bg-slate-800, .bg-slate-900, .bg-gray-800, .bg-gray-900 {
                background: ${currentValues.card || 'rgba(255,255,255,0.85)'} !important;
                backdrop-filter: blur(${currentValues.glassBlur || '20'}px) !important;
                -webkit-backdrop-filter: blur(${currentValues.glassBlur || '20'}px) !important;
                border: 1px solid ${currentValues.border || 'rgba(0,0,0,0.12)'} !important;
            }
            body { background-color: ${currentValues.bg || '#ffffff'} !important; }
            .card, .stat-card {
                background: ${currentValues.card || 'rgba(255,255,255,0.85)'} !important;
                backdrop-filter: blur(${currentValues.glassBlur || '20'}px) !important;
                -webkit-backdrop-filter: blur(${currentValues.glassBlur || '20'}px) !important;
                border: 1px solid ${currentValues.border || 'rgba(0,0,0,0.12)'} !important;
            }
            .input-style {
                background-color: rgba(0,0,0,0.03) !important;
                color: ${textColor} !important;
                border-color: ${currentValues.border || 'rgba(0,0,0,0.12)'} !important;
            }
            .input-style::placeholder { color: ${mutedColor} !important; }
            .btn-primary {
                background-color: ${currentValues.primary || '#ffffff'} !important;
                color: ${textColor} !important;
                border-color: ${currentValues.border || 'rgba(0,0,0,0.15)'} !important;
            }
            .btn-primary:hover { background-color: ${currentValues.primaryDark || '#f3f4f6'} !important; }
            #creator-watermark { color: ${mutedColor} !important; }
        `;
    }

    // ── CREAR PANEL ──
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'ff-theme-panel';
        panel.innerHTML = `
            <div id="ff-theme-header">
                <span>🎨 Theme Editor</span>
                <button onclick="window.ffThemeEditor.closePanel()">✕</button>
            </div>
            <div id="ff-theme-content">
                <div id="ff-theme-presets"></div>
                <div id="ff-theme-controls"></div>
            </div>
            <div id="ff-theme-footer">
                <button onclick="window.ffThemeEditor.resetDefaults()">↺ Restaurar</button>
                <button onclick="window.ffThemeEditor.exportCSS()">📤 Exportar CSS</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Estilos del panel
        const panelStyle = document.createElement('style');
        panelStyle.textContent = `
            #ff-theme-panel {
                position: fixed;
                top: 0; right: -420px;
                width: 400px; height: 100vh;
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-left: 1px solid rgba(0,0,0,0.1);
                box-shadow: -10px 0 40px rgba(0,0,0,0.15);
                z-index: 99999;
                display: flex; flex-direction: column;
                transition: right 0.35s cubic-bezier(0.34,1.56,0.64,1);
                font-family: 'DM Sans', sans-serif;
            }
            #ff-theme-panel.open { right: 0; }
            #ff-theme-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(0,0,0,0.08);
                background: rgba(0,0,0,0.02);
            }
            #ff-theme-header span {
                font-size: 14px; font-weight: 900;
                text-transform: uppercase; letter-spacing: 0.1em;
                color: #111827;
            }
            #ff-theme-header button {
                background: none; border: none;
                font-size: 16px; cursor: pointer;
                color: #6b7280; transition: color 0.2s;
                width: 28px; height: 28px; border-radius: 6px;
                display: flex; align-items: center; justify-content: center;
            }
            #ff-theme-header button:hover { background: rgba(0,0,0,0.05); color: #111827; }
            #ff-theme-content {
                flex: 1; overflow-y: auto;
                padding: 16px 20px;
            }
            #ff-theme-presets {
                margin-bottom: 20px;
            }
            #ff-theme-presets h3 {
                font-size: 10px; font-weight: 900;
                text-transform: uppercase; letter-spacing: 0.15em;
                color: #6b7280; margin-bottom: 10px;
            }
            .ff-preset-btn {
                display: block; width: 100%;
                padding: 10px 14px; margin-bottom: 6px;
                border-radius: 10px; border: 1px solid rgba(0,0,0,0.08);
                background: rgba(0,0,0,0.02);
                font-size: 12px; font-weight: 700;
                color: #111827; cursor: pointer;
                transition: all 0.2s; text-align: left;
            }
            .ff-preset-btn:hover {
                background: rgba(0,0,0,0.05);
                transform: translateX(4px);
            }
            .ff-preset-btn.active {
                border-color: #06b6d4;
                background: rgba(6,182,212,0.08);
            }
            #ff-theme-controls h3 {
                font-size: 10px; font-weight: 900;
                text-transform: uppercase; letter-spacing: 0.15em;
                color: #6b7280; margin: 16px 0 10px;
                padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06);
            }
            .ff-control {
                margin-bottom: 12px;
            }
            .ff-control label {
                display: flex; justify-content: space-between;
                font-size: 11px; font-weight: 700;
                color: #374151; margin-bottom: 5px;
            }
            .ff-control label span {
                font-weight: 400; color: #9ca3af;
                font-size: 10px;
            }
            .ff-control input[type="color"] {
                width: 100%; height: 36px;
                border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);
                cursor: pointer; background: none;
            }
            .ff-control input[type="range"] {
                width: 100%; height: 4px;
                -webkit-appearance: none; appearance: none;
                background: #e5e7eb; border-radius: 2px;
                outline: none;
            }
            .ff-control input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none; appearance: none;
                width: 16px; height: 16px;
                border-radius: 50%; background: #06b6d4;
                cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            .ff-range-val {
                font-size: 10px; color: #6b7280;
                text-align: right; margin-top: 2px;
            }
            #ff-theme-footer {
                display: flex; gap: 8px;
                padding: 14px 20px;
                border-top: 1px solid rgba(0,0,0,0.08);
                background: rgba(0,0,0,0.02);
            }
            #ff-theme-footer button {
                flex: 1; padding: 8px 12px;
                border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);
                font-size: 11px; font-weight: 700;
                cursor: pointer; transition: all 0.2s;
            }
            #ff-theme-footer button:first-child {
                background: rgba(0,0,0,0.03); color: #374151;
            }
            #ff-theme-footer button:first-child:hover {
                background: rgba(0,0,0,0.08);
            }
            #ff-theme-footer button:last-child {
                background: #111827; color: white;
            }
            #ff-theme-footer button:last-child:hover {
                background: #374151;
            }
        `;
        document.head.appendChild(panelStyle);

        renderPresets();
        renderControls();
    }

    // ── RENDER PRESETS ──
    function renderPresets() {
        const container = document.getElementById('ff-theme-presets');
        container.innerHTML = '<h3>🎨 Presets Rápidos</h3>';
        PRESETS.forEach((p, i) => {
            const btn = document.createElement('button');
            btn.className = 'ff-preset-btn';
            btn.textContent = p.name;
            btn.onclick = () => applyPreset(i);
            container.appendChild(btn);
        });
    }

    // ── RENDER CONTROLES ──
    function renderControls() {
        const container = document.getElementById('ff-theme-controls');
        container.innerHTML = '<h3>⚙️ Personalización</h3>';

        CSS_VARS.forEach(v => {
            const div = document.createElement('div');
            div.className = 'ff-control';

            if (v.type === 'color') {
                div.innerHTML = `
                    <label>${v.label}</label>
                    <input type="color" value="${toHex(currentValues[v.id])}" 
                           oninput="window.ffThemeEditor.updateValue('${v.id}', this.value)">
                `;
            } else if (v.type === 'range') {
                const val = currentValues[v.id] || v.default;
                div.innerHTML = `
                    <label>${v.label} <span id="val-${v.id}">${val}${v.id === 'glassBlur' ? 'px' : v.id === 'borderRadius' ? 'px' : ''}</span></label>
                    <input type="range" min="${v.min}" max="${v.max}" step="${v.step || '1'}" value="${val}"
                           oninput="window.ffThemeEditor.updateValue('${v.id}', this.value)">
                `;
            }
            container.appendChild(div);
        });
    }

    // ── APLICAR PRESET ──
    function applyPreset(index) {
        const preset = PRESETS[index];
        if (!preset) return;
        Object.assign(currentValues, preset.values);
        applyValues();
        // Actualizar inputs
        document.querySelectorAll('.ff-preset-btn').forEach((b, i) => {
            b.classList.toggle('active', i === index);
        });
        // Refrescar controles
        renderControls();
        showToast('🎨 Tema aplicado: ' + preset.name, 'success');
    }

    // ── ACTUALIZAR VALOR ──
    function updateValue(id, value) {
        currentValues[id] = value;
        applyValues();
        // Actualizar label de range si aplica
        const label = document.getElementById('val-' + id);
        if (label) {
            const v = CSS_VARS.find(x => x.id === id);
            label.textContent = value + (id === 'glassBlur' ? 'px' : id === 'borderRadius' ? 'px' : '');
        }
    }

    // ── BOTÓN TOGGLE ──
    function createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'ff-theme-toggle';
        btn.innerHTML = '🎨';
        btn.title = 'Abrir Theme Editor';
        btn.onclick = togglePanel;

        const style = document.createElement('style');
        style.textContent = `
            #ff-theme-toggle {
                position: fixed;
                bottom: 24px; right: 24px;
                width: 52px; height: 52px;
                border-radius: 50%;
                background: #111827;
                color: white;
                font-size: 22px;
                border: none;
                cursor: pointer;
                z-index: 99998;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
                display: flex; align-items: center; justify-content: center;
            }
            #ff-theme-toggle:hover {
                transform: scale(1.1) rotate(15deg);
                box-shadow: 0 6px 24px rgba(0,0,0,0.4);
            }
            #ff-theme-toggle:active { transform: scale(0.95); }
        `;
        document.head.appendChild(style);
        document.body.appendChild(btn);
    }

    // ── ABRIR/CERRAR PANEL ──
    function togglePanel() {
        const panel = document.getElementById('ff-theme-panel');
        panelOpen = !panelOpen;
        panel.classList.toggle('open', panelOpen);
    }

    function closePanel() {
        panelOpen = false;
        document.getElementById('ff-theme-panel').classList.remove('open');
    }

    // ── RESET ──
    function resetDefaults() {
        CSS_VARS.forEach(v => currentValues[v.id] = v.default);
        applyValues();
        renderControls();
        document.querySelectorAll('.ff-preset-btn').forEach(b => b.classList.remove('active'));
        showToast('↺ Tema restaurado a valores por defecto', 'info');
    }

    // ── EXPORTAR CSS ──
    function exportCSS() {
        let css = `/* Fast Food Service — Tema Personalizado */
:root {
`;
        CSS_VARS.forEach(v => {
            let val = currentValues[v.id] || v.default;
            if (v.type === 'range' && v.id === 'glassBlur') val += 'px';
            css += `    ${v.cssVar}: ${val};
`;
        });
        css += `}
`;
        // Copiar al portapapeles
        navigator.clipboard.writeText(css).then(() => {
            showToast('📋 CSS copiado al portapapeles', 'success');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = css; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('📋 CSS copiado al portapapeles', 'success');
        });
    }

    // ── UTIL ──
    function toHex(val) {
        if (val.startsWith('#')) return val;
        if (val.startsWith('rgba')) {
            const m = val.match(/rgba?\(([^)]+)\)/);
            if (m) {
                const [r, g, b] = m[1].split(',').map(x => parseInt(x.trim()));
                return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            }
        }
        return '#ffffff';
    }

    function showToast(msg, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type);
        } else {
            // Fallback simple
            const el = document.createElement('div');
            el.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:99999;background:#111827;color:#fff;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
            el.textContent = msg;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3000);
        }
    }

    // ── EXPONER API GLOBAL ──
    window.ffThemeEditor = {
        togglePanel, closePanel, updateValue, applyPreset, resetDefaults, exportCSS
    };

    // ── INICIAR ──
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();