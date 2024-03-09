const express=require("express");
const router=express.Router();
const {Dashboardinfo, MarkAsDeliverd, Signup, Login} =require("../Controllers/adminController");
const { check } = require("express-validator");
router.route("/dashinfo")
    .get(Dashboardinfo)

router.route("/login")
    .post([
        check("email").exists().isEmail(),
        check("password").exists().isLength({ min: 5 }),
    ],Login)

router.route("/signup")
    .post([
        check("name").exists(),
        check("email").exists().isEmail(),
        check("password").exists().isLength({ min: 5 }),
    ],Signup)

router.route("/markasdelivered/:orderId")
    .put([
        check("orderId").exists().isMongoId(),
    ],MarkAsDeliverd)

module.exports=router;