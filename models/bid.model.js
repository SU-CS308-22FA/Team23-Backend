let mongoose = require("mongoose");
const { Schema } = mongoose;

const bidSchema = new Schema({
  _id: String,
  offer: Number,
  bidderId: String,
  productId: String,
  date: Number,
});

module.exports = mongoose.model("Bid", bidSchema);
