const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = !app.isPackaged;

function createWindow() {
  // Let's dynamically find the best icon path that exists
  let iconPath = path.join(__dirname, '../dist/icon.png');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '../public/icon.png');
  }
  // If neither exists, fallback to build directory or undefined
  if (!fs.existsSync(iconPath)) {
    const fallbackIco = path.join(__dirname, '../build/icon.ico');
    if (fs.existsSync(fallbackIco)) {
      iconPath = fallbackIco;
    }
  }

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
