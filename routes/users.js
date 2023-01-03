var express = require("express");
var router = express.Router();
const userModel = require("../models/user.model");
let userController = require("../controller/user.controller");

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.post("/address", userController.addAddress);
router.get("/profile/:email", userController.getUserInfo);
router.put("/update", userController.update);
router.delete("/delete", userController.delete);
router.get("/team/:email", userController.getTeamData);
router.get("/statistics/:data", userController.getTeamStatistics);
router.get("/activebids/:email", userController.getActiveBids);
router.post("/favList/:data", userController.addFavList);
router.put("/deletefavList/:data", userController.deleteFavList);
router.get("/getFavList/:email", userController.getFavList);
router.post("/creditCard/:data", userController.addCreditCard);
router.get("/wonAuctions/:email", userController.getWonAuctions);
router.get("/paymentMethod/:email", userController.getPaymentMethod);

router.post("/payProduct", userController.buyProduct);


module.exports = router;
