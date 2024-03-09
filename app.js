const express = require("express");
const app = express();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;


const productRouter = require("./Routes/productRoutes");
const orderRouter = require("./Routes/orderRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewRouter = require("./Routes/reviewRoutes");
const cartRouter = require("./Routes/cartRoutes");
const adminRouter = require("./Routes/adminRoutes");
const otherProductsRouter = require("./Routes/otherProductsRoutes");
const addressRouter = require("./Routes/addressRoutes");
const codeRouter = require("./Routes/referalCodeRoutes");
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(DB_URL)
    .then(() => {
      console.log("Connected to database");
    });
}
const { ErrorHandlerMiddleware } = require("./Middlewares/ErrorHandlerMiddleware");
const DeadOrderRemover = require("./Utilities/DeadOrderRemover");

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Middlewares
app.use(cors());

// Routes

app.use("/products", jsonParser, productRouter);
app.use("/orders", jsonParser, orderRouter);
app.use("/user", jsonParser, userRouter);
app.use("/review", jsonParser, reviewRouter);
app.use("/cart", jsonParser, urlencodedParser, cartRouter);
app.use("/admin", jsonParser, adminRouter);
app.use("/otherproducts", jsonParser, otherProductsRouter);
app.use("/address", jsonParser, addressRouter);
app.use("/referalcode", jsonParser, codeRouter);
app.use("/*", (req, res) => {
  return res.status(404).json({
    message: "No such route"
  })
})
app.use(ErrorHandlerMiddleware)
DeadOrderRemover();
app.listen(PORT, () => {
  console.log("listening on port " + PORT);
})