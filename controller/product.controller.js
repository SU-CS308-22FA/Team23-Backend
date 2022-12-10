const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
const { Schema } = mongoose;
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/product.model");
const bidModel = require("../models/bid.model")

const userModel = require("../models/user.model");
const catchAsync = require("./../utils/catchAsync");
const { ObjectId } = require("mongodb");

exports.uploadItem = catchAsync(async (req, res, next) => {
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
      basePrice: req.body.price,
      open: true,
      bids: [],
    });
    // Save user
    await product.save();

    res.json(product);
  } catch (err) {
    console.log(err);
  }
});

exports.updateItem = catchAsync(async (req, res, next) => {
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
  let option = req.params.option;
  console.log(option);

  if (option == 0) {
    //none
    let products = await Product.find();
    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
  else if (option == 10) {
    //Increasing Price
    let products = await Product.find().sort({ price: 1 });
    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
  else if (option == 20) {
    //Decreasing Price
    let products = await Product.find().sort({ price: -1 });
    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
  else if (option == 30) {
    //Ending Soon
    let products = await Product.find().sort({ start_date: 1 });
    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }

  }
  else if (option == 40) {
    //Newly Listed
    let products = await Product.find().sort({ start_date: -1 });
    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
});

exports.getTeamProducts = catchAsync(async (req, res, next) => {
  let prop = req.params.id;
  let email = prop.substr(0, prop.indexOf("-"));
  let option = prop.substr(prop.indexOf("-") + 1);
  console.log(option);

  if (option == 0) {
    //none
    let user = await userModel.find().where({ email: email });
    var obj_ids = user[0].products.map(function (id) { return ObjectId(id); });
    let products = await Product.find({ _id: { $in: obj_ids } });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
  else if (option == 10) {
    //Increasing Price
    let user = await userModel.find().where({ email: email });
    var obj_ids = user[0].products.map(function (id) { return ObjectId(id); });
    let products = await Product.find({ _id: { $in: obj_ids } }).sort({ price: 1 });

    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
  else if (option == 20) {
    //Decreasing Price
    let user = await userModel.find().where({ email: email });
    var obj_ids = user[0].products.map(function (id) { return ObjectId(id); });
    let products = await Product.find({ _id: { $in: obj_ids } }).sort({ price: -1 });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
  else if (option == 30) {
    //Ending Soon
    let user = await userModel.find().where({ email: email });
    var obj_ids = user[0].products.map(function (id) { return ObjectId(id); });
    let products = await Product.find({ _id: { $in: obj_ids } }).sort({ start_date: 1 });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }

  }
  else if (option == 40) {
    //Newly Listed
    let user = await userModel.find().where({ email: email });
    var obj_ids = user[0].products.map(function (id) { return ObjectId(id); });
    let products = await Product.find({ _id: { $in: obj_ids } }).sort({ start_date: -1 });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log('error');
    }
  }
});

exports.getProductPage = catchAsync(async (req, res, next) => {
  //get operation
  let id = req.params.id;
  let product = await Product.find().where({ _id: id });

  if (product.length > 0) {
    res.send({
      message: product,
    });
  } else {
    console.log("error");
  }
});

exports.getBidHistory = catchAsync(async (req, res, next) => {
  let id = req.params.id;

  let product = await Product.find().where({ _id: id });
  let msg = await bidModel.find({ _id: { $in: product[0].bids } });

  for (let i = 0; i < msg.length; i++) {
    console.log(msg[i]._id);
    let user = await userModel.find().where({ _id: msg[i]._id });

    let name = user.name + " " + user.lastname;

    const date = new Date(msg[i].date);

    msg[i].bidderId = date.toLocaleString();

    //msg[i].name = name;
    //msg[i].productId = name;
    msg[i].productId = "Rafi Banana";

    console.log(msg[i]);
  }
  if (msg.length > 0) {
    res.send({
      message: msg,
    });
  } else {
    console.log("error");
  }
});

exports.search = catchAsync(async (req, res, next) => {
  let search1 = req.params.searchQuery;
  // let products = await Product.find({ "$text": { "$search": search1 } });
  let products = await Product.find({
    $or: [
      {
        type: new RegExp("^" + search1, "i"),
      },
      {
        name: new RegExp("^" + search1, "i"),
      },
      {
        owner: new RegExp("^" + search1, "i"),
      },
    ],
  });
  if (products.length >= 0) {
    res.send({
      message: products,
    });
  } else {
    console.log("no product");
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
  } catch (err) {
    console.log(err);
  }
});