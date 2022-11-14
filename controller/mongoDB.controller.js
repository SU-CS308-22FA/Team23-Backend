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
});

const productSchema = new Schema({
  //auction id
  type: String,
  name: String,
  image: Number,
  owner: String,
  sold: Boolean,
});

async function run() {
  // Create a separate connection and register a model on it...
  const conn = mongoose.createConnection();
  conn.model("User", userSchema);
  conn.model("Product", productSchema);

  const dbURL =
    process.env.DB_URL ||
    "mongodb+srv://app:vbSczxBpNmkX5a4q@clustertff.h8qujjg.mongodb.net/?retryWrites=true&w=majority";
  // But call `mongoose.connect()`, which connects MongoDB's default
  // connection to MongoDB. `conn` is still disconnected.
  await mongoose.connect(dbURL, { dbName: "tff-project" });
}

run().catch(console.error);

module.exports = run;
