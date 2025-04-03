const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const sqlite3 = require('sqlite3');

const MacOS = process.platform === 'darwin';  // Check if the platform is MacOS, darwin  a linux base 

// Use __dirname to build an absolute path to todos.db
const dbPath = path.join(__dirname, 'todos.db');
console.log('DB path:', dbPath);
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at', dbPath);
        db.run(`CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        )`);
    }
});

/* 
 * function that create the main window with width and height
 * Looping the render with 
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, './index.html'));   // path to directory where index.html is located
}

/*
 * "app.whenReady()" function is called only after Electron is fully initialized
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

// IPC Handlers for SQLite operations
ipcMain.handle('getTodos', () => {
    return new Promise((resolve, reject) => {
         db.all('SELECT * FROM todos', (err, rows) => {
              err ? reject(err) : resolve(rows);
         });
    });
});

ipcMain.handle('addTodo', (event, todoText) => {
    return new Promise((resolve, reject) => {
         db.run('INSERT INTO todos (text, completed) VALUES (?, ?)', [todoText, 0], function(err) {
              err ? reject(err) : resolve({ id: this.lastID });
         });
    });
});

ipcMain.handle('toggleTodo', (event, id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT completed FROM todos WHERE id = ?', [id], (err, row) => {
             if (err) {
                 return reject(err);
             }
             const newCompletedState = row.completed === 0 ? 1 : 0;
             db.run('UPDATE todos SET completed = ? WHERE id = ?', [newCompletedState, id], err => {
                    err ? reject(err) : resolve();
             });
        });
    });
});

ipcMain.handle('removeTodo', (event, id) => {
     return new Promise((resolve, reject) => {
         db.run('DELETE FROM todos WHERE id = ?', [id], err => {
             err ? reject(err) : resolve();
         });
     });
});