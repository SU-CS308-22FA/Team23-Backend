const express = require("express");

var Iyzipay = require("iyzipay");
var iyzipay = new Iyzipay({
  apiKey: "sandbox-HLLU432VO604hCISMSiFKATBMIsGQTHV",
  secretKey: "sandbox-dOQHTJkhkjvlhoCTDMBG1IR2SQ30iJMi",
  uri: "https://sandbox-api.iyzipay.com",
});

var router = express.Router();
let mongoose = require("mongoose");
let auth = require("../controller/auth");
let bcrypt = require("bcryptjs");
const { Schema } = mongoose;
const { MongoClient, MongoGridFSChunkError, ObjectId } = require("mongodb");

const userModel = require("../models/user.model");
const teamModel = require("../models/team.model");
const catchAsync = require("./../utils/catchAsync");
const productModel = require("../models/product.model");
const bidModel = require("../models/bid.model");

const creditCard = require("../models/creditCard.model");

const mailgun = require("mailgun-js");
const creditCardModel = require("../models/creditCard.model");

exports.signup = catchAsync(async (req, res, next) => {
  var newUser = new userModel();
  newUser.name = req.body.name;
  newUser.lastname = req.body.lastname;
  newUser.email = req.body.email;
  newUser.type = "fan";
  // newUser.password = await bcrypt.hash(req.body.password, 12);
  newUser.password = req.body.password;
  newUser.products = [];
  newUser.status = true;
  newUser.purchased = [];
  newUser.bids = [];
  newUser.addresses = [];
  newUser._id = new ObjectId();

  let users = await userModel.find().where({ email: newUser.email });
  if (users.length === 0) {
    await newUser.save(function (err, data) {
      if (err) {
        console.log(error);
      } else {
        res.send({
          redirectURL: "/signin",
          message: "data inserted",
        });
        const DOMAIN = "sandbox48645b44d8eb4529a6aed16a5240784b.mailgun.org";
        const APIKEY = "ad03f06d58ebea0a033d786965db53a8-2de3d545-a28c2796";
        const mg = mailgun({
          apiKey: APIKEY,
          domain: DOMAIN,
        });
        const data = {
          from: "Excited User <me@samples.mailgun.org>",
          to: newUser.email,
          subject: "MAÇTANA HOŞGELDİNİZ!",
          text: "MAÇTANA HOŞGELDİNİZ!\nHesabınız başarılı bir şekilde oluşturuldu.",
        };
        mg.messages().send(data, function (error, body) {
          console.log(body);
        });
      }
    });
  } else {
    res.send({ message: "Rejected" });
  }
});

exports.signin = catchAsync(async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  let users = await userModel.find().where({ email: email });
  let message;
  if (users.length > 0) {
    console.log(password, users[0].password);
    let comparisonResult = password == users[0].password ? true : false;
    if (comparisonResult) {
      let token = auth.generateToken(users[0]);
      res.cookie("auth_token", token);
      message = true;
    } else {
      console.log("wrong password");
      message = false;
    }
  } else {
    console.log("wrong email");
    message = false;
  }
  res.send({ message: message });
});

exports.addAddress = catchAsync(async (req, res, next) => {
  console.log(req.body);
  let email = req.body.email;
  let address = req.body.address;
  let city = req.body.city;
  let zip = req.body.zip;
  let country = req.body.country;

  let users = await userModel.find().where({ email: email });

  if (users.length > 0) {
    let addresses = users[0].addresses;
    addresses.push({
      address: address,
      city: city,
      zip: zip,
      country: country,
    });
    let query = { email: email };

    let newValue = { $set: { addresses: addresses } };

    userModel.updateOne(query, newValue, () => {
      console.log(query, newValue);
      console.log("1 document updated");
      res.send({
        message: "Success",
      });
    });
  } else {
    res.send({
      message: "Fail",
    });
  }
});

exports.getUserInfo = catchAsync(async (req, res, next) => {
  //get operation
  let email = req.params.email;
  console.log(email);
  console.log("profile");

  let users = await userModel.find().where({ email: email });
  //console.log(users);
  if (users.length > 0) {
    res.send({
      message: users,
    });
  } else {
    console.log("wrong email");
  }
});

exports.update = catchAsync(async (req, res, next) => {
  let newPassword = req.body.newpassword;
  let oldPassword = req.body.oldpassword;
  let email = req.body.email;
  console.log(newPassword, oldPassword);

  let users = await userModel.find().where({ email: email });
  if (users.length > 0) {
    let comparisonResult = oldPassword === users[0].password ? true : false;
    if (comparisonResult) {
      let query = { email: email };
      let newValue = { $set: { password: newPassword } };

      userModel.updateOne(query, newValue, () => {
        console.log(query, newValue);

        console.log("1 document updated");
      });
    } else {
      console.log("wrong password");
    }
  } else {
    console.log("wrong email");
  }
});

