const router = require("express").Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/product.model");

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Create new user
    let product = new Product({
      name: req.body.name,
      owner: req.body.owner,
      type: req.body.type,
      image: result.secure_url,
      //cloudinary_id: result.public_id,
    });
    // Save user
    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

//-----------------------
// var express = require("express");
// var router = express.Router();
// const productModel = require("../models/product.model");
// let productController = require("../controller/product.controller");
// const cloudinary = require("../utils/cloudinary");
// const upload = require("../utils/multer");
// const path = require("path");

// router.post("/upload", upload.single("image"), async (req, res) => {
//   const result = await cloudinary.uploader.upload(req.file.path);

//   var newProduct = new productModel();
//   newProduct.type = req.body.type;
//   newProduct.name = req.body.name;
//   newProduct.owner = req.body.owner;
//   newProduct.image = result.secure_url;
//   // newUser.password = await bcrypt.hash(req.body.password, 12);
//   newProduct.sold = false;
//   console.log(result.secure_url, result.public_id);

//   await newProduct.save(function (err, data) {
//     if (err) {
//       console.log(error);
//     } else {
//       res.send({
//         message: "data inserted",
//       });
//     }
//   });
// });

// // router.post("/upload", productController.upload);

// module.exports = router;
