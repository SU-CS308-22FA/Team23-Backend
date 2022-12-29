const router = require("express").Router();
const teamController = require("../controller/team.controller");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/team.model");

router.get("/logos", teamController.getLogos);

module.exports = router;
