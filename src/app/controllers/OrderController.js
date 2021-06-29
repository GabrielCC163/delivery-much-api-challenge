const Order = require('../models/Order');
const Product = require('../models/Product');

module.exports = {
  async store(req, res) {
    try {
      let {
        body: { products },
      } = req;

      if (!products || products.length === 0) {
        return res.status(400).json({
          message: 'Products are required',
        });
      }

      for (let i = 0; i < products.length; i++) {
        if (
          !products[i].name ||
          !products[i].quantity ||
          products[i].quantity === 0
        ) {
          return res.status(400).json({
            message:
              'Every product must have name and quantity defined',
          });
        }
      }

      for (const product of products) {
        const productFound = await Product.findOne({
          name: product.name,
        });

        if (!productFound) {
          return res.status(404).json({
            message: `Product not found with name ${product.name}`,
          });
        }

        product.price = productFound.price;
      }

      const total = products.reduce((prev, prod) => {
        return prev + prod.price * prod.quantity;
      }, 0);

      const order = await Order.create({
        products,
        total: parseFloat(total.toFixed(2)),
      });

      return res.status(201).json({
        id: order.id,
        products: order.products,
        total: order.total,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  },

  async show(req, res) {
    try {
      const {
        params: { id },
      } = req;

      const order = await Order.findOne({ id });

      if (!order) {
        return res.status(404).json({
          message: `Order not found with ID ${id}`,
        });
      }

      return res.status(200).json({
        id: order.id,
        products: order.products,
        total: order.total,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },

  async index(req, res) {
    try {
      const orders = await Order.find(
        {},
        { id: 1, products: 1, total: 1, _id: 0 },
      );

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          message: `No order found`,
        });
      }

      const result = {
        orders: orders.map((order) => ({
          id: order.id,
          products: order.products,
          total: order.total,
        })),
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
};
