const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
const { Schema } = mongoose;
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/product.model");
const Team = require("../models/team.model");
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
      console.log("error");
    }
  } else if (option == 10) {
    //Increasing Price
  } else if (option == 20) {
    //Decreasing Price
  } else if (option == 30) {
    //Ending Soon
    let products = await Product.find().sort({ start_date: 1 });
    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log("error");
    }
  } else if (option == 40) {
    //Newly Listed
    let products = await Product.find().sort({ start_date: -1 });
    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log("error");
    }
  }
});

exports.getTeamProducts = catchAsync(async (req, res, next) => {
  let email = req.params.id;
  let user = await userModel.find().where({ email: email });

  var obj_ids = user[0].products.map(function (id) {
    return ObjectId(id);
  });
  let products = await Product.find({ _id: { $in: obj_ids } });

  if (products.length > 0) {
    res.send({
      message: products,
    });
  } else {
    console.log("wrong email");
  }
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

exports.filter = catchAsync(async (req, res, next) => {
  let teams = await Team.find();
  let products = await Product.find();

  let newTeams = [];
  let productTypes = [];
  for (let x = 0; x < teams.length; x++) {
    let name = teams[x].team.substring(0, teams[x].team.indexOf("@"));
    name = name.charAt(0).toUpperCase() + name.slice(1);
    newTeams.push(name);
  }
  for (let x = 0; x < products.length; x++) {
    if (!productTypes.includes(products[x].type)) {
      productTypes.push(products[x].type);
    }
  }
  const resMes = [{ teams: newTeams, types: productTypes }];

  if (products.length >= 0 || teams.length >= 0) {
    res.send({
      message: resMes,
    });
  } else {
    console.log("no product");
  }
});
