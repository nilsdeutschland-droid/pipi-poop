// ============================================================================
// PI NEXUS TITAN v9.0 | OMNI-BEAST COMMAND CENTER | SINGULARITY ARCHITECTURE
// WITH COMPLETE POLISH: Keyboard Shortcuts, Persistence, Audio, Animations, 
// Advanced Indicators, Toast Notifications, Performance Metrics & More
// ============================================================================

// ============ PERFORMANCE METRICS ============
let perfMetrics = {
    frameCount: 0,
    fps: 60,
    lastTime: Date.now(),
    updateCount: 0
};

// ============ AUDIO CONTEXT (Web Audio API) ============
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioSynthesizer = {
    chirp: () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
    },
    alert: () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
    },
    ding: () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(1600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
    }
};

// ============ GLOBAL STATE ============
let marketState = {
    price: 0.1666,
    priceHistory: [0.08, 0.12, 0.25, 0.52, 0.31, 0.19, 0.1666],
    priceChange24h: 2.4,
    priceChange1h: 4.2,
    uvIndex: 8.4,
    currentHistoryPeriod: '24h',
    chartPaused: false,
    lastSignalChange: '',
    volatility: 0.0
};

// UI State
let uiState = {
    alwaysOnTop: false,
    perfMonitorActive: false,
    soundEnabled: true
};

// Hardcoded Protocol Context (April 15, 2026)
const protocolContext = {
    protocolVersion: '22.1',
    nextProtocol: '23',
    migratedSupply: 18.2e6,
    circulatingSupply: 26.8e6,
    lockedMining: 42.1e6,
    totalNodes: 421437,
    activeMigrationBatch: 16.2e6,
    targetQ42026: 0.4480
};

// Multi-currency exchange rates
const exchangeRates = {
    USD: 1.0,
    EUR: 0.924,
    GBP: 0.788,
    JPY: 150.85
};

// Node latency ranges
const nodeLatency = {
    'kr': { min: 40, max: 50, emoji: '🇰🇷' },
    'vn': { min: 55, max: 70, emoji: '🇻🇳' },
    'us': { min: 80, max: 95, emoji: '🇺🇸' },
    'ng': { min: 145, max: 165, emoji: '🇳🇬' }
};

// ============ TOAST NOTIFICATION SYSTEM ============
class Toast {
    constructor(message, type = 'info', duration = 3000) {
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.element = null;
        this.create();
    }
    
    create() {
        this.element = document.createElement('div');
        this.element.className = `toast ${this.type}`;
        this.element.textContent = this.message;
        document.getElementById('toast-container').appendChild(this.element);
        
        if (this.duration > 0) {
            setTimeout(() => this.remove(), this.duration);
        }
    }
    
    remove() {
        if (this.element) {
            this.element.style.animation = 'slideOutToast 0.3s ease-out forwards';
            setTimeout(() => this.element.remove(), 300);
        }
    }
}

function showToast(message, type = 'info') {
    new Toast(message, type);
}

// ============ NUMBER COUNTER ANIMATION ============
function animateCounter(element, startValue, endValue, duration = 400) {
    const startTime = Date.now();
    const startNum = parseFloat(startValue) || 0;
    const endNum = parseFloat(endValue) || 0;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startNum + (endNum - startNum) * easeOut;
        
        if (typeof element.innerText !== 'undefined') {
            element.innerText = currentValue.toFixed(2);
        } else {
            element.textContent = currentValue.toFixed(2);
        }
        
        element.classList.add('counter-display');
        setTimeout(() => element.classList.remove('counter-display'), 400);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// ============ DATA PERSISTENCE ============
function saveToLocalStorage() {
    const data = {
        migrated: document.getElementById('migrated').value,
        transferable: document.getElementById('transferable').value,
        unverified: document.getElementById('unverified').value,
        fullPotential: document.getElementById('full-potential').value,
        timestamp: Date.now()
    };
    localStorage.setItem('nexusTitanWealthData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('nexusTitanWealthData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            document.getElementById('migrated').value = data.migrated;
            document.getElementById('transferable').value = data.transferable;
            document.getElementById('unverified').value = data.unverified;
            document.getElementById('full-potential').value = data.fullPotential;
            showToast('Wealth data restored from storage', 'success');
            updateWealthTerminal();
        } catch (e) {
            console.error('Failed to load storage:', e);
        }
    }
}

