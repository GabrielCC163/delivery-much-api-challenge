const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const OrderSchema = new mongoose.Schema({
  products: {
    type: Array,
  },
  total: {
    type: Number,
    required: true,
    defaultValue: 0,
  },
});

OrderSchema.plugin(autoIncrement.plugin, {
  model: 'Order',
  field: 'id',
  startAt: 1,
});

mongoose.model('Order', OrderSchema);
