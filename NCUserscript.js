// ==UserScript==
// @name         NovaCore V2.3 Enhanced
// @namespace    http://github.com/TheM1ddleM1n/
// @version      2.3
// @description  NovaCore V2 with improved performance, memory management, code quality, and themes!
// @author       (Cant reveal who im), TheM1ddleM1n
// @match        https://miniblox.io/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===== CONSTANTS =====
    const TIMING = {
        INTRO_CHECK_APPEAR: 900,
        INTRO_BUTTON_EXIT: 3200,
        INTRO_TEXT_START: 4000,
        INTRO_CHECKMARK_APPEAR: 6300,
        INTRO_TOTAL_DURATION: 7000,
        INTRO_FADE_OUT: 1000,
        HINT_TEXT_DURATION: 4000,
        FPS_UPDATE_INTERVAL: 1000,
        CPS_UPDATE_INTERVAL: 100,
        CPS_WINDOW: 1000,
        SAVE_DEBOUNCE: 500
    };

    const THEMES = {
        cyan: {
            name: 'Cyan (Default)',
            primary: '#00ffff',
            primaryRgb: '0, 255, 255',
            shadow: '#00ffff'
        },
        purple: {
            name: 'Purple Dream',
            primary: '#9b59b6',
            primaryRgb: '155, 89, 182',
            shadow: '#9b59b6'
        },
        green: {
            name: 'Matrix Green',
            primary: '#2ecc71',
            primaryRgb: '46, 204, 113',
            shadow: '#2ecc71'
        },
        red: {
            name: 'Crimson Fire',
            primary: '#e74c3c',
            primaryRgb: '231, 76, 60',
            shadow: '#e74c3c'
        },
        blue: {
            name: 'Ocean Blue',
            primary: '#3498db',
            primaryRgb: '52, 152, 219',
            shadow: '#3498db'
        },
        gold: {
            name: 'Golden Glow',
            primary: '#f39c12',
            primaryRgb: '243, 156, 18',
            shadow: '#f39c12'
        },
        pink: {
            name: 'Bubblegum Pink',
            primary: '#ff69b4',
            primaryRgb: '255, 105, 180',
            shadow: '#ff69b4'
        },
        orange: {
            name: 'Sunset Orange',
            primary: '#ff6b35',
            primaryRgb: '255, 107, 53',
            shadow: '#ff6b35'
        }
    };

    const SETTINGS_KEY = 'novacore_settings';
    const DEFAULT_MENU_KEY = '\\';
    const SESSION_START_KEY = 'novacore_session_start';
    const SESSION_ID_KEY = 'novacore_session_id';
    const SCRIPT_VERSION = '2.3';

    // ===== STATE MANAGEMENT WITH PROXY =====
    const stateData = {
        fpsShown: false,
        cpsShown: false,
        realTimeShown: false,
        sessionTimerShown: false,
        menuKey: DEFAULT_MENU_KEY,
        currentTheme: 'cyan',
        counters: {
            fps: null,
            cps: null,
            realTime: null,
            sessionTimer: null
        },
        intervals: {
            fps: null,
            cps: null,
            realTime: null,
            sessionTimer: null
        },
        drag: {
            fps: { active: false, offsetX: 0, offsetY: 0 },
            cps: { active: false, offsetX: 0, offsetY: 0 },
            realTime: { active: false, offsetX: 0, offsetY: 0 },
            sessionTimer: { active: false, offsetX: 0, offsetY: 0 }
        },
        cpsClicks: [],
        rafId: null,
        sessionStartTime: null,
        cleanupFunctions: {
            fps: null,
            cps: null,
            realTime: null,
            sessionTimer: null
        }
    };

    const cachedElements = {};

    // ===== UTILITY FUNCTIONS =====
    function safeExecute(fn, fallbackValue = null, context = 'Unknown') {
        try {
            return fn();
        } catch (error) {
            console.error(`[NovaCore Error - ${context}]:`, error);
            return fallbackValue;
        }
    }

    function saveSettings() {
        safeExecute(() => {
            const settings = {
                version: SCRIPT_VERSION,
                fpsShown: stateData.fpsShown,
                cpsShown: stateData.cpsShown,
                realTimeShown: stateData.realTimeShown,
                sessionTimerShown: stateData.sessionTimerShown,
                menuKey: stateData.menuKey,
                currentTheme: stateData.currentTheme,
                positions: {
                    fps: stateData.counters.fps ? {
                        left: stateData.counters.fps.style.left,
                        top: stateData.counters.fps.style.top
                    } : null,
                    cps: stateData.counters.cps ? {
                        left: stateData.counters.cps.style.left,
                        top: stateData.counters.cps.style.top
                    } : null,
                    realTime: stateData.counters.realTime ? {
                        left: stateData.counters.realTime.style.left,
                        top: stateData.counters.realTime.style.top
                    } : null,
                    sessionTimer: stateData.counters.sessionTimer ? {
                        left: stateData.counters.sessionTimer.style.left,
                        top: stateData.counters.sessionTimer.style.top
                    } : null
                }
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }, null, 'saveSettings');
    }

    function migrateSettings(settings) {
        if (!settings.version) {
            console.log('[NovaCore] Migrating settings from old version');
            settings.version = SCRIPT_VERSION;
        }
        if (!settings.currentTheme) {
            settings.currentTheme = 'cyan';
        }
        return settings;
    }

    function loadSettings() {
        return safeExecute(() => {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                const settings = JSON.parse(saved);
                return migrateSettings(settings);
            }
            return null;
        }, null, 'loadSettings');
    }

    function throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = performance.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const debouncedSave = debounce(saveSettings, TIMING.SAVE_DEBOUNCE);

    const state = new Proxy(stateData, {
        set(target, prop, value) {
            const oldValue = target[prop];
            target[prop] = value;

            if ((prop.includes('Shown') || prop === 'currentTheme') && oldValue !== value) {
                debouncedSave();
            }

            return true;
        }
    });

    // ===== THEME SYSTEM =====
    function applyTheme(themeName) {
        const theme = THEMES[themeName] || THEMES.cyan;

        document.documentElement.style.setProperty('--nova-primary', theme.primary);
        document.documentElement.style.setProperty('--nova-primary-rgb', theme.primaryRgb);
        document.documentElement.style.setProperty('--nova-shadow', theme.shadow);

        state.currentTheme = themeName;

        if (cachedElements.hint) {
            cachedElements.hint.style.color = theme.primary;
            cachedElements.hint.style.textShadow = `
                0 0 4px ${theme.shadow},
                0 0 10px ${theme.shadow},
                0 0 14px ${theme.shadow}
            `;
        }

        console.log(`[NovaCore] Applied theme: ${theme.name}`);
    }

    // ===== STYLES =====
    const style = document.createElement('style');
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    :root {
        --nova-primary: #00ffff;
        --nova-primary-rgb: 0, 255, 255;
        --nova-shadow: #00ffff;
    }

    @keyframes slideDownInTop {
        from {opacity: 0; transform: translate(-50%, -70px);}
        to {opacity: 1; transform: translate(-50%, 0);}
    }
    @keyframes slideUpOutTop {
        from {opacity: 1; transform: translate(-50%, 0);}
        to {opacity: 0; transform: translate(-50%, -70px);}
    }
    @keyframes checkPopIn {
        0% {opacity: 0; transform: scale(0);}
        70% {opacity: 1; transform: scale(1.3);}
        100% {opacity: 1; transform: scale(1);}
    }
    @keyframes fadeScaleIn {
        from {opacity: 0; transform: scale(0.75);}
        to {opacity: 1; transform: scale(1);}
    }
    @keyframes strokeDashoffsetAnim {
        0% {stroke-dashoffset: 1000;}
        100% {stroke-dashoffset: 0;}
    }
    @keyframes checkmarkFadeScale {
        0% {opacity: 0; transform: scale(0);}
        100% {opacity: 1; transform: scale(1);}
    }
    @keyframes fadeOut {
        to {opacity: 0;}
    }

    #nova-intro {
        position: fixed;
        inset: 0;
        background: black;
        z-index: 999999;
        user-select: none;
        overflow: hidden;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .downloaded-btn {
        position: fixed;
        top: 10vh;
        left: 50%;
        transform: translateX(-50%);
        background: #111;
        border: 2px solid #e53935;
        color: white;
        padding: 12px 40px;
        border-radius: 30px;
        font-size: 1.3rem;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 0 12px rgba(229, 57, 53, 0.7);
        animation: slideDownInTop 0.8s ease forwards;
        white-space: nowrap;
        user-select: none;
        z-index: 1000001;
    }

    .checkmark {
        color: #e53935;
        font-size: 1.4rem;
        opacity: 0;
        transform: scale(0);
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .client-name-container {
        position: fixed;
        bottom: 10vh;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 20px;
        opacity: 0;
        animation-fill-mode: forwards;
        animation-timing-function: ease-out;
        user-select: none;
        z-index: 1000000;
    }

    .client-name-svg {
        width: 400px;
        height: 100px;
    }

    svg text {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 700;
        font-size: 72px;
        fill: white;
        stroke: #ff1744;
        stroke-width: 2px;
        stroke-linejoin: round;
        stroke-linecap: round;
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: strokeDashoffsetAnim 2.5s forwards ease;
        user-select: none;
    }

    .client-name-checkmark {
        font-size: 4.2rem;
        color: #ff1744;
        opacity: 0;
        transform: scale(0);
        animation-fill-mode: forwards;
        animation-timing-function: ease-out;
        user-select: none;
    }

    #nova-persistent-header {
        position: fixed;
        top: 10px;
        left: 10px;
        transform: none;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 900;
        font-size: 1.5rem;
        color: var(--nova-primary);
        text-shadow:
            0 0 8px var(--nova-shadow),
            0 0 20px var(--nova-shadow),
            0 0 30px var(--nova-shadow),
            0 0 40px var(--nova-shadow),
            0 0 50px var(--nova-shadow);
        user-select: none;
        z-index: 100000000;
        pointer-events: none;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.5s ease, color 0.3s ease, text-shadow 0.3s ease;
    }

    #nova-persistent-header.visible {
        opacity: 1;
    }

    #nova-menu-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        z-index: 10000000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: 40px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.35s ease;
        user-select: none;
    }

    #nova-menu-overlay.show {
        opacity: 1;
        pointer-events: auto;
    }

    #nova-menu-header {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 3rem;
        font-weight: 900;
        color: var(--nova-primary);
        text-shadow:
            0 0 8px var(--nova-shadow),
            0 0 20px var(--nova-shadow),
            0 0 30px var(--nova-shadow),
            0 0 40px var(--nova-shadow),
            0 0 50px var(--nova-shadow);
        user-select: none;
        margin-bottom: 30px;
        transition: color 0.3s ease, text-shadow 0.3s ease;
    }

    #nova-menu-content {
        width: 320px;
        background: #111a;
        border-radius: 16px;
        padding: 24px;
        color: white;
        font-size: 1.1rem;
        box-shadow:
            0 0 10px rgba(var(--nova-primary-rgb), 0.5),
            inset 0 0 8px rgba(var(--nova-primary-rgb), 0.3);
        user-select: none;
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-height: 80vh;
        overflow-y: auto;
        transition: box-shadow 0.3s ease;
    }

    .nova-menu-btn {
        background: #000000cc;
        border: 2px solid var(--nova-primary);
        color: var(--nova-primary);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 700;
        font-size: 1rem;
        padding: 16px 20px;
        margin-bottom: 4px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .nova-menu-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(var(--nova-primary-rgb), 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
    }

    .nova-menu-btn:active::before {
        width: 300px;
        height: 300px;
    }

    .nova-menu-btn:hover {
        background: var(--nova-primary);
        color: #000;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--nova-primary-rgb), 0.4);
    }

    #nova-hint-text {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Press Start 2P', cursive;
        color: var(--nova-primary);
        font-size: 1.25rem;
        text-shadow:
            0 0 4px var(--nova-shadow),
            0 0 10px var(--nova-shadow),
            0 0 14px var(--nova-shadow);
        user-select: none;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.8s ease, color 0.3s ease, text-shadow 0.3s ease;
        z-index: 9999999;
        white-space: nowrap;
    }

    .counter {
        position: fixed;
        background: rgba(var(--nova-primary-rgb), 0.85);
        color: #000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        padding: 8px 14px;
        border-radius: 12px;
        box-shadow:
            0 0 8px rgba(var(--nova-primary-rgb), 0.7),
            inset 0 0 8px rgba(var(--nova-primary-rgb), 0.3);
        user-select: none;
        cursor: grab;
        z-index: 999999999;
        width: max-content;
        max-width: 160px;
        text-align: center;
        transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        will-change: transform;
    }

    .counter.dragging {
        cursor: grabbing;
        opacity: 0.85;
        user-select: none;
    }

    #real-time-counter {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(var(--nova-primary-rgb), 0.85);
        color: #000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 700;
        font-size: 22px;
        padding: 8px 14px;
        border-radius: 12px;
        box-shadow:
            0 0 8px rgba(var(--nova-primary-rgb), 0.7),
            inset 0 0 8px rgba(var(--nova-primary-rgb), 0.3);
        cursor: default;
        user-select: none;
        z-index: 999999999;
        width: 180px;
        text-align: center;
        pointer-events: auto;
        transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    #real-time-counter .counter-time-text {
        font-variant-numeric: tabular-nums;
        display: inline-block;
        min-width: 150px;
    }

    .counter-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        right: 0;
        background: black;
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: 0 0 6px rgba(0,0,0,0.8);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
        z-index: 1000000000;
    }

    .counter:hover .counter-tooltip {
        opacity: 1;
    }

    .settings-section {
        border-top: 1px solid rgba(var(--nova-primary-rgb), 0.3);
        padding-top: 24px;
        margin-top: 16px;
        transition: border-color 0.3s ease;
    }

    .settings-label {
        font-size: 0.9rem;
        color: var(--nova-primary);
        margin-bottom: 10px;
        display: block;
        transition: color 0.3s ease;
    }

    .keybind-input {
        width: 100%;
        background: #000000cc;
        border: 2px solid var(--nova-primary);
        color: var(--nova-primary);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 700;
        font-size: 1rem;
        padding: 8px 12px;
        border-radius: 8px;
        text-align: center;
        transition: all 0.3s ease;
    }

    .keybind-input:focus {
        outline: none;
        box-shadow: 0 0 12px rgba(var(--nova-primary-rgb), 0.6);
        background: rgba(var(--nova-primary-rgb), 0.15);
    }

    .theme-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 12px;
    }

    .theme-btn {
        background: #000000cc;
        border: 2px solid;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 600;
        font-size: 0.85rem;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;
        text-align: center;
        position: relative;
    }

    .theme-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .theme-btn.active {
        box-shadow: 0 0 15px currentColor, inset 0 0 10px currentColor;
        font-weight: 900;
    }

    .theme-btn.cyan { border-color: #00ffff; color: #00ffff; }
    .theme-btn.purple { border-color: #9b59b6; color: #9b59b6; }
    .theme-btn.green { border-color: #2ecc71; color: #2ecc71; }
    .theme-btn.red { border-color: #e74c3c; color: #e74c3c; }
    .theme-btn.blue { border-color: #3498db; color: #3498db; }
    .theme-btn.gold { border-color: #f39c12; color: #f39c12; }
    .theme-btn.pink { border-color: #ff69b4; color: #ff69b4; }
    .theme-btn.orange { border-color: #ff6b35; color: #ff6b35; }

    @media (max-width: 768px) {
        #nova-persistent-header {
            font-size: 1.8rem;
        }

        #nova-menu-header {
            font-size: 2rem;
        }

        #nova-menu-content {
            width: 90%;
            max-width: 320px;
        }

        #nova-hint-text {
            font-size: 0.9rem;
        }

        .counter {
            font-size: 1rem;
        }

        .theme-grid {
            grid-template-columns: 1fr;
        }
    }
    `;
    document.head.appendChild(style);

    // ===== INTRO =====
    function createIntro() {
        return safeExecute(() => {
            const overlay = document.createElement('div');
            overlay.id = 'nova-intro';

            const button = document.createElement('div');
            button.className = 'downloaded-btn';
            button.textContent = 'Client Downloaded';

            const checkBtn = document.createElement('span');
            checkBtn.className = 'checkmark';
            checkBtn.textContent = '✔️';
            button.appendChild(checkBtn);
            overlay.appendChild(button);

            const clientNameContainer = document.createElement('div');
            clientNameContainer.className = 'client-name-container';

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute('viewBox', '0 0 400 100');
            svg.classList.add('client-name-svg');

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('x', '50%');
            text.setAttribute('y', '70%');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = 'NovaCore';
            svg.appendChild(text);
            clientNameContainer.appendChild(svg);

            const clientCheckmark = document.createElement('span');
            clientCheckmark.className = 'client-name-checkmark';
            clientCheckmark.textContent = '✔️';
            clientNameContainer.appendChild(clientCheckmark);
            overlay.appendChild(clientNameContainer);
            document.body.appendChild(overlay);

            setTimeout(() => checkBtn.style.animation = 'checkPopIn 0.6s forwards ease', TIMING.INTRO_CHECK_APPEAR);
            setTimeout(() => button.style.animation = 'slideUpOutTop 0.8s ease forwards', TIMING.INTRO_BUTTON_EXIT);
            setTimeout(() => {
                text.style.animation = 'strokeDashoffsetAnim 2.5s forwards ease';
                clientNameContainer.style.opacity = '1';
                clientNameContainer.style.animation = 'fadeScaleIn 0.8s ease forwards';
            }, TIMING.INTRO_TEXT_START);
            setTimeout(() => clientCheckmark.style.animation = 'checkmarkFadeScale 0.5s forwards ease', TIMING.INTRO_CHECKMARK_APPEAR);

            return overlay;
        }, null, 'createIntro');
    }

    function createPersistentHeader() {
        return safeExecute(() => {
            const header = document.createElement('div');
            header.id = 'nova-persistent-header';
            header.textContent = 'Novacore💎';
            document.body.appendChild(header);
            cachedElements.header = header;
            return header;
        }, null, 'createPersistentHeader');
    }

    function createHintText() {
        return safeExecute(() => {
            const hint = document.createElement('div');
            hint.id = 'nova-hint-text';
            hint.textContent = `Press ${state.menuKey} To Open Menu!`;
            document.body.appendChild(hint);
            cachedElements.hint = hint;
            return hint;
        }, null, 'createHintText');
    }

    // ===== DRAGGING =====
    function setupDragging(element, counterType) {
        const dragState = state.drag[counterType];

        const onMouseDown = (e) => {
            dragState.active = true;
            dragState.offsetX = e.clientX - element.getBoundingClientRect().left;
            dragState.offsetY = e.clientY - element.getBoundingClientRect().top;
            element.classList.add('dragging');
            e.preventDefault();
        };

        const onMouseUp = () => {
            if (dragState.active) {
                dragState.active = false;
                element.classList.remove('dragging');
                debouncedSave();
            }
        };

        const onMouseMove = throttle((e) => {
            if (dragState.active) {
                let newX = e.clientX - dragState.offsetX;
                let newY = e.clientY - dragState.offsetY;

                const padding = 10;
                const maxX = window.innerWidth - element.offsetWidth - padding;
                const maxY = window.innerHeight - element.offsetHeight - padding;

                newX = Math.min(maxX, Math.max(padding, newX));
                newY = Math.min(maxY, Math.max(padding, newY));

                requestAnimationFrame(() => {
                    element.style.left = newX + 'px';
                    element.style.top = newY + 'px';
                });
            }
        }, 16);

        element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);

        return () => {
            element.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }

    // ===== FPS COUNTER =====
    function createFPSCounter() {
        return safeExecute(() => {
            const counter = document.createElement('div');
            counter.id = 'fps-counter';
            counter.className = 'counter';
            counter.style.left = '50px';
            counter.style.top = '80px';
            counter.textContent = 'FPS: 0';

            const tooltip = document.createElement('div');
            tooltip.className = 'counter-tooltip';
            tooltip.textContent = 'Frames Per Second';
            counter.appendChild(tooltip);

            document.body.appendChild(counter);
            state.cleanupFunctions.fps = setupDragging(counter, 'fps');
            return counter;
        }, null, 'createFPSCounter');
    }

    function startFPSCounter() {
        safeExecute(() => {
            if (!state.counters.fps) createFPSCounter();

            let frameCount = 0;
            let lastTime = performance.now();

            function updateFPS(currentTime) {
                frameCount++;
                const elapsed = currentTime - lastTime;

                if (elapsed >= TIMING.FPS_UPDATE_INTERVAL) {
                    const fps = Math.round((frameCount * 1000) / elapsed);
                    if (state.counters.fps && state.counters.fps.firstChild) {
                        state.counters.fps.firstChild.nodeValue = `FPS: ${fps}`;
                    }
                    frameCount = 0;
                    lastTime = currentTime;
                }

                if (state.counters.fps) {
                    state.rafId = requestAnimationFrame(updateFPS);
                }
            }

            state.rafId = requestAnimationFrame(updateFPS);
        }, null, 'startFPSCounter');
    }

    function stopFPSCounter() {
        safeExecute(() => {
            if (state.cleanupFunctions.fps) {
                state.cleanupFunctions.fps();
                state.cleanupFunctions.fps = null;
            }

            if (state.counters.fps) {
                state.counters.fps.remove();
                state.counters.fps = null;
            }

            if (state.rafId) {
                cancelAnimationFrame(state.rafId);
                state.rafId = null;
            }
        }, null, 'stopFPSCounter');
    }

    // ===== CPS COUNTER =====
    const cpsClickListener = (e) => {
        if (e.button === 0) {
            state.cpsClicks.push(performance.now());
            const cutoff = performance.now() - TIMING.CPS_WINDOW;
            state.cpsClicks = state.cpsClicks.filter(ts => ts >= cutoff);
            updateCPSCounter();
        }
    };

    function createCPSCounter() {
        return safeExecute(() => {
            const counter = document.createElement('div');
            counter.id = 'cps-counter';
            counter.className = 'counter';
            counter.style.left = '50px';
            counter.style.top = '150px';
            counter.textContent = 'CPS: 0';

            const tooltip = document.createElement('div');
            tooltip.className = 'counter-tooltip';
            tooltip.textContent = 'Clicks Per Second';
            counter.appendChild(tooltip);

            document.body.appendChild(counter);
            state.counters.cps = counter;

            const dragCleanup = setupDragging(counter, 'cps');
            window.addEventListener('mousedown', cpsClickListener);

            state.cleanupFunctions.cps = () => {
                dragCleanup();
                window.removeEventListener('mousedown', cpsClickListener);
            };

            return counter;
        }, null, 'createCPSCounter');
    }

    function updateCPSCounter() {
        safeExecute(() => {
            if (state.counters.cps && state.counters.cps.firstChild) {
                state.counters.cps.firstChild.nodeValue = `CPS: ${state.cpsClicks.length}`;
            }
        }, null, 'updateCPSCounter');
    }

    function startCPSCounter() {
        safeExecute(() => {
            if (!state.counters.cps) createCPSCounter();
            state.cpsClicks = [];
            state.intervals.cps = setInterval(() => {
                const cutoff = performance.now() - TIMING.CPS_WINDOW;
                state.cpsClicks = state.cpsClicks.filter(ts => ts >= cutoff);
                updateCPSCounter();
            }, TIMING.CPS_UPDATE_INTERVAL);
        }, null, 'startCPSCounter');
    }

    function stopCPSCounter() {
        safeExecute(() => {
            if (state.cleanupFunctions.cps) {
                state.cleanupFunctions.cps();
                state.cleanupFunctions.cps = null;
            }

            if (state.counters.cps) {
                state.counters.cps.remove();
                state.counters.cps = null;
            }

            if (state.intervals.cps) {
                clearInterval(state.intervals.cps);
                state.intervals.cps = null;
            }
        }, null, 'stopCPSCounter');
    }

    // ===== REAL TIME COUNTER =====
    function createRealTimeCounter() {
        return safeExecute(() => {
            const counter = document.createElement('div');
            counter.id = 'real-time-counter';
            counter.className = 'counter';

            const timeText = document.createElement('span');
            timeText.className = 'counter-time-text';
            counter.appendChild(timeText);

            const tooltip = document.createElement('div');
            tooltip.className = 'counter-tooltip';
            tooltip.textContent = "Shows you the time so you don't have to exit Fullscreen";
            counter.appendChild(tooltip);

            document.body.appendChild(counter);
            state.counters.realTime = counter;
            return counter;
        }, null, 'createRealTimeCounter');
    }

    function updateRealTime() {
        safeExecute(() => {
            if (!state.counters.realTime) return;

            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;

            const timeText = state.counters.realTime.querySelector('.counter-time-text');
            if (timeText) {
                timeText.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
            }
        }, null, 'updateRealTime');
    }

    function startRealTimeCounter() {
        safeExecute(() => {
            if (!state.counters.realTime) createRealTimeCounter();
            updateRealTime();
            state.intervals.realTime = setInterval(updateRealTime, 1000);
        }, null, 'startRealTimeCounter');
    }

    function stopRealTimeCounter() {
        safeExecute(() => {
            if (state.counters.realTime) {
                state.counters.realTime.remove();
                state.counters.realTime = null;
            }
            if (state.intervals.realTime) {
                clearInterval(state.intervals.realTime);
                state.intervals.realTime = null;
            }
        }, null, 'stopRealTimeCounter');
    }

    // ===== SESSION TIMER =====
    function getSessionStartTime() {
        return safeExecute(() => {
            // Generate a unique session ID for this page load
            const currentSessionId = Date.now() + '_' + Math.random();
            const savedSessionId = sessionStorage.getItem(SESSION_ID_KEY);

            // If session IDs don't match, this is a new session (reload/new tab)
            if (!savedSessionId || savedSessionId !== currentSessionId) {
                // Store new session ID in sessionStorage (clears on tab close/reload)
                sessionStorage.setItem(SESSION_ID_KEY, currentSessionId);

                // Reset the timer
                const now = Date.now();
                localStorage.setItem(SESSION_START_KEY, now.toString());
                return now;
            }

            // Same session, return saved time
            const saved = localStorage.getItem(SESSION_START_KEY);
            if (saved) {
                return parseInt(saved, 10);
            }

            // Fallback: create new timer
            const now = Date.now();
            localStorage.setItem(SESSION_START_KEY, now.toString());
            return now;
        }, Date.now(), 'getSessionStartTime');
    }

    function resetSessionTimer() {
        safeExecute(() => {
            const now = Date.now();
            localStorage.setItem(SESSION_START_KEY, now.toString());
            state.sessionStartTime = now;
            updateSessionTimer();
        }, null, 'resetSessionTimer');
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    function createSessionTimerCounter() {
        return safeExecute(() => {
            const counter = document.createElement('div');
            counter.id = 'session-timer-counter';
            counter.className = 'counter';
            counter.style.left = '50px';
            counter.style.top = '220px';

            const timeText = document.createElement('span');
            timeText.className = 'counter-time-text';
            counter.appendChild(timeText);

            const tooltip = document.createElement('div');
            tooltip.className = 'counter-tooltip';
            tooltip.textContent = 'Session Time - Right click to reset';
            counter.appendChild(tooltip);

            counter.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm('Reset session timer?')) {
                    resetSessionTimer();
                }
            });

            document.body.appendChild(counter);
            state.counters.sessionTimer = counter;

            state.cleanupFunctions.sessionTimer = setupDragging(counter, 'sessionTimer');
            return counter;
        }, null, 'createSessionTimerCounter');
    }

    function updateSessionTimer() {
        safeExecute(() => {
            if (!state.counters.sessionTimer) return;

            const elapsed = Date.now() - state.sessionStartTime;
            const timeText = state.counters.sessionTimer.querySelector('.counter-time-text');
            if (timeText) {
                timeText.textContent = `⏱️ ${formatTime(elapsed)}`;
            }
        }, null, 'updateSessionTimer');
    }

    function startSessionTimer() {
        safeExecute(() => {
            if (!state.counters.sessionTimer) createSessionTimerCounter();

            state.sessionStartTime = getSessionStartTime();
            updateSessionTimer();

            state.intervals.sessionTimer = setInterval(updateSessionTimer, 1000);
        }, null, 'startSessionTimer');
    }

    function stopSessionTimer() {
        safeExecute(() => {
            if (state.cleanupFunctions.sessionTimer) {
                state.cleanupFunctions.sessionTimer();
                state.cleanupFunctions.sessionTimer = null;
            }

            if (state.counters.sessionTimer) {
                state.counters.sessionTimer.remove();
                state.counters.sessionTimer = null;
            }

            if (state.intervals.sessionTimer) {
                clearInterval(state.intervals.sessionTimer);
                state.intervals.sessionTimer = null;
            }
        }, null, 'stopSessionTimer');
    }

    // ===== MENU =====
    function createMenu() {
        return safeExecute(() => {
            const menuOverlay = document.createElement('div');
            menuOverlay.id = 'nova-menu-overlay';

            const menuHeader = document.createElement('div');
            menuHeader.id = 'nova-menu-header';
            menuHeader.textContent = 'Novacore💎';
            menuOverlay.appendChild(menuHeader);

            const menuContent = document.createElement('div');
            menuContent.id = 'nova-menu-content';

            const fpsBtn = document.createElement('button');
            fpsBtn.className = 'nova-menu-btn';
            fpsBtn.textContent = 'FPS Counter';
            fpsBtn.addEventListener('click', () => {
                if (state.fpsShown) {
                    stopFPSCounter();
                    fpsBtn.textContent = 'FPS Counter';
                    state.fpsShown = false;
                } else {
                    startFPSCounter();
                    fpsBtn.textContent = 'Hide FPS Counter';
                    state.fpsShown = true;
                }
            });
            menuContent.appendChild(fpsBtn);

            const cpsBtn = document.createElement('button');
            cpsBtn.className = 'nova-menu-btn';
            cpsBtn.textContent = 'CPS Counter';
            cpsBtn.addEventListener('click', () => {
                if (state.cpsShown) {
                    stopCPSCounter();
                    cpsBtn.textContent = 'CPS Counter';
                    state.cpsShown = false;
                } else {
                    startCPSCounter();
                    cpsBtn.textContent = 'Hide CPS Counter';
                    state.cpsShown = true;
                }
            });
            menuContent.appendChild(cpsBtn);

            const realTimeBtn = document.createElement('button');
            realTimeBtn.className = 'nova-menu-btn';
            realTimeBtn.textContent = 'Real Time';
            realTimeBtn.addEventListener('click', () => {
                if (state.realTimeShown) {
                    stopRealTimeCounter();
                    realTimeBtn.textContent = 'Real Time';
                    state.realTimeShown = false;
                } else {
                    startRealTimeCounter();
                    realTimeBtn.textContent = 'Hide Real Time';
                    state.realTimeShown = true;
                }
            });
            menuContent.appendChild(realTimeBtn);

            const sessionTimerBtn = document.createElement('button');
            sessionTimerBtn.className = 'nova-menu-btn';
            sessionTimerBtn.textContent = 'Session Timer';
            sessionTimerBtn.addEventListener('click', () => {
                if (state.sessionTimerShown) {
                    stopSessionTimer();
                    sessionTimerBtn.textContent = 'Session Timer';
                    state.sessionTimerShown = false;
                } else {
                    startSessionTimer();
                    sessionTimerBtn.textContent = 'Hide Session Timer';
                    state.sessionTimerShown = true;
                }
            });
            menuContent.appendChild(sessionTimerBtn);

            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'nova-menu-btn';
            fullscreenBtn.textContent = 'Auto Fullscreen';
            fullscreenBtn.addEventListener('click', () => {
                const elem = document.documentElement;

                if (!document.fullscreenElement) {
                    elem.requestFullscreen().catch(err => {
                        alert(`Error trying to enable fullscreen: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            });
            menuContent.appendChild(fullscreenBtn);

            // Theme section
            const themeSection = document.createElement('div');
            themeSection.className = 'settings-section';

            const themeLabel = document.createElement('label');
            themeLabel.className = 'settings-label';
            themeLabel.textContent = 'Theme:';
            themeSection.appendChild(themeLabel);

            const themeGrid = document.createElement('div');
            themeGrid.className = 'theme-grid';

            Object.keys(THEMES).forEach(themeKey => {
                const theme = THEMES[themeKey];
                const themeBtn = document.createElement('button');
                themeBtn.className = `theme-btn ${themeKey}`;
                themeBtn.textContent = theme.name.replace(' (Default)', '');

                if (state.currentTheme === themeKey) {
                    themeBtn.classList.add('active');
                }

                themeBtn.addEventListener('click', () => {
                    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
                    themeBtn.classList.add('active');
                    applyTheme(themeKey);
                });

                themeGrid.appendChild(themeBtn);
            });

            themeSection.appendChild(themeGrid);
            menuContent.appendChild(themeSection);

            // Keybind section
            const settingsSection = document.createElement('div');
            settingsSection.className = 'settings-section';

            const keybindLabel = document.createElement('label');
            keybindLabel.className = 'settings-label';
            keybindLabel.textContent = 'Menu Keybind:';
            settingsSection.appendChild(keybindLabel);

            const keybindInput = document.createElement('input');
            keybindInput.type = 'text';
            keybindInput.className = 'keybind-input';
            keybindInput.value = state.menuKey;
            keybindInput.readOnly = true;
            keybindInput.placeholder = 'Press a key...';

            keybindInput.addEventListener('keydown', (e) => {
                e.preventDefault();
                if (e.key === 'Escape') {
                    keybindInput.value = state.menuKey;
                    keybindInput.blur();
                    return;
                }

                state.menuKey = e.key;
                keybindInput.value = e.key;
                if (cachedElements.hint) {
                    cachedElements.hint.textContent = `Press ${state.menuKey} To Open Menu!`;
                }
                keybindInput.blur();
            });

            settingsSection.appendChild(keybindInput);
            menuContent.appendChild(settingsSection);

            menuOverlay.appendChild(menuContent);
            document.body.appendChild(menuOverlay);

            cachedElements.menu = menuOverlay;
            cachedElements.fpsBtn = fpsBtn;
            cachedElements.cpsBtn = cpsBtn;
            cachedElements.realTimeBtn = realTimeBtn;
            cachedElements.sessionTimerBtn = sessionTimerBtn;
            cachedElements.fullscreenBtn = fullscreenBtn;

            menuOverlay.addEventListener('click', (e) => {
                if (e.target === menuOverlay) {
                    closeMenu();
                }
            });

            return menuOverlay;
        }, null, 'createMenu');
    }

    function openMenu() {
        if (cachedElements.menu) {
            cachedElements.menu.classList.add('show');
            if (cachedElements.header) {
                cachedElements.header.classList.remove('visible');
            }
        }
    }

    function closeMenu() {
        if (cachedElements.menu) {
            cachedElements.menu.classList.remove('show');
            if (cachedElements.header) {
                cachedElements.header.classList.add('visible');
            }
        }
    }

    function toggleMenu() {
        if (cachedElements.menu && cachedElements.menu.classList.contains('show')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // ===== FULLSCREEN HANDLER =====
    function setupFullscreenHandler() {
        document.addEventListener('fullscreenchange', () => {
            safeExecute(() => {
                if (cachedElements.fullscreenBtn) {
                    if (document.fullscreenElement) {
                        cachedElements.fullscreenBtn.textContent = 'Exit Fullscreen';
                    } else {
                        cachedElements.fullscreenBtn.textContent = 'Auto Fullscreen';
                    }
                }
            }, null, 'fullscreenchange');
        });
    }

    // ===== KEYBOARD HANDLER =====
    function setupKeyboardHandler() {
        window.addEventListener('keydown', (e) => {
            if (e.key === state.menuKey) {
                e.preventDefault();
                toggleMenu();
            } else if (e.key === 'Escape' && cachedElements.menu && cachedElements.menu.classList.contains('show')) {
                e.preventDefault();
                closeMenu();
            }
        });
    }

    // ===== RESTORE SAVED STATE =====
    function restoreSavedState() {
        safeExecute(() => {
            const settings = loadSettings();
            if (!settings) return;

            if (settings.menuKey) {
                state.menuKey = settings.menuKey;
                if (cachedElements.hint) {
                    cachedElements.hint.textContent = `Press ${state.menuKey} To Open Menu!`;
                }
            }

            if (settings.currentTheme) {
                applyTheme(settings.currentTheme);
            }

            if (settings.fpsShown) {
                startFPSCounter();
                state.fpsShown = true;
                if (cachedElements.fpsBtn) {
                    cachedElements.fpsBtn.textContent = 'Hide FPS Counter';
                }

                if (settings.positions?.fps && state.counters.fps) {
                    state.counters.fps.style.left = settings.positions.fps.left;
                    state.counters.fps.style.top = settings.positions.fps.top;
                }
            }

            if (settings.cpsShown) {
                startCPSCounter();
                state.cpsShown = true;
                if (cachedElements.cpsBtn) {
                    cachedElements.cpsBtn.textContent = 'Hide CPS Counter';
                }

                if (settings.positions?.cps && state.counters.cps) {
                    state.counters.cps.style.left = settings.positions.cps.left;
                    state.counters.cps.style.top = settings.positions.cps.top;
                }
            }

            if (settings.realTimeShown) {
                startRealTimeCounter();
                state.realTimeShown = true;
                if (cachedElements.realTimeBtn) {
                    cachedElements.realTimeBtn.textContent = 'Hide Real Time';
                }
            }

            if (settings.sessionTimerShown) {
                startSessionTimer();
                state.sessionTimerShown = true;
                if (cachedElements.sessionTimerBtn) {
                    cachedElements.sessionTimerBtn.textContent = 'Hide Session Timer';
                }

                if (settings.positions?.sessionTimer && state.counters.sessionTimer) {
                    state.counters.sessionTimer.style.left = settings.positions.sessionTimer.left;
                    state.counters.sessionTimer.style.top = settings.positions.sessionTimer.top;
                }
            }
        }, null, 'restoreSavedState');
    }

    // ===== GLOBAL CLEANUP =====
    function globalCleanup() {
        safeExecute(() => {
            console.log('[NovaCore] Cleaning up resources...');

            stopFPSCounter();
            stopCPSCounter();
            stopRealTimeCounter();
            stopSessionTimer();

            Object.values(state.intervals).forEach(interval => {
                if (interval) clearInterval(interval);
            });

            if (state.rafId) {
                cancelAnimationFrame(state.rafId);
            }

            Object.values(state.cleanupFunctions).forEach(cleanup => {
                if (cleanup) cleanup();
            });

            console.log('[NovaCore] Cleanup complete');
        }, null, 'globalCleanup');
    }

    window.addEventListener('beforeunload', globalCleanup);

    // ===== INITIALIZATION =====
    function init() {
        safeExecute(() => {
            console.log(`[NovaCore] Initializing version ${SCRIPT_VERSION}...`);

            const intro = createIntro();
            const header = createPersistentHeader();
            const hint = createHintText();
            const menu = createMenu();

            setupFullscreenHandler();
            setupKeyboardHandler();

            setTimeout(() => {
                intro.style.animation = 'fadeOut 1s ease forwards';
                setTimeout(() => {
                    intro.remove();
                    header.classList.add('visible');
                    hint.style.opacity = '1';

                    setTimeout(() => {
                        hint.style.opacity = '0';
                    }, TIMING.HINT_TEXT_DURATION);

                    restoreSavedState();
                    console.log('[NovaCore] Initialization complete');
                }, TIMING.INTRO_FADE_OUT);
            }, TIMING.INTRO_TOTAL_DURATION);
        }, null, 'init');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