// Auto-save every 5 seconds
setInterval(saveToLocalStorage, 5000);

// ============ CHART INITIALIZATION ============
const liveCtx = document.getElementById('liveChart').getContext('2d');
const histCtx = document.getElementById('historyChart').getContext('2d');

// THE NEXUS WAVE - Perpetual Streaming Chart
const liveChart = new Chart(liveCtx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Wealth Pulse',
            borderColor: '#a855f7',
            borderWidth: 2.5,
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#a855f7',
            pointBorderWidth: 2,
            tension: 0.38,
            data: []
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        interaction: { intersect: false, mode: 'index' },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#a855f7',
                borderWidth: 1,
                titleColor: '#cbd5e1',
                bodyColor: '#10b981',
                padding: 8,
                font: { family: 'Monaco', size: 11 }
            }
        },
        scales: {
            x: {
                type: 'realtime',
                realtime: {
                    delay: 800,
                    duration: 60000,
                    refresh: 500,
                    onRefresh: null
                },
                grid: { color: 'rgba(255, 255, 255, 0.02)', drawBorder: false },
                ticks: { display: false }
            },
            y: {
                position: 'right',
                beginAtZero: false,
                grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
                ticks: {
                    color: '#cbd5e1',
                    font: { family: 'Monaco, monospace', size: 11, weight: '600' },
                    padding: 8,
                    maxTicksLimit: 5
                }
            }
        }
    }
});

// OMNI-HISTORY CURVE with hover interaction
let historyChart = new Chart(histCtx, {
    type: 'line',
    data: {
        labels: ['6M', '5M', '4M', '3M', '2M', '1M', 'Now'],
        datasets: [{
            data: [0.08, 0.12, 0.25, 0.52, 0.31, 0.19, 0.1666],
            borderColor: '#6b21a8',
            borderWidth: 1.5,
            fill: true,
            backgroundColor: 'rgba(107, 33, 168, 0.12)',
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#a855f7',
            pointBorderColor: '#6b21a8',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#10b981'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#a855f7',
                borderWidth: 1,
                titleColor: '#cbd5e1',
                bodyColor: '#10b981',
                font: { family: 'Monaco', size: 10 }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } },
            y: { display: false }
        }
    }
});

// ============ ADVANCED INDICATORS ============
function calculateBollingerBands(data, period = 20) {
    if (data.length < period) return null;
    const lastData = data.slice(-period);
    const mean = lastData.reduce((a, b) => a + b) / period;
    const variance = lastData.reduce((a, b) => a + Math.pow(b - mean, 2)) / period;
    const stdDev = Math.sqrt(variance);
    return {
        upper: mean + (2 * stdDev),
        middle: mean,
        lower: mean - (2 * stdDev)
    };
}

function calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    const mean = returns.reduce((a, b) => a + b) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2)) / returns.length;
    return Math.sqrt(variance) * 100;
}

// ============ UTILITY FUNCTIONS ============

