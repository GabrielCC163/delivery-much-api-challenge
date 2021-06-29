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
          async (msg) => {
            const name = msg.content.toString().replaceAll('"', '');
            console.log(`Increment ${name}`);
            await ProductController.updateQuantity('increment', name);
          },
          {
            noAck: true,
            consumerTag: 'info_consumer',
          },
        );

        const channelDecrement = await conn.createChannel();
        await channelDecrement.assertExchange('stock', 'direct');
        await channelDecrement.assertQueue(
          '',
          'stock',
          'decremented',
        );
        await channelDecrement.bindQueue('', 'stock', 'decremented');
        await channelDecrement.prefetch(1);
        await channelDecrement.consume(
          '',
          async (msg) => {
            const name = msg.content.toString().replaceAll('"', '');
            console.log(`Decrement ${name}`);
            await ProductController.updateQuantity('decrement', name);
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
