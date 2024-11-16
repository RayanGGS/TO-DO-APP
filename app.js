const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
let port = 3000;
require("dotenv").config();
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const path = require("path");
db();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.use("/", authRoutes);

app.listen(process.env.PORT || port);