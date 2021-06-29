const request = require('supertest');
const { app, mongoose } = require('../../src/app');
const Product = require('../../src/app/models/Product');
const Order = require('../../src/app/models/Order');

afterEach(async () => {
  await Product.updateMany({ quantity: 0 });
  await Order.deleteMany();
});

afterAll(async () => {
  mongoose.connection.close();
});

describe('POST /orders', () => {
  it('should create an order, decrease the product quantity and return 201', async () => {
    await Product.updateOne({ name: 'Kiwi' }, { quantity: 2 });

    const response = await request(app)
      .post('/orders')
      .send({
        products: [
          {
            name: 'Kiwi',
            quantity: 2,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toBe('Kiwi');
    expect(response.body.products[0].quantity).toBe(2);
    expect(response.body.products[0].price).toBe(9.21);
    expect(response.body.total).toBe(18.42);

    const product = await Product.findOne({ name: 'Kiwi' });
    expect(product.quantity).toBe(0);
  });

  it('should not create an order returning 400 (products are required)', async () => {
    const response = await request(app).post('/orders').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Products are required');
  });

  it('should not create an order returning 400 (Each product must have name and quantity defined)', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        products: [
          {
            quantity: 1,
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Each product must have name and quantity defined',
    );

    const res = await request(app)
      .post('/orders')
      .send({
        products: [
          {
            name: 'Kiwi',
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      'Each product must have name and quantity defined',
    );
  });

  it('should not create an order returning 404 (Product not found with name SomethingElse)', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        products: [
          {
            name: 'SomethingElse',
            quantity: 1,
          },
        ],
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      'Product not found with name SomethingElse',
    );
  });

  it('should not create an order returning 400 (The product Kiwi does not have the requested quantity)', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        products: [
          {
            name: 'Kiwi',
            quantity: 1,
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'The product Kiwi does not have the requested quantity',
    );
  });
});

describe('GET /orders', () => {
  it('should return all orders (200)', async () => {
    await Product.updateOne({ name: 'Kiwi' }, { quantity: 2 });
    await Product.updateOne({ name: 'Garlic' }, { quantity: 2 });

    const resFirstOrder = await request(app)
      .post('/orders')
      .send({ products: [{ name: 'Kiwi', quantity: 2 }] });

    expect(resFirstOrder.status).toBe(201);

    const resSecondOrder = await request(app)
      .post('/orders')
      .send({ products: [{ name: 'Garlic', quantity: 2 }] });

    expect(resSecondOrder.status).toBe(201);

    const response = await request(app).get('/orders');

    expect(response.body.orders).toHaveLength(2);
    expect(response.body.orders[0].id).toBeDefined();
    expect(response.body.orders[1].id).toBeDefined();
    expect(response.body.orders[0].products).toHaveLength(1);
    expect(response.body.orders[1].products).toHaveLength(1);
    expect(response.body.orders[0].total).toBe(18.42);
    expect(response.body.orders[1].total).toBe(12.42);
  });

  it('should return 404, no order found', async () => {
    const response = await request(app).get('/orders');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No order found');
  });
});

describe('GET /orders/:id', () => {
  it('should return a single order (200)', async () => {
    await Product.updateOne({ name: 'Kiwi' }, { quantity: 2 });
    await Product.updateOne({ name: 'Garlic' }, { quantity: 1 });

    const res = await request(app)
      .post('/orders')
      .send({
        products: [
          { name: 'Kiwi', quantity: 2 },
          { name: 'Garlic', quantity: 1 },
        ],
      });

    expect(res.status).toBe(201);

    const order = await Order.findOne();

    const response = await request(app).get(`/orders/${order.id}`);

    expect(response.status).toBe(200);

    console.log(response.body);
    expect(response.body.id).toBe(order.id);
    expect(response.body.products).toHaveLength(2);
    expect(response.body.total).toBe(24.63);
  });
});
