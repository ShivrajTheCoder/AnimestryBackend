const express=require("express");
const app=express();
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL;
const PORT=process.env.PORT;


const productRouter=require("./Routes/productRoutes");
const orderRouter=require("./Routes/orderRoutes");
const userRouter=require("./Routes/userRoutes");

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/animestry')
  .then(()=>{
    console.log("Connected to database");
  });
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
// import routes
const { ErrorHandlerMiddleware } = require("./Middlewares/ErrorHandlerMiddleware");
// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Middlewares
app.use(cors());

// Routes
app.use(ErrorHandlerMiddleware)

app.use("/products",jsonParser,productRouter);
app.use("/orders",jsonParser,orderRouter);
app.use("/user",jsonParser,userRouter);
app.listen(PORT,()=>{
    console.log("listening on port "+PORT);
})