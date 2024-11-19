require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    session({
        secret: "my_secret_key",
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Set Template Engine
app.set("view engine", "ejs");

// Route Prefix
app.use("/", require("./routes/routes"));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
