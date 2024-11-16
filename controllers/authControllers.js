const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { userModel, todoModel } = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports.index = function (req, res) {
    // res.render("index");
    res.render("index")
}

module.exports.create = async function (req, res) {
    try {
        const { name, email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).send("User already exist")
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        user = await userModel.create({
            name: name,
            email,
            password: hash
        });
        const token = await generateToken(email);
        res.cookie("token", token);
        res.render("dashboard", { user });
    } catch (error) {
        console.log(error.message, error);
        return res.status(500).send("Something went wrong")
    }
}
module.exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send("User does'nt exist");
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.status(400).send("Incorrect password");
        }
        const token = await generateToken(email);
        res.cookie("token", token);
        console.log("User  object: ", user);
        res.render("dashboard", { "user": user });
    } catch (error) {
        console.log("Error logging in: ", error.message, error);
        res.status(500).send("Error logging in");
    }
}
module.exports.logout = async function (req, res) {
    try {
        res.cookie("token", "");
        res.status(200).send("Logged out succesfully");
    } catch (error) {
        console.log("Error logging out: ", error.message, error);
        res.status(500).send("Error logging out");
    }
}

module.exports.add = async function(req, res) {
    try {
        const { todo } = req.body;
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Unauthorized access of data.");
        }
        const email = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email }).select("-password");
        const addTodo = await todoModel.create({ todos: todo, completed: false }); // Set completed to false
        await user.data.push(addTodo);
        await user.save();
        res.render("dashboard", { "user": user });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching data");
    }
}

module.exports.deleteTodo = async function(req, res) {
    try {
        const todoID = req.params.todoID;
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Unauthorized access of data.");
        }
        const email = await jwt.verify(token, process.env.JWT_SECRET);
        await userModel.findOneAndUpdate(
            { email }, // Filter to find the user
            { $pull: { data: { _id: todoID } } }, // Use $pull to remove the todo by its ID
            { new: true } // Return the updated document
        );
        await todoModel.findOneAndDelete({ _id: `${todoID}` });
        const user = await userModel.findOne({ email }).select("-password");
        res.render("dashboard", { "user": user });
    } catch (error) {
        console.log(error)
        res.status(500).send("Something went wrong");
    }
}

module.exports.updateTodoStatus = async function(req, res) {
    try {
        const todoID = req.params.todoID;
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send("Unauthorized access of data.");
        }
        const email = await jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user
        const user = await userModel.findOne({ email }).select("-password");

        // Find the todo and toggle its completed status
        const todo = await todoModel.findById(todoID);
        if (todo) {
            // Toggle the completed status
            todo.completed = !todo.completed; 
            await todo.save(); // Save the updated todo

            // Update the user's data array manually
            const userTodo = user.data.id(todoID); // Get the specific todo from user's data
            if (userTodo) {
                userTodo.completed = todo.completed; // Update the completed status
                await user.save(); // Save the user with updated todo
            }
        }
        const updatedUser = await userModel.findOne({ email }).select("-password");
        // Render the dashboard with updated user data
        res.render("dashboard", { "user": updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
}

module.exports.updateTodo = async function(req, res) {
    try {
        const todoID = req.params.todoID;
        const { todo } = req.body; // Get the updated todo text from the request body
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send("Unauthorized access of data.");
        }

        const email = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email }).select("-password");

        // Find the todo and update its text
        const todoItem = user.data.id(todoID);
        if (todoItem) {
            todoItem.todos = todo; // Update the todo text
            await user.save(); // Save the user with updated todo
        }

        res.status(200).send("Todo updated successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
}

module.exports.updateTodo = async function(req, res) {
    try {
        const todoID = req.params.todoID;
        const { todo } = req.body; // Get the updated todo text from the request body
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send("Unauthorized access of data.");
        }

        const email = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email }).select("-password");

        // Find the todo and update its text
        const todoItem = user.data.id(todoID);
        if (todoItem) {
            todoItem.todos = todo; // Update the todo text
            await user.save(); // Save the user with updated todo
            return res.status(200).send("Todo updated successfully");
        }

        res.status(404).send("Todo not found");
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
}