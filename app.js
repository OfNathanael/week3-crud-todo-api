require("dotenv").config(); //Loading environment variables from a .env file into process.env. This allows you to manage configuration settings outside of your code, such as database credentials or API keys, without hardcoding them in your application.

const express = require("express"); //Importing the Express library to create a web server

const app = express(); //Creating an instance of the Express application

app.use(express.json()); //Middleware to parse incoming JSON requests. Comes before any other thing

let todos = [
  { id: 1, task: "Learn Node.js", completed: false },
  { id: 2, task: "Build CRUD API", completed: false },
  { id: 3, task: "Complete Week 3 Assignment", completed: true },
]; //In-memory array to store todo items. Each item has an id, task description, and completion status.

// Get all todos
app.get("/todos/all", (req, res) => {
  res.status(200).json(todos);
}); //Endpoint to retrieve all todo items. Responds with a JSON array of todos and a 200 OK status.

//To Get todo with "true" completion status and send an "active" message
app.get("/todos/active", (req, res) => {
  const activeTodo = todos.filter(todo => !todo.completed); //Filtering the todos array to find all todo items that have a completed status of true. The filter method creates a new array that includes only the todos that meet this condition.
  res.status(200).json({ message: `There are ${activeTodo.length} active todos.` }); //Responding with a message that includes the count of completed todos and indicates that they are active. The response is sent with a 200 OK status.
});

// To Get a specific todo. This route comes last because it has a dynamic parameter (id) that could potentially match other routes if placed before them. By placing it last, we ensure that more specific routes (like /todos/all and /todos/active) are matched first, and only if those do not match will the request be handled by this route to retrieve a specific todo by id.
app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ message: "Todo Not Found" });
  res.status(200).json(todo);
}); //Endpoint to retrieve a specific todo item by id. Responds with a JSON object of the todo and a 200 OK status. If the todo is not found, it responds with a 404 Not Found status and an error message.

//Post a new todo
app.post("/todos", (req, res) => {
  const newTodo = { id: todos.length + 1, ...req.body };
  todos.push(newTodo); //Creating a new todo item by taking the request body and assigning it a new id based on the current length of the todos array. The new todo is then added to the todos array.
  //To check if the task and completion status is included:
  if (!newTodo.task || !newTodo.completed) {
    return res.status(400).json({ error: "Task and completion status is required" });
  };
  res.status(201).json(newTodo);
}); //Endpoint to create a new todo item. It takes the request body, assigns a new id, adds it to the todos array, and responds with the created todo and a 201 Created status.

//Building PATCH & DELETE endpoints

//Update a todo
app.patch("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id)); //Finding the todo item in the todos array that matches the id provided in the request parameters. The find method is used to search for the first todo with a matching id, which is parsed as an integer for comparison.
  if (!todo) return res.status(404).json({ message: "Todo Not Found" }); //If no matching todo is found, it responds with a 404 Not Found status and an error message. Otherwise, it updates the properties of the found todo item with the values from the request body using Object.assign, which merges the properties of the request body into the existing todo object. Finally, it responds with the updated todo and a 200 OK status.
  Object.assign(todo, req.body); //Updating the found todo item with the properties from the request body. This allows for partial updates, meaning only the provided fields in the request body will be updated while the rest remain unchanged.
  res.status(200).json(todo);
}); //Endpoint to update an existing todo item. It finds the todo by id, updates its properties with the request body, and responds with the updated todo and a 200 OK status.

//Delete a todo
app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id); //Extracting the id from the request parameters and converting it to an integer for comparison.
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); //Filtering the todos array to remove the todo item with the specified id. The filter method creates a new array that includes all todos except the one with the matching id.
  if (todos.length === initialLength)
    return res.status(404).json({ error: "Not found" }); //If the length of the todos array remains the same after filtering, it means that no todo was deleted (i.e., no todo with the specified id was found). In this case, it responds with a 404 Not Found status and an error message. Otherwise, it responds with a 204 No Content status indicating successful deletion.
  res.status(204).send();
}); //Endpoint to delete a todo item. It filters out the todo with the specified id from the todos array. If no todo is deleted (length remains the same), it responds with a 404 Not Found status. Otherwise, it responds with a 204 No Content status indicating successful deletion.

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Server error!" });
}); //Global error handling middleware. If any unhandled errors occur in the application, this middleware will catch them and respond with a 500 Internal Server Error status and a generic error message.

//Starting the server
const port = process.env.port;
app.listen(port, () => {
  console.log(`App is now running on ${port}`);
});
