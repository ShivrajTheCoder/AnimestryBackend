const express=require("express");
const router=express.Router();
const {body}=require("express-validator");
const { Signup, Login } = require("../Controllers/userController");
router.route("/signup")
    .post([
        body("username").exists(),
        body("email").exists(),
        body("password").exists(),
    ],Signup);

router.route("/login")
    .post([
        body("email").exists(),
        body("password").exists(),
    ],Login)
module.exports=router;