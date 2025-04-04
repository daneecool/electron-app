// Author: Daniel

// Import necessary modules from Electron, Node, and sqlite3
const { app, BrowserWindow, ipcMain } = require('electron');  // Electron modules to control the app lifecycle, create windows, and communicate via IPC
const path = require('node:path');                            // Node's path module for handling file paths
const sqlite3 = require('sqlite3');                           // SQLite3 module for working with a SQLite database

// Determine if the platform is macOS since behavior may differ between macOS and other OSes
const MacOS = process.platform === 'darwin';

// Build the database file path
// Currently, the database is stored in the same folder as the main.js file
const dbPath = path.join(__dirname, 'todos.db');   
console.log('DB path:', dbPath);  // Log the database path to the console for debugging

// Build the preload script path using __dirname and path.join
const preloadPath = path.join(__dirname, 'preload.js');
console.log('preload:', preloadPath);  // Log the database path to the console for debugging

// Open (or create) the SQLite database located at dbPath
const db = new sqlite3.Database(dbPath, err => {
    if (err) {  // If there is an error opening/creating the database, log the error message
        console.error('Error opening database:', err.message);
    } else {
        // Database opened successfully; log the connection
        console.log('Connected to SQLite database at', dbPath);
        // Run SQL statement to create "todos" table if it doesn't already exist
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
  // Create a new BrowserWindow instance with specified options
const win = new BrowserWindow({
  width: 800,    // Set the window width to 800 pixels
  height: 600,   // Set the window height to 600 pixels
    webPreferences: {
    nodeIntegration: true,   // Enable Node integration in the renderer process
      contextIsolation: false  // Disable context isolation so that the renderer can access Node APIs
    }
});

  // Load the index.html file into the window
  win.loadFile(path.join(__dirname, './index.html'));   // Provide the path to the index.html file

  // Open the DevTools for debugging (optional)
  win.webContents.openDevTools();  // Open Developer Tools for the window
}

/*
 * "app.whenReady()" function is called only after Electron is fully initialized
 * ".then()"" function is called after the "app.whenReady()" function is called to create the main window
 * "app.on()" function is specific only to MacOS, it is triggered when the application is activated
 * "BrowserWindow.getAllWindows().length" function is called to check if there are no open windows in the application. On MacOS, it is common or the app to remain active in the dock even when all windows are closed. This ensures that a new window is created when the app is reactivated.
 * "createWindow()" function is called to create the main window
 */
app.whenReady().then(() => {
  createWindow();  // Create the main window when the app is ready

  // On macOS, re-create the window when the dock icon is clicked and there are no open windows
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {  // Check if there are no open windows
      createWindow();  // Create a new window if none are open
    }
});
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (!MacOS) { // If the platform is not macOS, quit the app
        app.quit();
    }
});

// IPC Handlers for SQLite operations
ipcMain.handle('getTodos', () => {
    console.log('Preload for getTodos status - O.K') // this is to check preload script is executed or not
    return new Promise((resolve, reject) => {
         // Run a SQL query to select all records from the todos table
         db.all('SELECT * FROM todos', (err, rows) => {
              err ? reject(err) : resolve(rows);  // If there is an error, reject the promise; otherwise, resolve it with the rows
        });
    });
});

// Insert a new todo using the provided text
ipcMain.handle('addTodo', (event, todoText) => {
    console.log('Preload for addTodo status - O.K')
    return new Promise((resolve, reject) => {
         // Run a SQL INSERT statement; set completed as 0 (false) by default
        db.run('INSERT INTO todos (text, completed) VALUES (?, ?)', [todoText, 0], function(err) {
              err ? reject(err) : resolve({ id: this.lastID });  // Return the new todo's id upon success
        });
    });
});

// Toggle the completion state of a todo (switch between 0 and 1)
ipcMain.handle('toggleTodo', (event, id) => {
    console.log('Preload for toggleTodo status - O.K')
    return new Promise((resolve, reject) => {
        // Retrieve the current completed state of the todo with the given id
        db.get('SELECT completed FROM todos WHERE id = ?', [id], (err, row) => {
            if (err) {
                 return reject(err);  // Reject promise if error occurs reading row
            }
             // Calculate the new completed state (flip 0 to 1 or 1 to 0)
            const newCompletedState = row.completed === 0 ? 1 : 0;
             // Update the todo's completed state in the database
            db.run('UPDATE todos SET completed = ? WHERE id = ?', [newCompletedState, id], err => {
                    err ? reject(err) : resolve();  // Resolve promise if update succeeds, otherwise reject
            });
        });
    });
});

// Remove a todo from the database by id
ipcMain.handle('removeTodo', (event, id) => {
    console.log('Preload for removeTodo status - O.K')
    return new Promise((resolve, reject) => {
         // Run a SQL DELETE statement to remove the todo with the specified id
        db.run('DELETE FROM todos WHERE id = ?', [id], err => {
             err ? reject(err) : resolve();  // Resolve promise if delete is successful, otherwise reject
        });
    });
});