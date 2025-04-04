// Author: Daniel

/* 
 * Model-View-Controller (MVC) Architecture for a To-Do List Application
 * 
 * - Model: Manages the data (to-do list) and handles persistence using localStorage.
 * - View: Handles rendering the UI and user interactions.
 * - Controller: Connects the Model and View, managing the app's logic.
 */

/* Model:
 * The Model is responsible for managing the data (e.g., the to-do list)
   and persisting it (e.g., using localStorage).
   While the Model can store and manipulate the data, 
   it does not handle rendering the data to the user or 
   responding to user interactions.
 */
/* ==========================
 * Model: Data Management
 * ==========================
 */
class Model {
    constructor() {
        /* Loads the to-do list from 
         * "localStorage" or initializes an empty array 
            if no data exists.
         */
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    }

    /* Save todos to localStorage
     * Saves the current state of the todos array to 
     * "localStorage".
     */
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Returns the current list of to-dos.
    getTodos() {
        return this.todos;
    }

    /* Adds a new to-do item to the list with a unique id, 
     * the provided text, and a default completed state of false.
     * Saves the updated list to localStorage.
     */
    addTodo(todoText) {
        const newTodo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            completed: false,
        };
        this.todos.push(newTodo);
        this.saveTodos(); // Save to localStorage
    }

    /* Toggles the completed state of a to-do item by its id.
     *  Saves the updated list to localStorage.
     */ 
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos(); // Save to localStorage
        }
    }

    /* Removes a to-do item by its id.
     * Saves the updated list to localStorage.
     */
    removeTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos(); // Save to localStorage
    }
}

/*
 * View: User Interface
 *
 * The View is responsible for rendering the to-do list in the DOM and
   handling user interactions (e.g., clicking the "Add" button or toggling a to-do item).
   If the View is empty, the app will not display the to-do list or 
   respond to user actions.
 * Selects DOM elements for the to-do list (#myUL), 
 * input field (#myInput), and add button (.addBtn).
 */
 /* ==========================
 * View: User Interface
 * ==========================
 */
class View {
    constructor() {
        // Select DOM elements
        this.todoList = document.querySelector('#myUL');
        this.inputField = document.querySelector('#myInput');
        this.addButton = document.querySelector('.addBtn');
    }

    /* Clears the current list and re-renders all todo items.
     * For each todo, it creates a <li> eliment with the todo text
     * and a data-id attribute for identification.
     * Adds a "close" button (×) to remove the to-do.
     * Adds a checked class if the to-do is completed.
     */ 
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

    /* Attaches an event listener to the "Add" button.
     * Calls the provided handler function with the input text 
     * when the button is clicked.
     */ 
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

    /* Attaches an event listener to the to-do list.
     * Calls the provided handler function with the id of 
     * the clicked to-do when a list item <li> is clicked.
     */
    bindToggleTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.tagName === 'LI') {
                const id = parseInt(event.target.dataset.id, 10);
                handler(id);
            }
        });
    }

    /* Attaches an event listener to the to-do list.
     * Calls the provided handler function with the id of
     * the to-do when the "close" button is clicked.
     */
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
 * Initializes the app with the provided model and view.
 * Renders the initial to-do list by calling view.
   renderTodos model.getTodos().
 * Binds the View's events to the Controller's methods.
 */
/* ==========================
 * Controller: App Logic
 * ==========================
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

    // Adds a new to-do to the Model and re-renders the View.
    handleAddTodo(todoText) {
        this.model.addTodo(todoText);
        this.view.renderTodos(this.model.getTodos());
    }

    // Toggles the completed state of a to-do in the Model and re-renders the View.
    handleToggleTodo(id) {
        this.model.toggleTodo(id);
        this.view.renderTodos(this.model.getTodos());
    }

    // Removes a to-do from the Model and re-renders the View.
    handleRemoveTodo(id) {
        this.model.removeTodo(id);
        this.view.renderTodos(this.model.getTodos());
    }
}

/* the app is initialized by creating instances of the Model, View, and Controller classes:
 * Adding a To-Do:
    The user types a task in the input field and clicks the "Add" button.
    The bindAddTodo method in the View calls handleAddTodo in the Controller.
    The Controller updates the Model by adding the new to-do and then re-renders the View.
    
    Toggling a To-Do:
    The user clicks on a to-do item in the list.
    The bindToggleTodo method in the View calls handleToggleTodo in the Controller.
    The Controller updates the Model by toggling the completed state of the to-do and then re-renders the View.

    Removing a To-Do:
    The user clicks the "close" button next to a to-do item.
    The bindRemoveTodo method in the View calls handleRemoveTodo in the Controller.
    The Controller updates the Model by removing the to-do and then re-renders the View. 
 */
/* ==========================
 * Initialize the App
 * ==========================
 */
const app = new Controller(new Model(), new View());