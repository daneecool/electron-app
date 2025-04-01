const sqlite3 = require('sqlite3').verbose();

// Model: Handles data storage and retrieval using SQLite
class Model {
    constructor() {
        // Initialize SQLite database
        this.db = new sqlite3.Database('./todos.db', (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database.');
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS todos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        text TEXT NOT NULL,
                        completed INTEGER NOT NULL DEFAULT 0
                    )
                `);
            }
        });
    }

    // Get all todos
    getTodos(callback) {
        this.db.all('SELECT * FROM todos', (err, rows) => {
            if (err) {
                console.error('Error fetching todos:', err.message);
                callback([]);
            } else {
                callback(rows);
            }
        });
    }

    // Add a new todo
    addTodo(todoText, callback) {
        this.db.run(
            'INSERT INTO todos (text, completed) VALUES (?, ?)',
            [todoText, 0],
            function (err) {
                if (err) {
                    console.error('Error adding todo:', err.message);
                }
                callback();
            }
        );
    }

    // Toggle the completed state of a todo
    toggleTodo(id, callback) {
        this.db.get('SELECT completed FROM todos WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error toggling todo:', err.message);
                callback();
            } else {
                const newCompletedState = row.completed === 0 ? 1 : 0;
                this.db.run(
                    'UPDATE todos SET completed = ? WHERE id = ?',
                    [newCompletedState, id],
                    (err) => {
                        if (err) {
                            console.error('Error updating todo:', err.message);
                        }
                        callback();
                    }
                );
            }
        });
    }

    // Remove a todo by ID
    removeTodo(id, callback) {
        this.db.run('DELETE FROM todos WHERE id = ?', [id], (err) => {
            if (err) {
                console.error('Error removing todo:', err.message);
            }
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
        this.model.addTodo(todoText, () => {
            this.model.getTodos((todos) => {
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