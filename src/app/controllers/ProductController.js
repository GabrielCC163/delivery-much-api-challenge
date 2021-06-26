const { Product } = require('../models');

module.exports = {
  async show(req, res) {
    try {
      let {
        query: { name },
      } = req;

      const product = await Product.findOne({
        where: {
          name,
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'product not found' });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
    }
  },
};
