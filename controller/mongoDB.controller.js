const { MongoClient } = require("mongodb");

let mongoose = require("mongoose");
const { Schema } = mongoose;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const userSchema = new Schema({
  _id: String,
  type: String,
  name: String,
  lastname: String,
  age: Number,
  team: String,
  email: String,
  password: String,
  status: Boolean,
  addresses: [
    {
      address: String,
      city: String,
      zip: String,
      country: String,
    },
  ],
  products: [String],
  purchased: [String],
  bids: [String],
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
  basePrice: Number,
  paid: Boolean,
  bids: [String],
});

const teamSchema = new Schema({
  team: String,
  logo: String,
  name: String,
});

const bidSchema = new Schema({
  _id: String,
  offer: Number,
  bidderId: String,
  productId: String,
  date: Number,
});

const creditCardSchema = new Schema({
  _id: String,
  userId: String,
  cardNumber: String,
  cvv: String,
  name: String,
  expDate: [],
});

async function run() {
  // Create a separate connection and register a model on it...
  const conn = mongoose.createConnection();
  conn.model("User", userSchema);
  conn.model("Product", productSchema);
  conn.model("Team", teamSchema);
  conn.model("Bid", bidSchema);
  conn.model("Credit Card", creditCardSchema);

  const dbURL =
    process.env.DB_URL ||
    "mongodb+srv://app:vbSczxBpNmkX5a4q@clustertff.h8qujjg.mongodb.net/?retryWrites=true&w=majority";
  // But call `mongoose.connect()`, which connects MongoDB's default
  // connection to MongoDB. `conn` is still disconnected.
  await mongoose.connect(dbURL, { dbName: "tff-project" });
}

run().catch(console.error);

module.exports = run;
