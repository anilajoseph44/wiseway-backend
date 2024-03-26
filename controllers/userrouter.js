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

router.get("/viewuser",async(req,res)=>{
    let result=await usermodel.find()
    .populate("_id","name email")
    .exec()  //first it will find,then populate the fields
    res.json(result)

});


router.post("/changeusername", async (req, res) => {
    try {
        const { email, name: newUsername } = req.body;

        // Find the user by email
        const user = await usermodel.findOne({ email: email });
        if (!user) {
            return res.json({
                status: "error",
                message: "User not found",
            });
        }

        // Update the username
        user.name = newUsername;

        // Save the updated user
        await user.save();

        res.json({
            status: "success",
            message: "Username updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error changing username:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});


router.post("/changepassword", async (req, res) => {
    try {
        const { email, oldpassword, newpassword } = req.body;

        // Find the user by email
        const user = await usermodel.findOne({ email: email });
        if (!user) {
            return res.json({
                status: "error",
                message: "User not found",
            });
        }

        // Verify old password
        const match = await bcrypt.compare(oldpassword, user.password);
        if (!match) {
            return res.json({
                status: "error",
                message: "Incorrect old password",
            });
        }

        // Hash the new password
        const hashedNewPassword = await hashpasswordgenerator(newpassword);

        // Update the password
        user.password = hashedNewPassword;

        // Save the updated user
        await user.save();

        res.json({
            status: "success",
            message: "Password updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});





module.exports = router;
