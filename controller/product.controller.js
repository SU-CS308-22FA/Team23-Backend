const express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
const { Schema } = mongoose;
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../models/product.model");
const Team = require("../models/team.model");
const bidModel = require("../models/bid.model");

const userModel = require("../models/user.model");
const catchAsync = require("./../utils/catchAsync");
const { ObjectId } = require("mongodb");
const product = require("../seed/product");
const { parse } = require("path");

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
      paid: false,
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
  let email = option.substr(option.indexOf("&") + 1, option.length);
  option = option.substr(0, option.indexOf("&"));
  console.log("email: ", email, option);
  let status = [];
  let teams = [];
  let types = [];
  let range = [];
  let opt = "";
  let boolStatus = [];
  let numberRange = [];

  // console.log(prop.includes(";"));

  if (option.includes(";")) {
    let options = option.split(";");
    // console.log(options);
    options.map((x) => {
      // console.log(x);
      x = x.split(":");
      if (x[0] === "teams") {
        teams = [...x[1].split(",")];
      } else if (x[0] === "status") {
        status = [...x[1].split(",")];
      } else if (x[0] === "types") {
        types = [...x[1].split(",")];
      } else if (x[0] === "option") {
        opt = x[1];
      } else if (x[0] === "priceRange") {
        range = [...x[1].split("-")];
      }
    });
    console.log(teams, status, types, range, opt);
  } else {
    let optLs = option.split(":");
    opt = optLs[1];
  }

  for (let x = 0; x < status.length; x++) {
    if (status[x] === "open") {
      boolStatus.push(true);
    } else if (status[x] === "closed") {
      boolStatus.push(false);
    }
  }

  if (range.length > 0) {
    numberRange.push(Number(range[0]));
    if (range[1] !== "+") {
      numberRange.push(Number(range[1]));
    }
  }

  let products = await Product.find();
  console.log(opt);

  if (opt === "10") {
    products = await Product.find().sort({ price: 1 });
  } else if (opt === "20") {
    products = await Product.find().sort({ price: -1 });
  } else if (opt === "30") {
    products = await Product.find().sort({ start_date: 1 });
  } else if (opt === "40") {
    products = await Product.find().sort({ start_date: -1 });
  }

  for (let x = products.length - 1; x >= 0; x--) {
    let deleted = false;
    if (teams.length > 0) {
      if (!teams.includes(products[x].owner)) {
        products.splice(x, 1);
        deleted = true;
      }
    }
    if (types.length > 0 && deleted === false) {
      if (!types.includes(products[x].type)) {
        products.splice(x, 1);
        deleted = true;
      }
    }
    if (boolStatus.length > 0 && deleted === false) {
      if (!boolStatus.includes(products[x].open)) {
        products.splice(x, 1);
        deleted = true;
      }
    }
    if (numberRange.length > 0 && deleted === false) {
      if (numberRange.length === 1) {
        if (products[x].price < numberRange[0]) {
          products.splice(x, 1);
          deleted = true;
        }
      } else {
        if (
          products[x].price < numberRange[0] ||
          products[x].price > numberRange[1]
        ) {
          products.splice(x, 1);
          deleted = true;
        }
      }
    }
  }

  let user = await userModel.find().where({ email: email });
  let fav;
  let finalProduct = [];
  uid = user[0]._id;
  let product = await Product.find({ _id: { $in: user[0].favs } });
  let ids = [];
  for (let i = 0; i < product.length; i++) {
    ids.push(product[i]._id);
  }
  console.log(ids);
  for (let i = 0; i < products.length; i++) {
    finalProduct.push(products[i].toObject());
    if (ids.includes(products[i]._id)) {
      console.log("include");
      fav = true;
      finalProduct[i].isFav = fav;
    } else {
      fav = false;
      finalProduct[i].isFav = fav;
    }
    // finalProduct.push(products[i].toObject());
    // if (products[i].favs.length > 0) {
    //   fav = true;
    //   finalProduct[i].isFav = fav;
    // } else if (products[i].favs.length === 0) {
    //   fav = false;
    //   finalProduct[i].isFav = fav;
    // }
  }

  // console.log(finalProduct);

  if (products.length >= 0) {
    res.send({
      message: finalProduct,
    });
  } else {
    console.log("error");
  }
});

