const express = require("express");
const router = express.Router();
const { index, create, login, logout, add, deleteTodo, updateTodoStatus, updateTodo } = require("../controllers/authControllers");

// Route to render the home page or index
router.get("/", index);

// Route to create a new user
router.post("/create", create);

// Route to log in a user
router.post("/login", login);

// Route to log out a user
router.post("/logout", logout);

// Route to add a new todo
router.post("/add", add);

// Route to delete a todo
router.get("/delete/:todoID", deleteTodo);

// Route to update the completion status of a todo
router.post("/update/:todoID", updateTodoStatus);

// Route to update a todo's text
router.post("/edit/:todoID", updateTodo); // New route for editing a todo

module.exports = router;