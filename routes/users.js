var express = require("express");
var router = express.Router();
const userModel = require("../models/user.model");
let userController = require("../controller/user.controller");

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.get("/profile/:email", userController.profile);
router.put("/update", userController.update);

router.delete("/delete", userController.delete);

module.exports = router;
