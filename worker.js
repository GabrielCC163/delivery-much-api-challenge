const amqp = require('amqplib');
const ProductController = require('./src/app/controllers/ProductController');

module.exports = {
  connect() {
    try {
      const connection = amqp.connect('amqp://rabbitmq:5672');
      connection.then(async (conn) => {
        const channel = await conn.createChannel();
        await channel.assertExchange('stock', 'direct');
        await channel.assertQueue('', 'stock', 'incremented');
        await channel.bindQueue('', 'stock', 'incremented');
        await channel.prefetch(1);
        await channel.consume(
          '',
          async function (msg) {
            const name = msg.content.toString();
            console.log(name);
            await ProductController.updateQuantity('increment', name);
          },
          {
            noAck: true,
            consumerTag: 'info_consumer',
          },
        );
      });
    } catch (error) {
      console.log(error);
    }
  },
};
