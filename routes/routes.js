const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");

// Image upload setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

const upload = multer({
    storage: storage,
}).single("image");

// Route to add a new user
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();
        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.status(500).json({ message: err.message, type: "danger" });
    }
});

// Get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Render Add User Page
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

//edit an user route
// Edit a user route
router.get("/edit/:id", async (req, res) => {
    let id = req.params.id;

    try {
        const user = await User.findById(id);

        if (!user) {
            res.redirect("/");
        } else {
            res.render("edit_users", {
                title: "Edit User",
                user: user,
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});



// Delete user route
router.get("/delete/:id", async (req, res) => {
    let id = req.params.id;

    try {
        const user = await User.findByIdAndDelete(id); // Use findByIdAndDelete

        if (user && user.image) {
            // Check if user exists and has an image
            try {
                fs.unlinkSync("./uploads/" + user.image); // Delete the image file
            } catch (err) {
                console.error("Error deleting file:", err);
            }
        }

        req.session.message = {
            type: "info",
            message: "User deleted successfully!",
        };
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting user:", err);
        res.json({ message: err.message });
    }
});


module.exports = router;
