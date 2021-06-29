const amqp = require('amqplib');
const async = require('async');

const ProductController = require('./src/app/controllers/ProductController');

let amqpConn = null;

async function start() {
  if (!amqpConn) {
    try {
      amqpConn = await async.retry(
        {
          times: 24,
          interval: (retryCount) => {
            console.error(
              `[AMQP] Connection could not be establish. Retry count ${retryCount}`,
            );
            return 5000;
          },
        },
        async () => amqp.connect('amqp://rabbitmq'),
      );
      console.log('[AMQP] Connection established');
      await whenConnected();
    } catch (error) {
      console.log(`[AMQP] Error: ${error.message}`);
    }
  }
}

async function whenConnected() {
  await startIncrementWorker();
  await startDecrementWorker();
}

async function startIncrementWorker() {
  const channel = await amqpConn.createChannel();
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
}

async function startDecrementWorker() {
  const channel = await amqpConn.createChannel();
  await channel.assertExchange('stock', 'direct');
  await channel.assertQueue('', 'stock', 'decremented');
  await channel.bindQueue('', 'stock', 'decremented');
  await channel.prefetch(1);
  await channel.consume(
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
}

module.exports = {
  connect() {
    start();
  },
  // connectOld() {
  //   try {
  //     const connection = amqp.connect('amqp://rabbitmq');
  //     connection.then(async (conn) => {
  //       const channel = await conn.createChannel();
  //       await channel.assertExchange('stock', 'direct');
  //       await channel.assertQueue('', 'stock', 'incremented');
  //       await channel.bindQueue('', 'stock', 'incremented');
  //       await channel.prefetch(1);
  //       await channel.consume(
  //         '',
  //         async (msg) => {
  //           const name = msg.content.toString().replaceAll('"', '');
  //           console.log(`Increment ${name}`);
  //           await ProductController.updateQuantity('increment', name);
  //         },
  //         {
  //           noAck: true,
  //           consumerTag: 'info_consumer',
  //         },
  //       );

  //       const channelDecrement = await conn.createChannel();
  //       await channelDecrement.assertExchange('stock', 'direct');
  //       await channelDecrement.assertQueue(
  //         '',
  //         'stock',
  //         'decremented',
  //       );
  //       await channelDecrement.bindQueue('', 'stock', 'decremented');
  //       await channelDecrement.prefetch(1);
  //       await channelDecrement.consume(
  //         '',
  //         async (msg) => {
  //           const name = msg.content.toString().replaceAll('"', '');
  //           console.log(`Decrement ${name}`);
  //           await ProductController.updateQuantity('decrement', name);
  //         },
  //         {
  //           noAck: true,
  //           consumerTag: 'info_consumer',
  //         },
  //       );
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
};
