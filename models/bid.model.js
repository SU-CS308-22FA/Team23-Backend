let mongoose = require("mongoose");
const { Schema } = mongoose;

const bidSchema = new Schema({
  offer: Number,
  bidderId: String,
  productId: String,
  date: Number
});

module.exports = mongoose.model("Bid", bidSchema);