exports.delete = catchAsync(async (req, res, next) => {
  let email = req.body.email;

  let users = await userModel.find().where({ email: email });
  if (users.length > 0) {
    let query = { email: email };
    let newValue = { $set: { status: false } };

    userModel.deleteOne(query, () => {
      console.log(query, newValue);

      console.log("1 document updated");
    });
  } else {
    console.log("wrong email");
  }
});

exports.getTeamData = catchAsync(async (req, res, next) => {
  let email = req.params.email;

  let user = await userModel.find().where({ email: email });
  let team = await teamModel.find().where({ team: email });

  let message = { user: user, team: team, res: true };

  if (user.length > 0 && team.length > 0) {
    res.send({
      message: message,
    });
  } else {
    console.log("not admin");
  }
});

exports.getTeamStatistics = catchAsync(async (req, res, next) => {
  const duration = 604800000;
  let data = req.params.data;
  let sum = 0;
  let soldItems = [];
  // console.log(data);
  let begin = data.substr(0, data.indexOf("+"));

  let end = data.substr(data.indexOf("+") + 1, data.indexOf("-") - data.indexOf("+") - 1);

  let email = data.substr(data.indexOf("-") + 1, data.length);
  // console.log(begin, ",", end, ",", email);

  let user = await userModel.find().where({ email: email });
  let pid = user[0].products;

  let products = await productModel.find().where({
    _id: { $in: pid },
    sold: true,
    start_date: { $gt: begin - duration, $lt: end - duration },
  });
  //console.log(products);

  if (products.length >= 0) {
    for (let i = 0; i < products.length; i++) {
      sum = sum + products[i]["price"];
      soldItems.push(products[i]);
    }
    let message = { sum: sum, soldItems: soldItems };
    res.send({ message: message });
    //console.log(message);
    // console.log(soldItems, "sum: ", sum);
  } else {
    res.send("not found");
  }
});

exports.getActiveBids = catchAsync(async (req, res, next) => {
  let email = req.params.email;
  let user = await userModel.find().where({ email: email });
  let bid_ids = user[0].bids;
  let uid = user[0]._id;
  let bids = await bidModel.find({ _id: { $in: bid_ids } });
  let activeBids = [];
  // console.log(bids);

  let pid = [];
  for (let i = 0; i < bids.length; i++) {
    pid.push(bids[i]["productId"]);
    // console.log(bids[i]["productId"]);
  }
  let uniquepids = [];
  pid.forEach((element) => {
    if (!uniquepids.includes(element)) {
      uniquepids.push(element);
    }
  });
  let products = await productModel.find({
    _id: { $in: uniquepids },
    open: true,
  });
  // console.log(products.length);

  let flag;
  for (let i = 0; i < products.length; i++) {
    activeBids.push(products[i].toObject());
    let highestBid = products[i]["bids"].slice(-1);
    // console.log(highestBid);
    let bidInfo = await bidModel.find({ _id: highestBid });
    // console.log(bidInfo);
    if (bidInfo[0].bidderId === uid) {
      flag = true;
      // console.log(bidInfo[0].bidderId, ", ", uid, "bbb");
      activeBids[i].state = flag;
    } else {
      flag = false;
      // console.log(bidInfo[0].bidderId, ", ", uid, "aaa");
      activeBids[i].state = flag;
    }

    let merge = await bidModel.find({
      productId: products[i]._id,
      bidderId: uid,
    });
    // console.log("merge:", merge);
    activeBids[i].price = merge[merge.length - 1].offer;
  }
  // console.log(activeBids);
  activeBids = activeBids.sort((a, b) => Number(b.state) - Number(a.state));
  // console.log(activeBids);

  // for (let i = 0; i < products.length; i++) {
  //   let len = products[i]["bids"].length;
  //   let bids = await bidModel.find({
  //     _id: { $in: products[i]["bids"] },
  //   });
  //   console.log(bids, products[i].bids);
  // }

  if (activeBids.length === 0) {
    activeBids = [{}];
  }

  res.send({
    message: activeBids,
  });
});

// exports.addCreditCard = catchAsync(async (req, res, next) => {
//   let message = {};
//   let email = req.params.data;
//   let cardNumber = req.body.cardNumber;
//   let cvv = req.body.cvv;
//   let name = req.body.name;
//   let expDate = req.body.expDate;
//   console.log(email, cvv, name, expDate);

//   let user = await userModel.find().where({ email: email });
//   let uid = user[0]._id;

//   var newCreditCard = new creditCard();
//   newCreditCard.name = name;
//   newCreditCard.userId = uid;
//   newCreditCard.cardNumber = cardNumber;
//   newCreditCard.cvv = cvv;
//   newCreditCard.expDate = expDate;
//   newCreditCard._id = new ObjectId();

