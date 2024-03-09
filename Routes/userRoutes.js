const express=require("express");
const router=express.Router();
const {body, check}=require("express-validator");
const { Signup, Login, ForgotPassword, SendCode } = require("../Controllers/userController");
router.route("/signup")
    .post([
        body("username").exists(),
        body("email").exists(),
        body("password").exists(),
        body("code").exists(),
    ],Signup);

router.route("/login")
    .post([
        body("email").exists(),
        body("password").exists(),
    ],Login)


router.route("/forgotpassword")
    .post([
        check("email").exists().isEmail(),
        check("code").exists(),
    ],ForgotPassword);

router.route("/sendcode")
    .post([
        check("email").exists().isEmail(),
        check("recovery").optional().isBoolean(),
    ],SendCode);
module.exports=router;