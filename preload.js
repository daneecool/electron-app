// Author: Daniel


/* console.log('Preload script has finished loading.'); cannot be seen as it is load
 * before the app 
 * To check it go back to main.js find the handler responsible for the action and
 * add the line of console.log(' ') to debug it 
 */
console.log('Preload script has loaded.');

// Working on progress 

/* The preload script runs in the renderer before 
 * any web content loads and safely expose a limited 
 * API (via the contextBridge) to renderer code.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to your renderer that wraps the ipcRenderer.invoke
contextBridge.exposeInMainWorld('api', {
    getTodos: () => ipcRenderer.invoke('getTodos'),
    addTodo: (todoText) => ipcRenderer.invoke('addTodo', todoText),
    toggleTodo: (id) => ipcRenderer.invoke('toggleTodo', id),
    removeTodo: (id) => ipcRenderer.invoke('removeTodo', id)
});

/* console.log('Preload script has finished loading.'); cannot be seen as it is load
 * before the app 
 * To check it go back to main.js find the handler responsible for the action and
 * add the line of console.log(' ') to debug it 
 */
console.log('Preload script has finished loading.');