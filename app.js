require("dotenv").config();
const userModel = require("./models/user.model");
const productModel = require("./models/product.model");


var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productsRouter = require("./routes/products");
var teamsRouter = require("./routes/teams");


const mongoConnection = require("./controller/mongoDB.controller");
const userCreate = require("./controller/user.controller");

var app = express();

// var cors = require("cors");
// app.use(cors());

const corsOpts = {
  origin: "*",

  methods: ["GET", "POST", "DELETE", "PUT"],

  allowedHeaders: ["Content-Type", "Access-Control-Allow-Origin"],
};

app.use(cors(corsOpts));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/teams", teamsRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  //deneme
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

async function closedAuction() {
  let products = await productModel.find({ open: true });
  let time = Date.now();

  for (let i = 0; i < products.length; i++) {
    let id = products[i]._id;
    let diff = time - products[i].start_date;
    if (diff >= 604800000) {
      let query = { _id: id };
      let newValue = { $set: { open: false } };
      productModel.updateOne(query, newValue, () => {});
    }
  }
}

setInterval(closedAuction, 1000);

module.exports = app;
