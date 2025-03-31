/* Model:
 * The Model is responsible for managing the data (e.g., the to-do list)
   and persisting it (e.g., using localStorage).
   While the Model can store and manipulate the data, 
   it does not handle rendering the data to the user or 
   responding to user interactions.
 */
class Model {
    constructor() {
        // Load todos from localStorage or initialize an empty array
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    }

    // Save todos to localStorage
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Get all todos
    getTodos() {
        return this.todos;
    }

    // Add a new todo
    addTodo(todoText) {
        const newTodo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            completed: false,
        };
        this.todos.push(newTodo);
        this.saveTodos(); // Save to localStorage
    }

    // Toggle the completed state of a todo
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos(); // Save to localStorage
        }
    }

    // Remove a todo by ID
    removeTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos(); // Save to localStorage
    }
}

/* View:
 * The View is responsible for rendering the to-do list in the DOM and
   handling user interactions (e.g., clicking the "Add" button or toggling a to-do item).
   If the View is empty, the app will not display the to-do list or 
   respond to user actions.
 */
class View {
    constructor() {
        // Select DOM elements
        this.todoList = document.querySelector('#myUL');
        this.inputField = document.querySelector('#myInput');
        this.addButton = document.querySelector('.addBtn');
    }

    // Render the to-do list
    renderTodos(todos) {
        this.todoList.innerHTML = ''; // Clear the list
        todos.forEach(todo => {
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

    // Bind the "Add" button click event
    bindAddTodo(handler) {
        this.addButton.addEventListener('click', () => {
            const todoText = this.inputField.value.trim();
            if (todoText) {
                handler(todoText);
                this.inputField.value = ''; // Clear the input field
            } else {
                alert('You must write something!');
            }
        });
    }

    // Bind the "Toggle" event for list items
    bindToggleTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.tagName === 'LI') {
                const id = parseInt(event.target.dataset.id, 10);
                handler(id);
            }
        });
    }

    // Bind the "Remove" event for close buttons
    bindRemoveTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.className === 'close') {
                const id = parseInt(event.target.parentElement.dataset.id, 10);
                handler(id);
            }
        });
    }
}

/* Controller:
 * The Controller acts as the mediator between the Model and the View. 
   It listens for user actions (via the View), updates the Model, and
   then tells the View to re-render.
   If the Controller is empty, there will be no logic to 
   connect the Model and View, so the app will not function.
 */
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Initial render
        this.view.renderTodos(this.model.getTodos());

        // Bind view events to controller methods
        this.view.bindAddTodo(this.handleAddTodo.bind(this));
        this.view.bindToggleTodo(this.handleToggleTodo.bind(this));
        this.view.bindRemoveTodo(this.handleRemoveTodo.bind(this));
    }

    handleAddTodo(todoText) {
        this.model.addTodo(todoText);
        this.view.renderTodos(this.model.getTodos());
    }

    handleToggleTodo(id) {
        this.model.toggleTodo(id);
        this.view.renderTodos(this.model.getTodos());
    }

    handleRemoveTodo(id) {
        this.model.removeTodo(id);
        this.view.renderTodos(this.model.getTodos());
    }
}

// Initialize the app
const app = new Controller(new Model(), new View());