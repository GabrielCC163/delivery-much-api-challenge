const Product = require('../models/Product');

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
          .json({ message: `Product not found with name ${name}` });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  },

  async updateQuantity(operation, name) {
    try {
      const op = operation === 'increment' ? 1 : -1;
      let query = { name };

      if (op === -1) {
        query = {
          ...query,
          quantity: {
            $gt: 0,
          },
        };
      }

      const res = await Product.updateOne(query, {
        $inc: {
          quantity: op,
        },
      });
    } catch (error) {
      console.log(error);
    }
  },
};
