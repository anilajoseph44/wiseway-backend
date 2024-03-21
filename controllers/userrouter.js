const express = require("express");
const usermodel = require("../models/usermodel");
const router = express.Router();
const bcrypt = require("bcryptjs");

const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

hashpasswordgenerator = async (pwd) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pwd, salt);
};

router.post("/signup", async (req, res) => {
    let data = req.body;

    // Check if the email already exists in the database
    const existingUser = await usermodel.findOne({ "email": data.email });
    if (existingUser) {
        return res.json({
            status: "Email ID already exists",
        });
    }

    // Validate email format
    if (!emailRegex.test(req.body.email)) {
        return res.json({
            status: "error",
            message: "Invalid email format. Please enter a valid email address.",
        });
    }

    // Check if password and confirm password match
    if (req.body.password !== req.body.confirmPassword) {
        return res.json({
            status: "error",
            message: "Passwords do not match. Please make sure both passwords match.",
        });
    }

    // Hash the password before saving to the database
    let password = data.password;
    let confirmPassword = data.confirmPassword;
    const hashedPassword = await hashpasswordgenerator(password);
    const hashedConfirmPassword = await hashpasswordgenerator(confirmPassword);
    
    data.password = hashedPassword;
    data.confirmPassword = hashedConfirmPassword;

    // Save user data to the database
    let user = new usermodel(data);
    let response = await user.save();

    res.json({
        status: "success",
    });
});

router.post("/signin", async (req, res) => {
    let email = req.body.email;
    let data = await usermodel.findOne({ "email": email }); // Checking email id
    if (!data) {
        return res.json({
            status: "Incorrect email id",
        });
    }

    let dbpassword = data.password;
    let inputpassword = req.body.password;

    const match = await bcrypt.compare(inputpassword, dbpassword);
    if (!match) {
        return res.json({
            status: "Incorrect password",
        });
    }

    res.json({
        status: "success",
        "userdata": data,
    });
});

// Display users list
router.get("/viewusers", async (req, res) => {
    let result = await usermodel.find();
    res.json(result);
});





module.exports = router;
