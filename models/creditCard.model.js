let mongoose = require("mongoose");
const { Schema } = mongoose;

const creditCardSchema = new Schema({
  userId: String,
  conversationId: String,
  email: String,
  cardUserKey: String,
  cardToken: String,
  lastFourDigits: String,
  cardType: String,
  cardAssociation: String,
  cardFamily: String,
  cardBankName: String,
});

module.exports = mongoose.model("CreditCard", creditCardSchema);
