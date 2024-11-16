const mongoose = require("mongoose");

const todoSchema = mongoose.Schema({
    todos: String,
    completed: { type: Boolean, default: false }
})

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    data: [ todoSchema ]
});

todoModel = mongoose.model("Todo", todoSchema);
userModel = mongoose.model("User", userSchema);
module.exports = { userModel, todoModel };