const express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const { Schema } = mongoose;
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const Product = require('../models/product.model');

const userModel = require('../models/user.model');
const catchAsync = require('./../utils/catchAsync');
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

    let product = new Product({
      name: req.body.name,
      owner: req.body.owner,
      type: req.body.type,
      image: result.secure_url,
      cloudinary_id: result.public_id,
      _id: myId,
      sold: false,
      start_date: req.body.currentDate,
      duration: req.body.duration,
      price: req.body.price,
    });
    // Save user
    await product.save();

    res.json(product);
  } catch (err) {
    console.log(err);
  }
});

// const productSchema = new Schema({
//   auction id
//   type: String,
//   name: String,
//   owner: String,
//   image: String,
//   cloudinary_id: String,
//   _id: String,
//   sold: Boolean,
//   duration: Number,
//   base_price: Number,
// });

exports.updateImage = catchAsync(async (req, res, next) => {
  try {
    let id = req.params.id;
    console.log(id);
    let product = await Product.find().where({ _id: id });
    let result;
    if (req.file) {
      result = await cloudinary.uploader.upload(req.file.path);
    }
    const data = {
      image: result?.secure_url || product.image,
      cloudinary_id: result?.public_id || product.cloudinary_id,
      type: req.body.type || product.type,
      name: req.body.name || product.name,
      owner: req.body.owner || product.owner,
    };

    product = await Product.findByIdAndUpdate(id, data, {});
    res.json(product);
  } catch (err) {
    console.log(err);
  }
});
exports.getProducts = catchAsync(async (req, res, next) => {
  console.log('tes');
  let products = await Product.find().sort({ _id: 1 });
  //console.log(users);
  if (products.length > 0) {
    res.send({
      message: products,
    });
  } else {
    console.log('error');
  }
});

exports.getTeamProducts = catchAsync(async (req, res, next) => {
  let email = req.params.id;
  let user = await userModel.find().where({ email: email });
  let name = user[0].name;

  const teamName = email.substr(0, email.indexOf('@'));

  let products = await Product.find().where({ owner: teamName });
  console.log(name);
  console.log(email);
  console.log(products);
  if (products.length > 0) {
    res.send({
      message: products,
    });
  } else {
    console.log('wrong email');
  }
  // let email = req.params.id;
  // let name = email.substr(0, email.indexOf('@'));
  // let products = await Product.find().where({ owner: name });
  // console.log(name);
  // console.log(email);
  // console.log(products);
  // if (products.length > 0) {
  //   res.send({
  //     message: products,
  //   });
  // } else {
  //   console.log("wrong email");
  // }
});

exports.getProductPage = catchAsync(async (req, res, next) => {
  //get operation
  let id = req.params.id;
  console.log(id);

  let product = await Product.find().where({ _id: id });
  //console.log(users);
  if (product.length > 0) {
    res.send({
      message: product,
    });
  } else {
    console.log('error');
  }
});

exports.search = catchAsync(async (req, res, next) => {
  let search1 = req.params.searchQuery;
  // let products = await Product.find({ "$text": { "$search": search1 } });
  let products = await Product.find({
    $or: [
      {
        type: new RegExp('^' + search1, 'i'),
      },
      {
        name: new RegExp('^' + search1, 'i'),
      },
      {
        owner: new RegExp('^' + search1, 'i'),
      },
    ],
  });
  if (products.length >= 0) {
    res.send({
      message: products,
    });
  } else {
    console.log('no product');
  }
});

exports.delete = catchAsync(async (req, res, next) => {
  try {
    let id = req.params.id;
    console.log(id);

    let product = await Product.find().where({ _id: id });


    let query = { _id: id };

    Product.deleteOne(query, () => {
      console.log(query);
    });

    // //   console.log('1 document updated');
    // // console.log(product);
    // // Product.deleteOne({ _id: id });
    //product = await Product.deleteOne(product);
  } catch (err) {
    console.log(err);
  }
});
