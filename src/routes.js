const routes = require('express').Router();

const ProductController = require('./app/controllers/ProductController');
const OrderController = require('./app/controllers/OrderController');

routes.get('/products/:name', ProductController.show);

routes.post('/orders/', OrderController.store);
// routes.get('/orders/', OrderController.list);
// routes.get('/orders/:id', OrderController.show);

routes.get('/', (req, res) => {
  return res.status(200).json({ message: 'OK' });
});

module.exports = routes;
