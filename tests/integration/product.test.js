const request = require('supertest');
const { app, mongoose } = require('../../src/app');
const Product = require('../../src/app/models/Product');

afterAll(() => {
  mongoose.connection.close();
});

describe('GET /products/:name', () => {
  it('should return a product by name with status 200', async () => {
    const response = await request(app).get('/products/Garlic');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Garlic');
    expect(response.body.price).toBe(6.21);
    expect(response.body.quantity).toBe(0);
  });

  it('should return 404, product not found', async () => {
    const response = await request(app).get(
      '/products/SomethingElse',
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toBe(
      'Product not found with name SomethingElse',
    );
  });
});