exports.getTeamProducts = catchAsync(async (req, res, next) => {
  let prop = req.params.id;
  let email = prop.substr(0, prop.indexOf("-"));
  let option = prop.substr(prop.indexOf("-") + 1);

  let user = await userModel.find().where({ email: email });
  var obj_ids = user[0].products.map(function (id) {
    return ObjectId(id);
  });

  if (option == 0) {
    //none
    let products = await Product.find({ _id: { $in: obj_ids } });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log("error");
    }
  } else if (option == 10) {
    //Increasing Price

    let products = await Product.find({ _id: { $in: obj_ids } }).sort({
      price: 1,
    });

    //console.log(users);
    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log("error");
    }
  } else if (option == 20) {
    //Decreasing Price
    let products = await Product.find({ _id: { $in: obj_ids } }).sort({
      price: -1,
    });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log("error");
    }
  } else if (option == 30) {
    //Ending Soon
    let products = await Product.find({ _id: { $in: obj_ids } }).sort({
      start_date: 1,
    });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log("error");
    }
  } else if (option == 40) {
    //Newly Listed
    let products = await Product.find({ _id: { $in: obj_ids } }).sort({
      start_date: -1,
    });

    if (products.length > 0) {
      res.send({
        message: products,
      });
    } else {
      console.log("error");
    }
  }
});

exports.getHotProducts = catchAsync(async (req, res, next) => {
  let products = await Product.find().where({ open: true });
  let newLs = [];

  for (let i = 0; i < products.length; i++) {
    let pop = 0;
    pop += products[i].price;
    pop += products[i].bids.length * 300;
    newLs.push(products[i].toObject());
    newLs[i].popularity = pop;
  }

  newLs.sort((a, b) => b.popularity - a.popularity);

  if (products.length > 0) {
    res.send({
      message: newLs.slice(0, 3),
    });
  } else {
    console.log("no hot products");
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

exports.getBidHistory = catchAsync(async (req, res, next) => {
  let id = req.params.id;

  let product = await Product.find().where({ _id: id });
  let msg = await bidModel
    .find({ _id: { $in: product[0].bids } })
    .sort({ _id: -1 });

  let newMsg = [];
  for (let i = 0; i < msg.length; i++) {
    newMsg.push(msg[i].toObject());
    let user = await userModel.find().where({ _id: newMsg[i].bidderId });
    let name = user[0].name + " " + user[0].lastname;

    const date = new Date(newMsg[i].date);

    newMsg[i].date = date.toLocaleString();
    newMsg[i].name = name;
  }
  if (newMsg.length === 0) {
    newMsg = [{}];
  }
  if (newMsg.length >= 0) {
    res.send({
      message: newMsg,
    });
  } else {
    console.log("error");
  }
});

exports.search = catchAsync(async (req, res, next) => {
  let search1 = req.params.searchQuery;
  // let products = await Product.find({ "$text": { "$search": search1 } });
  // console.log(search1 + "    asdasd");
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

exports.enterBid = catchAsync(async (req, res, next) => {
  // try {
  const myId = new ObjectId();
  let email = req.body.email;
  let pid = req.body.pid;
  let parambid = req.body.bid;
  let offer = parseInt(parambid);

  let products = await Product.find().where({ _id: pid });

  console.log(offer);
  let users = await userModel.find().where({ email: email });
  let uid = users[0]._id;
  let time = Date.now();
  console.log(time);

  let bid = new bidModel({
    _id: myId,
    offer: offer,
    bidderId: uid,
    productId: pid,
    date: time,
  });
  await bid.save();
  // console.log(bid);

  let query_product = { _id: pid };
  let newValue_product = { $push: { bids: myId } };
  Product.updateOne(query_product, newValue_product, () => {
    console.log(query_product, newValue_product);
  });

  let query_user = { email: email };
  let newValue_user = { $push: { bids: myId } };
  userModel.updateOne(query_user, newValue_user, () => {
    console.log(query_user, newValue_user);
  });

  let newValue = { $set: { price: offer } };

  Product.updateOne(query_product, newValue, () => { });
});

exports.getCertificate = catchAsync(async (req, res, next) => {
  let pid = req.params.pid;
  console.log(pid);
  let products = await Product.find().where({ _id: pid });

  let msg;
  if (products.length >= 0) {
    msg = products;
  } else {
    msg = "wrong code"
  }

  res.send({
    message: msg,
  });

});