function updateRealWorth() {
    const migrated = parseFloat(document.getElementById('migrated').value) || 0;
    const realWorth = (migrated * marketState.price).toFixed(2);
    document.getElementById('real-worth').innerText = `$${realWorth}`;
    
    document.getElementById('conv-usd').innerText = `$${realWorth}`;
    document.getElementById('conv-eur').innerText = `€${(realWorth * exchangeRates.EUR).toFixed(2)}`;
    document.getElementById('conv-gbp').innerText = `£${(realWorth * exchangeRates.GBP).toFixed(2)}`;
    document.getElementById('conv-jpy').innerText = `¥${(realWorth * exchangeRates.JPY).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
}

function updateAISignal() {
    const signal = document.getElementById('ai-signal');
    const signalText = document.getElementById('signal-text');
    let newSignal = '';
    
    if (marketState.uvIndex > 8.0) {
        signal.className = 'w-3 h-3 rounded-full signal-green animate-pulse';
        signalText.innerText = 'BULLISH';
        signalText.className = 'text-[9px] font-bold text-green-400';
        newSignal = 'BULLISH';
    } else if (marketState.uvIndex > 5.0) {
        signal.className = 'w-3 h-3 rounded-full signal-yellow animate-pulse';
        signalText.innerText = 'NEUTRAL';
        signalText.className = 'text-[9px] font-bold text-yellow-400';
        newSignal = 'NEUTRAL';
    } else {
        signal.className = 'w-3 h-3 rounded-full signal-red animate-pulse';
        signalText.innerText = 'BEARISH';
        signalText.className = 'text-[9px] font-bold text-red-400';
        newSignal = 'BEARISH';
    }
    
    if (newSignal !== marketState.lastSignalChange) {
        marketState.lastSignalChange = newSignal;
        if (uiState.soundEnabled) audioSynthesizer.chirp();
        showToast(`Signal changed to ${newSignal}`, 'warning');
    }
}

function updateLatencies() {
    Object.keys(nodeLatency).forEach(key => {
        const range = nodeLatency[key];
        const latency = Math.floor(Math.random() * (range.max - range.min) + range.min);
        document.getElementById(`latency-${key}`).innerText = `${latency}ms`;
    });
}

function updateTimestamp() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    document.getElementById('timestamp').innerText = timeStr;
}

function updatePriceTicker() {
    const volatility = 0.0008;
    const trend = Math.random() > 0.5 ? 1 : -1;
    marketState.price = Math.max(0.1500, Math.min(0.1800, 
        marketState.price + (trend * Math.random() * volatility)
    ));
    
    document.getElementById('live-price').innerText = `$${marketState.price.toFixed(4)}`;
    
    marketState.priceChange1h = (Math.random() - 0.3) * 8;
    const change1hEl = document.getElementById('1h-change');
    change1hEl.innerText = `${marketState.priceChange1h > 0 ? '+' : ''}${marketState.priceChange1h.toFixed(1)}%`;
    change1hEl.className = marketState.priceChange1h > 0 
        ? 'text-sm font-bold text-emerald-accent' 
        : 'text-sm font-bold text-red-400';
    
    if (Math.abs(marketState.priceChange1h) > 5) {
        if (uiState.soundEnabled) audioSynthesizer.ding();
        showToast(`🎯 Price milestone: ${marketState.priceChange1h > 0 ? '+' : ''}${marketState.priceChange1h.toFixed(1)}%`, 'success');
    }
}

function updateUVIndex() {
    const prevUV = marketState.uvIndex;
    const uvShift = (Math.random() - 0.4) * 0.4;
    marketState.uvIndex = Math.max(4.0, Math.min(12.0, prevUV + uvShift));
    
    document.getElementById('uv-index').innerText = marketState.uvIndex.toFixed(1) + '%';
    const barWidth = (marketState.uvIndex / 12.0) * 100;
    const progressBar = document.querySelector('#uv-index').parentElement.querySelector('.bg-purple-500');
    if (progressBar) progressBar.style.width = barWidth + '%';
    
    updateAISignal();
}

function updateWealthTerminal() {
    const migrated = parseFloat(document.getElementById('migrated').value) || 0;
    updateRealWorth();
}

function pushStreamingData() {
    if (marketState.chartPaused) return;
    
    const migrated = parseFloat(document.getElementById('migrated').value) || 1250;
    const currentWealthValue = migrated * marketState.price;
    
    liveChart.data.datasets[0].data.push({
        x: Date.now(),
        y: currentWealthValue.toFixed(2)
    });
    
    if (liveChart.data.datasets[0].data.length > 300) {
        liveChart.data.datasets[0].data.shift();
    }
    
    liveChart.update('none');
}

function initializeStreamingData() {
    const migrated = parseFloat(document.getElementById('migrated').value) || 1250;
    const now = Date.now();
    
    // Seed chart with 20 initial data points (5 seconds worth at 250ms intervals)
    for (let i = 0; i < 20; i++) {
        const wealthValue = migrated * (marketState.price + (Math.random() - 0.5) * 0.0002);
        liveChart.data.datasets[0].data.push({
            x: now - (20 - i) * 250,
            y: wealthValue.toFixed(2)
        });
    }
    liveChart.update('none');
}

window.setHistoryPeriod = function(period) {
    let data, labels;
    
    switch(period) {
        case '24h':
            data = [0.1620, 0.1645, 0.1658, 0.1671, 0.1655, 0.1640, 0.1666];
            labels = ['18:00', '12:00', '06:00', '00:00', '-6h', '-12h', 'Now'];
            break;
        case '12m':
            data = [0.0180, 0.0225, 0.0320, 0.0850, 0.0650, 0.1200, 0.1666];
            labels = ['Apr-25', 'Feb-26', 'Jan-26', 'Dec-25', 'Oct-25', 'Aug-25', 'Now'];
            break;
        case 'all':
            data = [0.0050, 0.0080, 0.0150, 0.0420, 0.0950, 0.1420, 0.1666];
            labels = ['2022', 'Early23', 'Mid23', '2024', 'Q1-25', 'Q3-25', 'Now'];
            break;
        default:
            return;
    }
    
    historyChart.data.labels = labels;
    historyChart.data.datasets[0].data = data;
    historyChart.update();
    marketState.currentHistoryPeriod = period;
    showToast(`Switched to ${period} history`, 'info');
};

// Input listeners
document.getElementById('migrated').addEventListener('input', updateWealthTerminal);
document.getElementById('transferable').addEventListener('input', updateWealthTerminal);
document.getElementById('unverified').addEventListener('input', updateWealthTerminal);
document.getElementById('full-potential').addEventListener('input', updateWealthTerminal);

// ============ CSV EXPORT ============
function exportToCSV() {
    const now = new Date();
    const timestamp = now.toISOString();
    
    const data = [
        ['Pi Nexus Titan v9.0 | Wealth Telemetry Export'],
        ['Exported: ' + timestamp],
        [],
        ['Metric', 'Value'],
        ['Live Price', marketState.price.toFixed(4) + ' USD'],
        ['Migrated PI', document.getElementById('migrated').value],
        ['Real-Worth', (parseFloat(document.getElementById('migrated').value) * marketState.price).toFixed(2)],
        ['UV Index', marketState.uvIndex.toFixed(1) + '%'],
        ['Price Change (1h)', marketState.priceChange1h.toFixed(2) + '%'],
        ['Target (Q4 2026)', '$0.4480'],
        []
    ];
    
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-titan-telemetry-${now.toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('CSV exported successfully', 'success');
}

// ============ SCREENSHOT ============
function takeScreenshot() {
    if (typeof html2canvas !== 'undefined') {
        html2canvas(document.body).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL();
            link.download = `nexus-titan-${Date.now()}.png`;
            link.click();
            showToast('Screenshot saved', 'success');
        });
    } else {
        showToast('Screenshot requires html2canvas library', 'warning');
    }
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    // Ctrl+C: Copy real-worth
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        const worth = document.getElementById('real-worth').innerText;
        navigator.clipboard.writeText(worth);
        showToast(`Copied: ${worth}`, 'success');
    }
    
    // 1/2/3: History periods
    if (!e.ctrlKey && !e.shiftKey) {
        if (e.key === '1') { e.preventDefault(); setHistoryPeriod('24h'); }
        if (e.key === '2') { e.preventDefault(); setHistoryPeriod('12m'); }
        if (e.key === '3') { e.preventDefault(); setHistoryPeriod('all'); }
    }
    
    // Space: Pause/resume chart
    if (e.code === 'Space') {
        e.preventDefault();
        marketState.chartPaused = !marketState.chartPaused;
        showToast(`Chart ${marketState.chartPaused ? 'paused' : 'resumed'}`, 'info');
    }
    
    // Ctrl+E: Export CSV
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportToCSV();
    }
    
    // Ctrl+S: Screenshot
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        takeScreenshot();
    }
    
    // Ctrl+T: Always on top
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        uiState.alwaysOnTop = !uiState.alwaysOnTop;
        document.getElementById('always-top-btn').style.opacity = uiState.alwaysOnTop ? '1' : '0.5';
        showToast(`Always-on-top ${uiState.alwaysOnTop ? 'enabled' : 'disabled'}`, 'info');
        // Electron IPC call would go here
        if (window.electronAPI) {
            window.electronAPI.setAlwaysOnTop(uiState.alwaysOnTop);
        }
    }
    
    // F: Performance monitor
    if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        uiState.perfMonitorActive = !uiState.perfMonitorActive;
        document.getElementById('perf-monitor').classList.toggle('active');
        showToast(`Performance monitor ${uiState.perfMonitorActive ? 'on' : 'off'}`, 'info');
    }
    
    // H or ?: Help
    if ((e.key === 'h' || e.key === 'H' || e.key === '?') && !e.ctrlKey) {
        e.preventDefault();
        toggleKeyboardHelp();
    }
    
    // Esc: Close help
    if (e.key === 'Escape') {
        document.getElementById('kb-help').classList.remove('visible');
        document.getElementById('kb-overlay').classList.remove('visible');
    }
});

// ============ KEYBOARD HELP MODAL ============
function toggleKeyboardHelp() {
    const help = document.getElementById('kb-help');
    const overlay = document.getElementById('kb-overlay');
    help.classList.toggle('visible');
    overlay.classList.toggle('visible');
}

document.getElementById('help-btn').addEventListener('click', toggleKeyboardHelp);
document.getElementById('kb-overlay').addEventListener('click', toggleKeyboardHelp);

// ============ ACTION BUTTONS ============
document.getElementById('export-btn').addEventListener('click', exportToCSV);
document.getElementById('screenshot-btn').addEventListener('click', takeScreenshot);
document.getElementById('always-top-btn').addEventListener('click', () => {
    uiState.alwaysOnTop = !uiState.alwaysOnTop;
    document.getElementById('always-top-btn').style.opacity = uiState.alwaysOnTop ? '1' : '0.5';
    showToast(`Always-on-top ${uiState.alwaysOnTop ? 'enabled' : 'disabled'}`, 'info');
});
document.getElementById('perf-btn').addEventListener('click', () => {
    uiState.perfMonitorActive = !uiState.perfMonitorActive;
    document.getElementById('perf-monitor').classList.toggle('active');
});

// ============ PERFORMANCE METRICS ============
function updatePerformanceMetrics() {
    const now = Date.now();
    const delta = (now - perfMetrics.lastTime) / 1000;
    
    if (delta >= 1) {
        perfMetrics.fps = Math.round(perfMetrics.frameCount / delta);
        perfMetrics.frameCount = 0;
        perfMetrics.lastTime = now;
        
        document.getElementById('fps-display').innerText = perfMetrics.fps;
        document.getElementById('update-count').innerText = perfMetrics.updateCount;
        perfMetrics.updateCount = 0;
    }
    
    perfMetrics.frameCount++;
    if (uiState.perfMonitorActive) {
        requestAnimationFrame(updatePerformanceMetrics);
    }
}

// ============ TOOLTIPS ============
function addTooltip(element, text) {
    element.addEventListener('mouseenter', function(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        
        element._tooltip = tooltip;
    });
    
    element.addEventListener('mouseleave', function() {
        if (element._tooltip) {
            element._tooltip.remove();
            delete element._tooltip;
        }
    });
}

// ============ MAIN TELEMETRY LOOP ============
function mainLoop() {
    updatePriceTicker();
    updateWealthTerminal();
    updateUVIndex();
    updateLatencies();
    updateTimestamp();
    pushStreamingData();
    perfMetrics.updateCount++;
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateRealWorth();
    updateAISignal();
    updateLatencies();
    updateTimestamp();
    
    // Initialize streaming chart with seed data
    initializeStreamingData();
    
    // Add tooltips
    addTooltip(document.getElementById('real-worth').parentElement, 'Real-worth = Migrated PI × Current Price');
    addTooltip(document.getElementById('uv-index').parentElement, 'Utility Velocity: Measures network adoption rate');
    
    // Main loop
    setInterval(mainLoop, 1000);
    setInterval(pushStreamingData, 250);
    
    // Performance metrics
    if (uiState.perfMonitorActive) {
        requestAnimationFrame(updatePerformanceMetrics);
    }
    
    // ============================================ Pi Invitation Link Generator ============================================
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const toggleQrBtn = document.getElementById('toggle-qr-btn');
    const qrCodeSection = document.getElementById('qr-code-section');
    const invitationLink = 'https://minepi.com/NilPhi';

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(invitationLink);
                showToast('Link copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy link.', 'error');
            }
        });
    }

    if (toggleQrBtn) {
        toggleQrBtn.addEventListener('click', () => {
            if (qrCodeSection) {
                qrCodeSection.classList.toggle('hidden');
                if (qrCodeSection.classList.contains('hidden')) {
                    toggleQrBtn.textContent = 'Show QR';
                } else {
                    toggleQrBtn.textContent = 'Hide QR';
                }
            }
        });
    }

    showToast('Nexus Titan v9.0 initialized | Press H for help', 'success');
});

window.addEventListener('resize', () => {
    liveChart.resize();
    historyChart.resize();
});
