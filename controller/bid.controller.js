const express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const { Schema } = mongoose;
const bidModel = require('../models/bid.model');
const catchAsync = require('./../utils/catchAsync');
const Product = require('../models/product.model');
const userModel = require('../models/user.model');
const catchAsync = require('./../utils/catchAsync');
const { ObjectId } = require('mongodb');

exports.enterNewBid = catchAsync(async (req, res, next) => {
    alert("---BID CONTROLLER--- IS WORKING!!!");

  try {
    const myId = new ObjectId();
    let useremail = req.body.email;
    let users = await userModel.find().where({ email: email });
    let product = await Product.find().where({ _id: id });
    let query = { email: email };
    let newValue = { $push: { bids: myId } };

    let newbid = new Bid({
      _id: myId,
      offer: req.body.newprice,
      bidderId: req.body.userId,
      productId: req.body.productId,
      date: req.body.currentDate,
    });
    // Save bid
    await newbid.save();
    db.products.update({ _id: productId }, { $push: { bids: myId } });
    db.users.update({ email: useremail }, { $push: { bids: myId } });
  } catch (err) {
    console.log(err);
  }
});
