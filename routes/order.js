const express = require("express");
const { placeOrder, getUserOrders } = require("./../controllers/order");

const orderRouter = express.Router();

orderRouter.post("/placeorder", placeOrder);
orderRouter.get("/userorders/:userId", getUserOrders);

module.exports = orderRouter;
