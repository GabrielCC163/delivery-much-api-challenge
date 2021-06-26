const { Product } = require('../models');

module.exports = {
  async show(req, res) {
    try {
      let {
        params: { name },
      } = req;

      const product = await Product.findOne({
        attributes: ['name', 'price', 'quantity'],
        where: {
          name,
        },
      });

      if (!product) {
        return res
          .status(404)
          .json({ message: `product not found with name ${name}` });
      }

      return res
        .status(200)
        .json({
          ...JSON.parse(JSON.stringify(product)),
          price: parseFloat(product.price),
        });
    } catch (error) {
      console.error(error);
    }
  },
};
