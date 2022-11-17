const { MongoClient } = require("mongodb");

let mongoose = require("mongoose");
const { Schema } = mongoose;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// const productSchema = require("../models/product.model");
// const userSchema = require("../models/user.model");
// const auctionSchema = require("../models/auction.model");

const userSchema = new Schema({
  name: String,
  lastname: String,
  age: Number,
  team: String,
  email: String,
  // {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   lowercase: true,
  //   validate: (value) => {
  //     return validator.isEmail(value);
  //   },
  // },
  password: String,
  products: [String],
});

const productSchema = new Schema({
  //auction id
  type: String,
  name: String,
  owner: String,
  image: String,
  cloudinary_id: String,
  _id: String,
  sold: Boolean,
  start_date: Number,
  duration: Number,
  price: Number,
});

const auctionSchema = new Schema({
  _id: String,
  product_id: String,
  bids: [Number],
  duration: Number,
  start_date: Number,
  finish_date: Number,
  base_price: Number,
  open: Boolean,
});

async function run() {
  // Create a separate connection and register a model on it...
  const conn = mongoose.createConnection();
  conn.model("User", userSchema);
  conn.model("Product", productSchema);
  conn.model("Auction", auctionSchema);

  const dbURL =
    process.env.DB_URL ||
    "mongodb+srv://app:vbSczxBpNmkX5a4q@clustertff.h8qujjg.mongodb.net/?retryWrites=true&w=majority";
  // But call `mongoose.connect()`, which connects MongoDB's default
  // connection to MongoDB. `conn` is still disconnected.
  await mongoose.connect(dbURL, { dbName: "tff-project" });
}

run().catch(console.error);

module.exports = run;
