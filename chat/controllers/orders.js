const Order = require('../models/Order');
const Product = require('../models/Product');
const sendMail = require('../libs/sendMail');
const mapOrder = require('../mappers/order');

module.exports.checkout = async function checkout(ctx, next) {
  const user = ctx.user.id;
  const {product, phone, address} = ctx.request.body;
  const order = await Order.create({
    user,
    product,
    phone,
    address,
  });

  const productData = await Product.findById(product);

  await sendMail({
    to: ctx.user.email,
    subject: 'Подтверждение регистрации',
    locals: {id: order.id, product: productData},
    template: 'order-confirmation',
  });

  ctx.body = {order: order.id};
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orders = await Order.find({user: ctx.user}).populate('product');
  ctx.body = {orders: orders.map(mapOrder)};
};
