const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const si = require('systeminformation');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity in this demo, though not recommended for production
        },
        title: "Distro Couple",
        autoHideMenuBar: true,
    });

    // In development, load from Vite dev server
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000');
    } else {
        win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handler for OS detection
ipcMain.handle('detect-os', async () => {
    const osInfo = await si.osInfo();
    return {
        platform: os.platform(),
        distro: osInfo.distro,
        release: osInfo.release,
        codename: osInfo.codename,
    };
});
