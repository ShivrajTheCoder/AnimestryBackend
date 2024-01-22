const express=require("express");
const router=express.Router();
const {Dashboardinfo, MarkAsDeliverd} =require("../Controllers/adminController");
const { check } = require("express-validator");
router.route("/dashinfo")
    .get(Dashboardinfo)

router.route("/markasdelivered/:orderId")
    .put([
        check("orderId").exists().isMongoId(),
    ],MarkAsDeliverd)
module.exports=router;