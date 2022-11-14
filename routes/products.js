var express = require("express");
var router = express.Router();
const productModel = require("../models/product.model");
let productController = require("../controller/product.controller");
// const fs = require("fs");
// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

router.post("/upload", productController.upload);
// router.post(
//   "/addImage",
//   upload.single("testImage"),
//   productController.addImage
// );

// router.get("/getImage", productController.getImage);

module.exports = router;
