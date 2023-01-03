const mongoose = require("mongoose");
const Team = require("../models/team.model");
const Product = require("../models/product.model");
const Bid = require("../models/bid.model");
const User = require("../models/user.model");
const products = require("./product");
const users = require("./user");
const teams = require("./teams");

const { ObjectId } = require("mongodb");
const { where } = require("../models/bid.model");

const NUM_OF_PRODUCTS = 3; // * 25
const MAX_NUM_OF_BIDS = 6;
const FIRST_AUCTION = 60; // start day of a first auction
const AUCTION_DURATION = 7; //days

mongoose.connect("mongodb+srv://app:vbSczxBpNmkX5a4q@clustertff.h8qujjg.mongodb.net/?retryWrites=true&w=majority", {
  dbName: "tff-project",
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const daysToMilisecond = (days) => {
  return days * 24 * 60 * 60 * 1000;
};

const randomNumberGenerator = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const randomPrice = () => {
  const a = randomNumberGenerator(1, 35);
  return 50 * a + 100;
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

const updatePurchasedList = async () => {
  let soldProducts = await Product.find().where({ sold: true });
  for (let i = 0; i < soldProducts.length; i++) {
    let winnerBidId = soldProducts[i].bids[soldProducts[i].bids.length - 1];
    let winnerBid = await Bid.find().where({ _id: winnerBidId });
    // console.log(winnerBid);
    let winnerUser = await User.find().where({ _id: winnerBid[0].bidderId });

    let newPurchased = winnerUser[0].purchased;
    newPurchased.push(winnerBid[0].productId);

    let query = { _id: winnerUser[0]._id };
    let newValue = { $set: { purchased: newPurchased } };
    User.updateOne(query, newValue, () => {});
  }
};

const bidGenerator = async (id, startDate, startPrice) => {
  const randomNum = randomNumberGenerator(0, MAX_NUM_OF_BIDS);
  let prices = [];
  let times = [];
  for (let i = 0; i < randomNum; i++) {
    let randomPrice = randomNumberGenerator(0, 200);
    prices.push(startPrice + 10 * randomPrice);
  }
  for (let i = 0; i < randomNum; i++) {
    times.push(randomNumberGenerator(startDate + 100, Date.now()));
  }
  times.sort();
  prices.sort();

  let ids = [];
  for (let i = 0; i < randomNum; i++) {
    let myId = new ObjectId();

    let users = await User.find().where({ type: "fan" });
    const randomUserIdx = randomNumberGenerator(0, users.length);

    let newBids = users[randomUserIdx].bids;
    newBids.push(myId);

    let query = { _id: users[randomUserIdx]._id };
    let newValue = { $set: { bids: newBids } };
    User.updateOne(query, newValue, () => {});

    const bid = new Bid({
      _id: myId,
      offer: prices[i],
      bidderId: users[randomUserIdx]._id,
      productId: id,
      date: times[i],
    });
    await bid.save();

    ids.push(myId);
  }

  return ids;
};

const seedDB = async () => {
  shuffle(products);
  let times = [];

  await Team.deleteMany({});
  for (let i = 0; i < 19; i++) {
    const team = new Team({
      team: `${teams[i].team}`,
      logo: `${teams[i].url}`,
      displayName: `${teams[i].displayName}`,
    });
    await team.save();
  }

  await User.deleteMany({});
  for (let i = 0; i < users.length; i++) {
    let id = new ObjectId();
    if (users[i].type === "fan") {
      const user = new User({
        _id: id,
        type: `${users[i].type}`,
        name: `${users[i].name}`,
        lastname: `${users[i].lastname}`,
        email: `${users[i].email}`,
        password: `${users[i].password}`,
        status: true,
        age: randomNumberGenerator(18, 55),
        team: teams[randomNumberGenerator(0, teams.length)].name,
        purchased: [],
        bids: [],
        addresses: [],
      });
      await user.save();
    } else {
      const user = new User({
        _id: id,
        type: `${users[i].type}`,
        name: `${users[i].name}`,
        lastname: `${users[i].lastname}`,
        email: `${users[i].email}`,
        password: `${users[i].password}`,
        status: true,
        products: [],
      });
      await user.save();
    }
  }

  await Product.deleteMany({});
  await Bid.deleteMany({});

  for (let i = 0; i < products.length * NUM_OF_PRODUCTS; i++) {
    times.push(randomNumberGenerator(Date.now() - daysToMilisecond(FIRST_AUCTION), Date.now()));
  }

  times.sort();
  console.log(times);
  let count = 0;

  for (let a = 0; a < NUM_OF_PRODUCTS; a++) {
    for (let i = 0; i < products.length; i++) {
      let id = new ObjectId();
      let start = times[count];
      count++;
      let price = randomPrice();
      let sold = false;
      let open = true;
      let paid = false;
      let bids = await bidGenerator(id, start, price);

      if (bids.length === 0) {
        if (start < Date.now() - daysToMilisecond(AUCTION_DURATION)) {
          open = false;
        }
      } else {
        if (start < Date.now() - daysToMilisecond(AUCTION_DURATION)) {
          open = false;
          sold = true;
        }
      }

      let team = await User.find().where({ name: products[i].owner });
      let teamProducts = team[0].products;
      teamProducts.push(id);

      let query = { name: products[i].owner };
      let newValue = { $set: { products: teamProducts } };
      User.updateOne(query, newValue, () => {});

      let lastBid = await Bid.find().where({ _id: bids[bids.length - 1] });
      if (lastBid.length > 0) {
        lastPrice = lastBid[0].offer;
      } else {
        lastPrice = price;
      }

      const product = new Product({
        _id: id,
        type: `${products[i].type}`,
        name: `${products[i].name}`,
        owner: `${products[i].owner}`,
        image: `${products[i].image}`,
        cloudinary_id: "",
        sold: sold,
        open: open,
        start_date: start,
        duration: 604800000,
        price: lastPrice,
        basePrice: price,
        paid: paid,
        bids: bids,
      });
      await product.save();
    }
  }

  await updatePurchasedList();
};

seedDB().then(() => {
  mongoose.connection.close();
});
