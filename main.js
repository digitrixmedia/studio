
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    // In development, load the Next.js dev server.
    mainWindow.loadURL('http://localhost:9002');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the static export of the Next.js app.
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'out/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
