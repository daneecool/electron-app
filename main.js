const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');

const MacOS = process.platform === 'darwin';  // Check if the platform is MacOS

/* function that create the main window with width and height
 * Looping the render with 
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    // width: isDev ? 1200 : 800,
    height: 600,
  });

  mainWindow.loadFile(path.join(__dirname, './View/index.html'));   // path to directory where index.html is located
}

/* "app.whenReady()" function is called only after Electron is fully initialized
 * ".then()"" function is called after the "app.whenReady()" function is called to create the main window
 * "app.on()" function is specific only to MacOS, it is triggered when the application is activated
 * "BrowserWindow.getAllWindows().length" function is called to check if there are no open windows in the application. On MacOS, it is common or the app to remain active in the dock even when all windows are closed. This ensures that a new window is created when the app is reactivated.
 * "createWindow()" function is called to create the main window
 */
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
});

// Condition if the platform is not MacOS, the app will quit by calling "app.quit()"
app.on('window-all-closed', () => {
    if (!MacOS) {
        app.quit();
    }
});