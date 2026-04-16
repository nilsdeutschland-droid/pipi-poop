// Preload script for secure Electron context with enhanced features
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    setAlwaysOnTop: (onTop) => ipcRenderer.send('set-always-on-top', onTop),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    openExternalLink: (url) => ipcRenderer.send('open-external', url)
});

// Listen for theme changes from main process
ipcRenderer.on('theme-changed', (event, isDark) => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
});
