// ==UserScript==
// @name         NovaCore V2
// @namespace    http://github.com/ModuleMaster64/
// @version      2.01-dev
// @description  Novacore V2 but improved by MM64!
// @author       (Cant reveal who im), MM64
// @match        https://miniblox.io/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    /* --- Intro Animations --- */
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

    /* --- Intro styles --- */
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

    /* --- Persistent glowing header on top --- */
    #nova-persistent-header {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 900;
        font-size: 2.5rem;
        color: #00ffff;
        text-shadow:
            0 0 8px #00ffff,
            0 0 20px #00ffff,
            0 0 30px #00ffff,
            0 0 40px #00ffff,
            0 0 50px #00ffff;
        user-select: none;
        z-index: 100000000;
        pointer-events: none;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.5s ease;
    }

    #nova-persistent-header.visible {
        opacity: 1;
    }

    /* --- Menu styles --- */
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
        color: #00ffff;
        text-shadow:
            0 0 8px #00ffff,
            0 0 20px #00ffff,
            0 0 30px #00ffff,
            0 0 40px #00ffff,
            0 0 50px #00ffff;
        user-select: none;
        margin-bottom: 30px;
    }

    #nova-menu-content {
        width: 320px;
        background: #111a;
        border-radius: 16px;
        padding: 24px;
        color: white;
        font-size: 1.1rem;
        box-shadow:
            0 0 10px #00ffff88,
            inset 0 0 8px #00ffff44;
        user-select: none;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    /* Menu buttons */
    .nova-menu-btn {
        background: #000000cc;
        border: 2px solid #00ffff;
        color: #00ffff;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 700;
        font-size: 1rem;
        padding: 12px 20px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.3s ease, color 0.3s ease;
        user-select: none;
        text-align: center;
    }
    .nova-menu-btn:hover {
        background: #00ffff;
        color: #000;
    }

    /* --- Minecraft style hint text in middle --- */
    #nova-hint-text {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Press Start 2P', cursive;
        color: #00ffff;
        font-size: 1.25rem;
        text-shadow:
            0 0 4px #00ffff,
            0 0 10px #00ffff,
            0 0 14px #00ffff;
        user-select: none;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.8s ease;
        z-index: 9999999;
        white-space: nowrap;
    }

    /* --- FPS & CPS Counter styles --- */
    .counter {
        position: fixed;
        top: 50px;
        left: 50px;
        background: rgba(0, 255, 255, 0.85);
        color: #000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        padding: 8px 14px;
        border-radius: 12px;
        box-shadow:
            0 0 8px #00ffffaa,
            inset 0 0 8px #00ffff55;
        user-select: none;
        cursor: grab;
        z-index: 999999999;
        width: max-content;
        max-width: 160px;
        text-align: center;
    }
    .counter.dragging {
        cursor: grabbing;
        opacity: 0.85;
        user-select: none;
    }
    `;
    document.head.appendChild(style);

    // Intro overlay container
    const overlay = document.createElement('div');
    overlay.id = 'nova-intro';

    // "Client Downloaded" button on top middle
    const button = document.createElement('div');
    button.className = 'downloaded-btn';
    button.textContent = 'Client Downloaded';

    // Checkmark next to it with animation
    const checkBtn = document.createElement('span');
    checkBtn.className = 'checkmark';
    checkBtn.textContent = '✔️';
    button.appendChild(checkBtn);

    overlay.appendChild(button);

    // "NovaCore" client name at bottom middle
    const clientNameContainer = document.createElement('div');
    clientNameContainer.className = 'client-name-container';

    // SVG text with stroke animation
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

    // Checkmark next to NovaCore text with animation
    const clientCheckmark = document.createElement('span');
    clientCheckmark.className = 'client-name-checkmark';
    clientCheckmark.textContent = '✔️';
    clientNameContainer.appendChild(clientCheckmark);

    overlay.appendChild(clientNameContainer);
    document.body.appendChild(overlay);

    // Animate intro sequence
    setTimeout(() => {
        checkBtn.style.animation = 'checkPopIn 0.6s forwards ease';
    }, 900);

    setTimeout(() => {
        button.style.animation = 'slideUpOutTop 0.8s ease forwards';
    }, 3200);

    setTimeout(() => {
        text.style.animation = 'strokeDashoffsetAnim 2.5s forwards ease';
        clientNameContainer.style.opacity = '1';
        clientNameContainer.style.animation = 'fadeScaleIn 0.8s ease forwards';
    }, 4000);

    setTimeout(() => {
        clientCheckmark.style.animation = 'checkmarkFadeScale 0.5s forwards ease';
    }, 6300);

    // Persistent header (Novacore💎)
    const persistentHeader = document.createElement('div');
    persistentHeader.id = 'nova-persistent-header';
    persistentHeader.textContent = 'Novacore💎';
    document.body.appendChild(persistentHeader);

    // Minecraft style hint text (hidden initially)
    const hintText = document.createElement('div');
    hintText.id = 'nova-hint-text';
    hintText.textContent = 'Press \\ To Open Menu!';
    document.body.appendChild(hintText);

    // After intro total (~7s), fade out intro and show persistent header + hint text
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 1s ease forwards';
        setTimeout(() => {
            overlay.remove();
            persistentHeader.classList.add('visible');
            hintText.style.opacity = '1';

            // Hide hint text after 4s and never show again
            setTimeout(() => {
                hintText.style.opacity = '0';
            }, 4000);
        }, 1000);
    }, 7000);

    // Menu overlay
    const menuOverlay = document.createElement('div');
    menuOverlay.id = 'nova-menu-overlay';

    const menuHeader = document.createElement('div');
    menuHeader.id = 'nova-menu-header';
    menuHeader.textContent = 'Novacore💎';
    menuOverlay.appendChild(menuHeader);

    const menuContent = document.createElement('div');
    menuContent.id = 'nova-menu-content';

    // Add FPS Counter button to menu content
    const fpsBtn = document.createElement('button');
    fpsBtn.className = 'nova-menu-btn';
    fpsBtn.textContent = 'FPS Counter';
    menuContent.appendChild(fpsBtn);

    // Add CPS Counter button to menu content
    const cpsBtn = document.createElement('button');
    cpsBtn.className = 'nova-menu-btn';
    cpsBtn.textContent = 'CPS Counter';
    menuContent.appendChild(cpsBtn);
    // Add Real Time button to menu content
const realTimeBtn = document.createElement('button');
realTimeBtn.className = 'nova-menu-btn';
realTimeBtn.textContent = 'Real Time';
menuContent.appendChild(realTimeBtn);

let realTimeCounter;
let realTimeTooltip;
let realTimeInterval;
let realTimeShown = false;

function createRealTimeCounter() {
    realTimeCounter = document.createElement('div');
    realTimeCounter.id = 'real-time-counter';
    realTimeCounter.style.position = 'fixed';
    realTimeCounter.style.bottom = '10px';
    realTimeCounter.style.right = '10px';
    realTimeCounter.style.color = '#fff';  // white text
    realTimeCounter.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    realTimeCounter.style.fontWeight = '700';
    realTimeCounter.style.fontSize = '22px';
    realTimeCounter.style.userSelect = 'none';
    realTimeCounter.style.zIndex = '9999';
    realTimeCounter.style.cursor = 'default';

    // Create tooltip div, initially hidden
    realTimeTooltip = document.createElement('div');
    realTimeTooltip.textContent = "Shows you the time so you don't have to exit Fullscreen";
    realTimeTooltip.style.position = 'absolute';
    realTimeTooltip.style.bottom = 'calc(100% + 8px)';
    realTimeTooltip.style.right = '0';
    realTimeTooltip.style.backgroundColor = 'black';
    realTimeTooltip.style.color = 'white';
    realTimeTooltip.style.padding = '6px 10px';
    realTimeTooltip.style.borderRadius = '6px';
    realTimeTooltip.style.fontSize = '12px';
    realTimeTooltip.style.whiteSpace = 'nowrap';
    realTimeTooltip.style.boxShadow = '0 0 6px rgba(0,0,0,0.8)';
    realTimeTooltip.style.opacity = '0';
    realTimeTooltip.style.pointerEvents = 'none';
    realTimeTooltip.style.transition = 'opacity 0.25s ease';

    realTimeCounter.appendChild(realTimeTooltip);

    // Show tooltip on hover
    realTimeCounter.addEventListener('mouseenter', () => {
        realTimeTooltip.style.opacity = '1';
        realTimeTooltip.style.pointerEvents = 'auto';
    });
    realTimeCounter.addEventListener('mouseleave', () => {
        realTimeTooltip.style.opacity = '0';
        realTimeTooltip.style.pointerEvents = 'none';
    });

    document.body.appendChild(realTimeCounter);
}

function updateRealTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 => 12

    realTimeCounter.firstChild.textContent = "Shows you the time so you don't have to exit Fullscreen"; // keep tooltip text intact
    realTimeCounter.childNodes[0].nodeValue = null; // no text node except tooltip

    realTimeCounter.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    realTimeCounter.appendChild(realTimeTooltip);
}

function startRealTimeCounter() {
    if (!realTimeCounter) createRealTimeCounter();
    updateRealTime();
    realTimeInterval = setInterval(updateRealTime, 1000);
}

function stopRealTimeCounter() {
    if (realTimeCounter) {
        realTimeCounter.remove();
        realTimeCounter = null;
    }
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
        realTimeInterval = null;
    }
}

realTimeBtn.addEventListener('click', () => {
    if (realTimeShown) {
        stopRealTimeCounter();
        realTimeBtn.textContent = 'Real Time';
        realTimeShown = false;
    } else {
        startRealTimeCounter();
        realTimeBtn.textContent = 'Hide Real Time';
        realTimeShown = true;
    }
});


   // Add Auto Fullscreen button to menu content
const fullscreenBtn = document.createElement('button');
fullscreenBtn.className = 'nova-menu-btn';
fullscreenBtn.textContent = 'Auto Fullscreen';
menuContent.appendChild(fullscreenBtn);

// Toggle fullscreen on button click
fullscreenBtn.addEventListener('click', () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Error trying to enable fullscreen: ${err.message}`);
        });
        fullscreenBtn.textContent = 'Exit Fullscreen';
    } else {
        document.exitFullscreen();
        fullscreenBtn.textContent = 'Auto Fullscreen';
    }
});


    menuOverlay.appendChild(menuContent);
    document.body.appendChild(menuOverlay);

    // Toggle menu visibility on "\" key press
    window.addEventListener('keydown', e => {
        if (e.key === '\\') {
            e.preventDefault();
            if (menuOverlay.classList.contains('show')) {
                // Close menu
                menuOverlay.classList.remove('show');
                persistentHeader.classList.add('visible');
            } else {
                // Open menu
                menuOverlay.classList.add('show');
                persistentHeader.classList.remove('visible');
            }
        }
    });

    // FPS Counter implementation
    let fpsCounter;
    let fpsInterval, lastFrameTime, frames;
    let isDraggingFPS = false, dragOffsetXFPS = 0, dragOffsetYFPS = 0;

    function createFPSCounter() {
        fpsCounter = document.createElement('div');
        fpsCounter.id = 'fps-counter';
        fpsCounter.className = 'counter';
        fpsCounter.textContent = 'FPS: 0';
        document.body.appendChild(fpsCounter);

        // Dragging logic
        fpsCounter.addEventListener('mousedown', e => {
            isDraggingFPS = true;
            dragOffsetXFPS = e.clientX - fpsCounter.getBoundingClientRect().left;
            dragOffsetYFPS = e.clientY - fpsCounter.getBoundingClientRect().top;
            fpsCounter.classList.add('dragging');
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingFPS) {
                isDraggingFPS = false;
                fpsCounter.classList.remove('dragging');
            }
        });

        window.addEventListener('mousemove', e => {
            if (isDraggingFPS) {
                let newX = e.clientX - dragOffsetXFPS;
                let newY = e.clientY - dragOffsetYFPS;
                // Keep inside viewport
                const padding = 10;
                newX = Math.min(window.innerWidth - fpsCounter.offsetWidth - padding, Math.max(padding, newX));
                newY = Math.min(window.innerHeight - fpsCounter.offsetHeight - padding, Math.max(padding, newY));
                fpsCounter.style.left = newX + 'px';
                fpsCounter.style.top = newY + 'px';
            }
        });
    }

    function startFPSCounter() {
        if (!fpsCounter) createFPSCounter();
        fpsInterval = 1000;
        lastFrameTime = performance.now();
        frames = 0;

        function update() {
            const now = performance.now();
            frames++;
            if (now - lastFrameTime > fpsInterval) {
                const fps = Math.round((frames * 1000) / (now - lastFrameTime));
                fpsCounter.textContent = `FPS: ${fps}`;
                lastFrameTime = now;
                frames = 0;
            }
            if (fpsCounter) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function stopFPSCounter() {
        if (fpsCounter) {
            fpsCounter.remove();
            fpsCounter = null;
        }
    }

    // CPS Counter implementation
    let cpsCounter;
    let cpsClicks = [];
    let isDraggingCPS = false, dragOffsetXCPS = 0, dragOffsetYCPS = 0;
    let cpsIntervalId;

    function createCPSCounter() {
        cpsCounter = document.createElement('div');
        cpsCounter.id = 'cps-counter';
        cpsCounter.className = 'counter';
        cpsCounter.textContent = 'CPS: 0';
        document.body.appendChild(cpsCounter);

        // Dragging logic
        cpsCounter.addEventListener('mousedown', e => {
            isDraggingCPS = true;
            dragOffsetXCPS = e.clientX - cpsCounter.getBoundingClientRect().left;
            dragOffsetYCPS = e.clientY - cpsCounter.getBoundingClientRect().top;
            cpsCounter.classList.add('dragging');
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingCPS) {
                isDraggingCPS = false;
                cpsCounter.classList.remove('dragging');
            }
        });

        window.addEventListener('mousemove', e => {
            if (isDraggingCPS) {
                let newX = e.clientX - dragOffsetXCPS;
                let newY = e.clientY - dragOffsetYCPS;
                // Keep inside viewport
                const padding = 10;
                newX = Math.min(window.innerWidth - cpsCounter.offsetWidth - padding, Math.max(padding, newX));
                newY = Math.min(window.innerHeight - cpsCounter.offsetHeight - padding, Math.max(padding, newY));
                cpsCounter.style.left = newX + 'px';
                cpsCounter.style.top = newY + 'px';
            }
        });

        // Track left mouse clicks timestamps
        window.addEventListener('mousedown', cpsClickListener);
    }

    function cpsClickListener(e) {
        if (e.button === 0) { // Left click only
            cpsClicks.push(performance.now());
            // Remove clicks older than 1 second
            const cutoff = performance.now() - 1000;
            cpsClicks = cpsClicks.filter(ts => ts >= cutoff);
            updateCPSCounter();
        }
    }

    function updateCPSCounter() {
        if (cpsCounter) {
            cpsCounter.textContent = `CPS: ${cpsClicks.length}`;
        }
    }

    function startCPSCounter() {
        if (!cpsCounter) createCPSCounter();
        // Reset clicks array on start to avoid weird spikes
        cpsClicks = [];

        // Update CPS every 100ms for smoothness
        cpsIntervalId = setInterval(() => {
            // Remove old clicks
            const cutoff = performance.now() - 1000;
            cpsClicks = cpsClicks.filter(ts => ts >= cutoff);
            updateCPSCounter();
        }, 100);
    }

    function stopCPSCounter() {
        if (cpsCounter) {
            cpsCounter.remove();
            cpsCounter = null;
        }
        window.removeEventListener('mousedown', cpsClickListener);
        if (cpsIntervalId) clearInterval(cpsIntervalId);
    }

    // Toggle FPS and CPS counters via buttons
    let fpsShown = false;
    let cpsShown = false;

    fpsBtn.addEventListener('click', () => {
        if (fpsShown) {
            stopFPSCounter();
            fpsBtn.textContent = 'FPS Counter';
            fpsShown = false;
        } else {
            startFPSCounter();
            fpsBtn.textContent = 'Hide FPS Counter';
            fpsShown = true;
        }
    });

    cpsBtn.addEventListener('click', () => {
        if (cpsShown) {
            stopCPSCounter();
            cpsBtn.textContent = 'CPS Counter';
            cpsShown = false;
        } else {
            startCPSCounter();
            cpsBtn.textContent = 'Hide CPS Counter';
            cpsShown = true;
        }
    });

})();