//   await newCreditCard.save(function (err, data) {
//     if (err) {
//       console.log("error");
//     } else {
//       message = "inserted";
//       res.send({
//         message: message,
//       });
//     }
//   });
// });

exports.addCreditCard = catchAsync(async (req, res, next) => {
  let message = {};
  let email = req.params.data;
  let cardNumber = req.body.cardNumber;
  let cvv = req.body.cvv;
  let name = req.body.name;
  let expDate = req.body.expDate;
  let month = expDate[0];
  let year = expDate[1];
  cardNumber = cardNumber.replace(/\s/g, "");
  console.log(cardNumber);
  let digits = cardNumber.substr(-4);

  let user_userModel = await userModel.find().where({ email: email });
  let uid = user_userModel[0]._id;

  let user = await creditCard.find().where({ email: email });
  let card = await creditCard
    .find()
    .where({ cardNumber: cardNumber, email: email });
  // console.log(user);
  if (card.length > 0) {
    message = "exist";
    res.send({
      message: message,
    });
  } else {
    if (user.length > 0) {
      iyzipay.card.create(
        {
          locale: Iyzipay.LOCALE.TR,
          conversationId: "123456789",
          cardUserKey: user[0].cardUserKey,
          card: {
            cardAlias: "card alias",
            cardHolderName: name,
            cardNumber: cardNumber,
            expireMonth: month,
            expireYear: year,
          },
        },
        function (err, result) {
          console.log("result", result);
          if (
            result.status === "failure" &&
            result.errorMessage === "expireYear geçersizdir"
          ) {
            message = "exp";
            res.send({
              message: message,
            });
          } else {
            var newCreditCard = new creditCard();
            newCreditCard.locale = result.locale;
            newCreditCard.conversationId = result.conversationId;
            newCreditCard.userId = uid;
            newCreditCard.email = email;
            newCreditCard.cardNumber = cardNumber;
            newCreditCard.cardUserKey = result.cardUserKey;
            newCreditCard.cardToken = result.cardToken;
            newCreditCard.lastFourDigits = result.lastFourDigits;
            newCreditCard.cardType = result.cardType;
            newCreditCard.cardAssociation = result.cardAssociation;
            newCreditCard.cardFamily = result.cardFamily;
            newCreditCard.cardBankName = result.cardBankName;
            newCreditCard.cardHolderName = name;
            newCreditCard.expMonth = month;
            newCreditCard.expYear = year;
            newCreditCard.cvv = cvv;
            newCreditCard._id = new ObjectId();

            newCreditCard.save(function (err, data) {
              if (err) {
                console.log("error");
              } else {
                message = "inserted";
                res.send({
                  message: message,
                });
              }
            });
          }
        }
      );
    } else if (user.length <= 0) {
      iyzipay.card.create(
        {
          locale: Iyzipay.LOCALE.TR,
          conversationId: "123456789",
          email: email,
          externalId: "external id",
          card: {
            cardAlias: "card alias",
            cardHolderName: name,
            cardNumber: cardNumber,
            expireMonth: month,
            expireYear: year,
          },
        },
        function (err, result) {
          console.log("result", result);
          if (
            result.status === "failure" &&
            result.errorMessage === "expireYear geçersizdir"
          ) {
            message = "exp";
            res.send({
              message: message,
            });
          } else {
            var newCreditCard = new creditCard();
            newCreditCard.locale = result.locale;
            newCreditCard.conversationId = result.conversationId;
            newCreditCard.userId = uid;
            newCreditCard.email = email;
            newCreditCard.cardNumber = cardNumber;
            newCreditCard.cardUserKey = result.cardUserKey;
            newCreditCard.cardToken = result.cardToken;
            newCreditCard.lastFourDigits = result.lastFourDigits;
            newCreditCard.cardType = result.cardType;
            newCreditCard.cardAssociation = result.cardAssociation;
            newCreditCard.cardFamily = result.cardFamily;
            newCreditCard.cardBankName = result.cardBankName;
            newCreditCard.cardHolderName = name;
            newCreditCard.expMonth = month;
            newCreditCard.expYear = year;
            newCreditCard.cvv = cvv;
            newCreditCard._id = new ObjectId();

            newCreditCard.save(function (err, data) {
              if (err) {
                console.log("error");
              } else {
                message = "inserted";
                res.send({
                  message: message,
                });
              }
            });
          }
        }
      );
    }
  }
});

exports.addFavList = catchAsync(async (req, res, next) => {
  let email = req.params.data;
  let pid = req.body.pid;

  let query = { email: email };
  let newValue = { $push: { favs: pid } };
  userModel.updateOne(query, newValue, () => {
    console.log(query, newValue);
  });
});

