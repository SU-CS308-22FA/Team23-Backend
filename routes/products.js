const router = require("express").Router();
const productController = require("../controller/product.controller");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/product.model");
const bidController = require("../controller/bid.controller");

router.get("/:option", productController.getProducts);
router.get("/filter/ops", productController.filter);
router.post("/upload", upload.single("image"), productController.uploadItem);
router.get("/team/:id", productController.getTeamProducts);
router.put("/update/:id", upload.single("image"), productController.updateItem);
router.get("/productPage/:id", productController.getProductPage);
router.get("/search/:searchQuery", productController.search);
router.delete("/delete/:id", productController.delete);

router.get('/bidHistory/:id', productController.getBidHistory);
router.newbid( '/product/newbid' + bidController.enterNewBid);

module.exports = router;
