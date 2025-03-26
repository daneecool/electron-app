const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');

let mainWindow; 

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html')); 
}

app.whenReady().then(() => {
  createWindow();
});