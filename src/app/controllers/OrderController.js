const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const Product = mongoose.model('Product');

module.exports = {
  async store(req, res) {
    try {
      let {
        body: { products },
      } = req;

      if (!products || products.length === 0) {
        return res.status(400).json({
          message: 'products are required',
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

      return res.status(200).json({
        id: order.id,
        products: order.products,
        total: order.total,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
