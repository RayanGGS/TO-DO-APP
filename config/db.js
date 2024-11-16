const mongoose = require("mongoose");

const db = async function(req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Database");        
    } catch (error) {
        console.log("Error Connecting to database: ", error.message, error);
    }
}

module.exports = db;