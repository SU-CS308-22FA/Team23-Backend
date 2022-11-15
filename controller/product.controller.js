const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
const { Schema } = mongoose;

const userModel = require("../models/user.model");
const productModel = require("../models/product.model");
const catchAsync = require("./../utils/catchAsync");

// type: String,
// name: String,
// image: Number,
// owner: String,
// sold: Boolean,

exports.upload = catchAsync(async (req, res, next) => {
  var newProduct = new productModel();
  newProduct.type = req.body.type;
  newProduct.name = req.body.name;
  newProduct.owner = req.body.owner;
  newProduct.image = req.body.image;
  // newUser.password = await bcrypt.hash(req.body.password, 12);
  newProduct.sold = false;

  await newProduct.save(function (err, data) {
    if (err) {
      console.log(error);
    } else {
      res.send({
        message: "data inserted",
      });
    }
  });
});

// exports.addImage = catchAsync(async (req, res, next) => {
//   const saveImage = imageModel({
//     name: req.body.name,
//     img: {
//       data: fs.readFileSync("uploads/" + req.file.filename),
//       contentType: "image/png",
//     },
//   });
//   saveImage
//     .save()
//     .then((res) => {
//       console.log("image is saved");
//     })
//     .catch((err) => {
//       console.log(err, "error has occur");
//     });
//   res.send("image is saved");
// });

// exports.getImage = catchAsync(async (req, res, next) => {
//   const allData = await imageModel.find();
//   res.json(allData);
// });
