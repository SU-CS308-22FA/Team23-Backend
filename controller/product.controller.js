const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
const { Schema } = mongoose;
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/product.model");

const userModel = require("../models/user.model");
const catchAsync = require("./../utils/catchAsync");
const { ObjectId } = require('mongodb');

exports.uploadImage = catchAsync(async (req, res, next) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    const myId = new ObjectId();

    let email = req.body.email;
    let users = await userModel.find().where({ email: email });

    let query = { email: email };
    let newValue = { $push: { products: myId } };
    userModel.updateOne(query, newValue, () => {
      console.log(query, newValue);
    });

    // Create new user
    let product = new Product({
      name: req.body.name,
      owner: req.body.owner,
      type: req.body.type,
      image: result.secure_url,
      cloudinary_id: result.public_id,
      _id: myId,
    });
    // Save user
    await product.save();

    res.json(product);
  } catch (err) {
    console.log(err);
  }
});
exports.updateImage = catchAsync(async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    console.log(product);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(product.cloudinary_id);
    // Upload image to cloudinary
    let result;
    if (req.file) {
      result = await cloudinary.uploader.upload(req.file.path);
    }
    const data = {
      image: result?.secure_url || product.image,
      cloudinary_id: result?.public_id || product.cloudinary_id,
    };
    product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    console.log(err);
  }
});
exports.getProducts = catchAsync(async (req, res, next) => {

  console.log("tes");
  let products = await Product.find().sort({_id:1});
  //console.log(users);
  if (products.length > 0) {
    res.send({
      message: products,
    });
  } else {
    console.log("wrong email");
  }
});