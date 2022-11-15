const router = require("express").Router();
const productController = require("../controller/product.controller");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/product.model");

router.post("/upload", upload.single("image"), productController.uploadImage);
router.put(
  "/update/:id",
  upload.single("image"),
  productController.updateImage
);

module.exports = router;
