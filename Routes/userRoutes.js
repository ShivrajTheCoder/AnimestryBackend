const express=require("express");
const router=express.Router();
const {body, check}=require("express-validator");
const { Signup, Login, ForgotPassword, SendCode, GetUserInfor, UpdatePassword } = require("../Controllers/userController");
const authenticateToken = require("../Middlewares/UserAuthMiddleware");
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

router.route("/getuserinfo/:userId")
    .get(authenticateToken,[
        check("userId").exists().isMongoId(),
    ],GetUserInfor);

router.route("/updatepassword/:userId")
    .put(authenticateToken,[
        check("userId").exists().isMongoId(),
        body("password").exists(),
        body("newpassword").exists(),
    ],UpdatePassword);

module.exports=router;