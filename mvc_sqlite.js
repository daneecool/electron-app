// Author: Daniel

/* Introduction of MVC pattern
 *
 * Model-View-Controller (MVC) Architecture for a To-Do List Application
 * 
 * - Model: Manages the data (to-do list) and handles persistence using localStorage.
 * - View: Handles rendering the UI and user interactions.
 * - Controller: Connects the Model and View, managing the app's logic.
 */

/* Key take aways:
 * 
 * Further explanation of using 3 difference paterns of "Renderer to main (one-way)", 
 * "Renderer to main (two-way)" and "Main to renderer" can be very varies.
 * 
 * Renderer to main (one-way):
 * To fire a one-way IPC message from a renderer process to the main process, 
 * use the "ipcRenderer.send" API to send a message that is then received by the "ipcMain.on" API.
 * 
 * Renderer to main (two-way): (Being used in this example)
 * A common application for two-way IPC is calling a main process module from the renderer process code 
 * and waiting for a result. This can be done by using "ipcRenderer.invoke" paired with "ipcMain.handle".
 * 
 * Main to renderer (reverse only):
 * When sending a message from the main process to a renderer process, it is necessary to specify which 
 * renderer is receiving the message. Messages need to be sent to a renderer process via 
 * its WebContents instance. This WebContents instance contains a send method that 
 * can be used in the same way as ipcRenderer.send.
 */

const { ipcRenderer } = require('electron'); // Import the ipcRenderer module from Electron to allow IPC calls between renderer and main processes

// Model: Uses IPC to communicate with main process
/* The Model is responsible for managing the data (e.g., the to-do list)
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
    // Method to retrieve todos from the database via IPC
    getTodos(callback) {
        ipcRenderer.invoke('getTodos').then(todos => { // Invoke the 'getTodos' IPC channel and wait for the todos returned from main process
            callback(todos); // Pass the retrieved todos to the provided callback function
        });
    }
    // Method to add a new todo item using IPC
    addTodo(todoText, callback) {
        ipcRenderer.invoke('addTodo', todoText).then(() => { // Invoke the 'addTodo' IPC channel sending the todo text
            callback(); // Call the callback function after the todo has been added
        });
    }
    // Method to toggle the completed state of a todo using its id
    toggleTodo(id, callback) {
        ipcRenderer.invoke('toggleTodo', id).then(() => { // Invoke the 'toggleTodo' IPC channel sending the todo id
            callback(); // Execute the callback function once the toggle operation is complete
        });
    }
    // Method to remove a todo using its id
    removeTodo(id, callback) {
        ipcRenderer.invoke('removeTodo', id).then(() => { // Invoke the 'removeTodo' IPC channel sending the todo id
            callback(); // Call the callback function after the todo has been removed
        });
    }
}

// View: Handles rendering and user interaction
/* The View is responsible for rendering the to-do list in the DOM and
    handling user interactions (e.g., clicking the "Add" button or toggling a to-do item).
    If the View is empty, the app will not display the to-do list or 
    respond to user actions.
    Selects DOM elements for the to-do list (#myUL), 
    input field (#myInput), and add button (.addBtn).
 */
/* ==========================
 * View: User Interface
 * ==========================
 */
class View {
    constructor() {
        this.todoList = document.querySelector('#myUL'); // Reference the DOM element where todos are listed (ul with id "myUL")
        this.inputField = document.querySelector('#myInput'); // Reference the input field for new todo items (input with id "myInput")
        this.addButton = document.querySelector('.addBtn'); // Reference the add button (element with class "addBtn")
    }

    // Method to render todo items onto the page
    renderTodos(todos) {
        this.todoList.innerHTML = ''; // Clear the existing list to avoid duplicate entries
        todos.forEach((todo) => { // Loop through each todo item in the array
            const li = document.createElement('li'); // Create a new list item (li) element for the todo
            li.textContent = todo.text; // Set the text of the list item to the todo's text
            li.dataset.id = todo.id; // Store the todo's id in a data attribute for future reference

            if (todo.completed) { // Check if the todo is marked as completed
                li.classList.add('checked'); // If completed, add the 'checked' class to change its appearance
            }

            const span = document.createElement('SPAN'); // Create a span element to serve as the close (delete) button
            span.textContent = '\u00D7'; // Set its text to the multiplication symbol (×) as a visual cue for deletion
            span.className = 'close'; // Assign the 'close' class to the span for styling
            li.appendChild(span); // Append the close button span to the list item

            this.todoList.appendChild(li); // Append the fully constructed list item to the todo list (ul)
        });
    }

