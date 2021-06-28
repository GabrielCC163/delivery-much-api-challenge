const mongoose = require('mongoose');

const Product = mongoose.model('Product');

module.exports = {
  async show(req, res) {
    try {
      let {
        params: { name },
      } = req;

      const product = await Product.findOne(
        {
          name,
        },
        { _id: 0 },
      );

      if (!product) {
        return res
          .status(404)
          .json({ message: `product not found with name ${name}` });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  },

  async updateQuantity(operation, name) {
    try {
      await Product.updateOne(
        { name },
        {
          $inc: {
            quantity: operation === 'increment' ? 1 : -1,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  },
};
