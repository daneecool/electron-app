const { ipcRenderer } = require('electron');

// Model: Uses IPC to communicate with main process
class Model {
    getTodos(callback) {
         ipcRenderer.invoke('getTodos').then(todos => {
              callback(todos);
         });
    }
    addTodo(todoText, callback) {
         ipcRenderer.invoke('addTodo', todoText).then(() => {
              callback();
         });
    }
    toggleTodo(id, callback) {
         ipcRenderer.invoke('toggleTodo', id).then(() => {
              callback();
         });
    }
    removeTodo(id, callback) {
         ipcRenderer.invoke('removeTodo', id).then(() => {
              callback();
         });
    }
}

// View: Handles rendering and user interaction
class View {
    constructor() {
        this.todoList = document.querySelector('#myUL');
        this.inputField = document.querySelector('#myInput');
        this.addButton = document.querySelector('.addBtn');
    }

    renderTodos(todos) {
        this.todoList.innerHTML = '';
        todos.forEach((todo) => {
            const li = document.createElement('li');
            li.textContent = todo.text;
            li.dataset.id = todo.id;

            if (todo.completed) {
                li.classList.add('checked');
            }

            const span = document.createElement('SPAN');
            span.textContent = '\u00D7'; // Close button
            span.className = 'close';
            li.appendChild(span);

            this.todoList.appendChild(li);
        });
    }

    bindAddTodo(handler) {
        this.addButton.addEventListener('click', () => {
            const todoText = this.inputField.value.trim();
            if (todoText) {
                handler(todoText);
                this.inputField.value = '';
            } else {
                alert('You must write something!');
            }
        });
    }

    bindToggleTodo(handler) {
        this.todoList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                const id = parseInt(event.target.dataset.id, 10);
                handler(id);
            }
        });
    }

    bindRemoveTodo(handler) {
        this.todoList.addEventListener('click', (event) => {
            if (event.target.className === 'close') {
                const id = parseInt(event.target.parentElement.dataset.id, 10);
                handler(id);
            }
        });
    }
}

// Controller: Connects the Model and View
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Initial render
        this.model.getTodos((todos) => {
            this.view.renderTodos(todos);
        });

        // Bind view events to controller methods
        this.view.bindAddTodo(this.handleAddTodo.bind(this));
        this.view.bindToggleTodo(this.handleToggleTodo.bind(this));
        this.view.bindRemoveTodo(this.handleRemoveTodo.bind(this));
    }

    handleAddTodo(todoText) {
        console.log('Handling add todo:', todoText); // Debugging log
        this.model.addTodo(todoText, () => {
            this.model.getTodos((todos) => {
                console.log('Todos after adding:', todos); // Debugging log
                this.view.renderTodos(todos);
            });
        });
    }

    handleToggleTodo(id) {
        this.model.toggleTodo(id, () => {
            this.model.getTodos((todos) => {
                this.view.renderTodos(todos);
            });
        });
    }

    handleRemoveTodo(id) {
        this.model.removeTodo(id, () => {
            this.model.getTodos((todos) => {
                this.view.renderTodos(todos);
            });
        });
    }
}

// Initialize the app
const app = new Controller(new Model(), new View());