exports.deleteFavList = catchAsync(async (req, res, next) => {
  let data = req.params.data;
  let email = data.substr(0, data.indexOf("+"));
  console.log("a", email);
  let pid = data.substr(data.indexOf("+") + 1, data.length);

  let query = { email: email };
  let newValue = { $pull: { favs: pid } };
  userModel.updateOne(query, newValue, () => {
    console.log(query, newValue);
  });
});

exports.getFavList = catchAsync(async (req, res, next) => {
  let email = req.params.email;
  let user = await userModel.find().where({ email: email });
  var obj_ids = user[0].favs.map(function (id) {
    return ObjectId(id);
  });
  let products = await productModel.find({ _id: { $in: obj_ids } });
  res.send({
    message: products,
  });
});

exports.getWonAuctions = catchAsync(async (req, res, next) => {
  let email = req.params.email;
  let user = await userModel.find().where({ email: email });
  let bid_ids = user[0].bids;
  let uid = user[0]._id;
  let bids = await bidModel.find({ _id: { $in: bid_ids } });
  let wonAuctions = [];

  let pid = [];
  for (let i = 0; i < bids.length; i++) {
    pid.push(bids[i]["productId"]);
  }
  let uniquepids = [];
  pid.forEach((element) => {
    if (!uniquepids.includes(element)) {
      uniquepids.push(element);
    }
  });
  let products = await productModel.find({
    _id: { $in: uniquepids },
    open: false,
  });

  for (let i = 0; i < products.length; i++) {
    let highestBid = products[i]["bids"].slice(-1);
    let bidInfo = await bidModel.find({ _id: highestBid });

    if (bidInfo[0].bidderId === uid) {
      wonAuctions.push(products[i].toObject());
    }
  }
  wonAuctions = wonAuctions.sort((a, b) => Number(b.state) - Number(a.state));

  if (wonAuctions.length === 0) {
    wonAuctions = [{}];
  }
  res.send({
    message: wonAuctions,
  });
});

exports.getPaymentMethod = catchAsync(async (req, res, next) => {
  let email = req.params.email;
  let user = await userModel.find().where({ email: email });
  let uid = user[0]._id;

  let credit = await creditCard.find().where({ userId: uid });
  let address = user[0].addresses;

  // let cards = await creditCardModel.find().where({userId: uid});
  // let addresses = await addressModel.find().where({userId: uid});


  selectDelivery = [{ address: "Orta Mah. Sabancı No: B4", city: "Tuzla, İstanbul" },
  { address: "Tanzimat Sokak, Hayat Apt, No: 27", city: "Göztepe, İstanbul" },
  { address: "Yıldırım Mah. Gürsel Sokak, No: 56", city: "Bayrampaşa, İstanbul" },
  { address: "Cumhuriyet Mah. Star Life Sitesi, C Blok", city: "Kepez, Çanakkale" }]


  res.send({
    cardMessage: credit,
    addressMessage: address,
  });
});


exports.buyProduct = catchAsync(async (req, res, next) => {
  let user = await userModel.find().where({ _id: req.body.userId });
  let product = await productModel.find().where({ _id: req.body.pid });

  let priceInt = product[0].price;
  let price = priceInt.toString();

  var request = {
    locale: req.body.locale,
    conversationId: req.body.conversationId,
    price: price,
    paidPrice: price,
    currency: Iyzipay.CURRENCY.TRY,
    installment: '1',
    paymentCard: {
      // cardToken: req.body.cardToken,
      cardHolderName: req.body.cardHolderName,
      cardNumber: req.body.cardNumber,
      expireMonth: req.body.expMonth,
      expireYear: req.body.expYear,
      cvc: req.body.cvv,
    },
    buyer: {
      id: req.body.userId,
      name: user[0].name,
      surname: user[0].lastname,
      email: req.body.email,
      identityNumber: '33655748584',
      registrationAddress: req.body.address,
      ip: '85.34.78.112',
      city: req.body.city,
      country: req.body.country,
      zipCode: req.body.zip
    },
    shippingAddress: {
      contactName: user[0].name,
      city: req.body.city,
      country: req.body.country,
      address: req.body.address,
      zipCode: req.body.zip
    },
    billingAddress: {
      contactName: user[0].name,
      city: req.body.city,
      country: req.body.country,
      address: req.body.address,
      zipCode: req.body.zip
    },
    basketItems: [
      {
        id: 'BI101',
        name: 'Binocular',
        category1: 'Collectibles',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: price
      }
    ]
  };
  iyzipay.payment.create(request, function (err, result) {
    //console.log(result);


    if (result.status === "success") {
      let query = { _id: req.body.pid };
      let newValue = { $set: { paid: true } };

      productModel.updateOne(query, newValue, () => {
      });
    }


    res.send({
      message: result.status,
    });
  });
});
