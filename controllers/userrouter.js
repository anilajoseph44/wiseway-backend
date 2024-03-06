const express = require("express");
const usermodel = require("../models/usermodel");
const router = express.Router();
const bcrypt = require("bcryptjs");


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

    let password = data.password;
    hashpasswordgenerator(password).then((hashedpassword) => {
        console.log(hashedpassword);
        data.password = hashedpassword;
        console.log(data);
        let user = new usermodel(data);
        let response = user.save();
        res.json({
            status: "success",
        });
    });
});

router.post("/signin", async (req, res) => {
    let email = req.body.email;
    let data = await usermodel.findOne({ "email": email });
    if (!data) {
        return res.json({
            status: "Incorrect email id",
        });
    }
    console.log(data);
    let dbpassword = data.password;
    let inputpassword = req.body.password;
    console.log(dbpassword);
    console.log(inputpassword);

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

module.exports = router;
