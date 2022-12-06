const { MongoClient } = require("mongodb");

let mongoose = require("mongoose");
const { Schema } = mongoose;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const userSchema = new Schema({
  name: String,
  lastname: String,
  age: Number,
  team: String,
  email: String,
  password: String,
  status: Boolean,
  products: [String],
  puchased: [String],
  bids: [String]
});

const productSchema = new Schema({
  _id: String,
  type: String,
  name: String,
  owner: String,
  image: String,
  cloudinary_id: String,
  sold: Boolean,
  open: Boolean,
  start_date: Number,
  duration: Number,
  price: Number,
  bids: [String]
});

const teamSchema = new Schema({
  team: String,
  logo: String
});

const bidSchema = new Schema({
  offer: Number,
  bidderId: String,
  productId: String,
  date: Number
});


async function run() {
  // Create a separate connection and register a model on it...
  const conn = mongoose.createConnection();
  conn.model("User", userSchema);
  conn.model("Product", productSchema);
  conn.model("Team", teamSchema);
  conn.model("Bid", bidSchema);

  const dbURL =
    process.env.DB_URL ||
    "mongodb+srv://app:vbSczxBpNmkX5a4q@clustertff.h8qujjg.mongodb.net/?retryWrites=true&w=majority";
  // But call `mongoose.connect()`, which connects MongoDB's default
  // connection to MongoDB. `conn` is still disconnected.
  await mongoose.connect(dbURL, { dbName: "tff-project" });
}

run().catch(console.error);

module.exports = run;
