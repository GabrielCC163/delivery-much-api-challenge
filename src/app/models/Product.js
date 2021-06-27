const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
    defaultValue: 0,
  },
});

mongoose.model('Product', ProductSchema);