    // Bind the event for adding a todo item
    bindAddTodo(handler) {
        this.addButton.addEventListener('click', () => { // Add a click event listener to the add button
            const todoText = this.inputField.value.trim(); // Retrieve and trim the input field value to remove extra spaces
            if (todoText) { // Check that the trimmed input is not empty
                handler(todoText); // Call the provided handler function passing the todo text
                this.inputField.value = ''; // Clear the input field after adding the todo
            } else {
                alert('You must write something!'); // Show an alert if the input is empty
            }
        });
    }

    // Bind the event for toggling the completed state of a todo
    bindToggleTodo(handler) {
        this.todoList.addEventListener('click', (event) => { // Add an event listener to the todo list for detecting clicks
            if (event.target.tagName === 'LI') { // Check if the clicked element is a list item (li)
                const id = parseInt(event.target.dataset.id, 10); // Retrieve and parse the id from the list item's data attribute
                handler(id); // Call the provided toggle handler with the id
            }
        });
    }

    // Bind the event for removing a todo item
    bindRemoveTodo(handler) {
        this.todoList.addEventListener('click', (event) => { // Listen for click events on the todo list
            if (event.target.className === 'close') { // Check if the clicked target is the close button (has class 'close')
                const id = parseInt(event.target.parentElement.dataset.id, 10); // Parse the id stored in the parent list item element
                handler(id); // Invoke the removal handler with the todo id
            }
        });
    }
}

// Controller: Connects the Model and View, and manages app logic
class Controller {
    constructor(model, view) {
        this.model = model; // Save the model object
        this.view = view;   // Save the view object

        // Initial render: Fetch todos from the model and display them in the view
        this.model.getTodos((todos) => {
            this.view.renderTodos(todos); // Render the list of todos retrieved from the database
        });

        // // Previous way of binding events to the controller's handler methods
        // /* Binding "this":
        //  * 
        //  * With regular functions, the context of "this" can change, 
        //  * so it is needed to call .bind(this) to ensure your handler methods 
        //  * refer to the Controller instance. Arrow functions, however, do not have their own 
        //  * "this" and it will automatically capture the surrounding context.
        //  */
        //
        // Bind view events to the controller's handler methods, ensuring 'this' context is preserved
        // this.view.bindAddTodo(this.handleAddTodo.bind(this)); // Bind the add todo event to the controller's add handler
        // this.view.bindToggleTodo(this.handleToggleTodo.bind(this)); // Bind the toggle event to the controller's toggle handler
        // this.view.bindRemoveTodo(this.handleRemoveTodo.bind(this)); // Bind the remove event to the controller's remove handler

        /* Cleaner Code:
         *
         *Defining handler methods as arrow functions in the class removes the need for 
         *repetitive binding in the constructor, resulting in more concise and readable code.
         */
        // Bind handler methods explicitly so "this" refers to the Controller instance.
        this.handleAddTodo = this.handleAddTodo.bind(this);
        this.handleToggleTodo = this.handleToggleTodo.bind(this);
        this.handleRemoveTodo = this.handleRemoveTodo.bind(this);
        // Now no need to bind since arrow functions automatically bind "this"
        this.view.bindAddTodo(this.handleAddTodo); // Bind the add todo event to the controller's add handler
        this.view.bindToggleTodo(this.handleToggleTodo); // Bind the toggle event to the controller's toggle handler
        this.view.bindRemoveTodo(this.handleRemoveTodo); // Bind the remove event to the controller's remove handler
    }

    // Handler method for adding a new todo item
    handleAddTodo(todoText) {
        console.log('Handling add todo:', todoText); // Log the todo text for debugging purposes
        this.model.addTodo(todoText, () => { // Call the model's method to add a new todo
            this.model.getTodos((todos) => { // Once added, retrieve the updated list of todos
                console.log('Todos after adding:', todos); // Log the updated todos for debugging purposes
                this.view.renderTodos(todos); // Render the updated todos on the UI
            });
        });
    }

    // Handler method for toggling the completed state of a todo item
    handleToggleTodo(id) {
        this.model.toggleTodo(id, () => { // Call the model's toggle method with the todo's id
            this.model.getTodos((todos) => { // Retrieve the list after toggling
                this.view.renderTodos(todos); // Render the updated list of todos
            });
        });
    }

    // Handler method for removing a todo item
    handleRemoveTodo(id) {
        this.model.removeTodo(id, () => { // Call the model's remove method with the todo's id
            this.model.getTodos((todos) => { // Retrieve the updated list of todos after removal
                this.view.renderTodos(todos); // Render the updated list on the UI
            });
        });
    }
}

// Initialize the app by creating a new Controller instance with a new Model and View
const app = new Controller(new Model(), new View()); // This instantiation sets up the entire MVC flow and starts the application