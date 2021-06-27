const mongoose = require('mongoose');
const fs = require('fs').promises;

require('dotenv').config();

var parse = require('csv-parse/lib/sync');

const PRODUCTS_COLLECTION = 'products';

const { DB_HOSTNAME, DB_DATABASE, DB_PORT } = process.env;

mongoose.connect(
  `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_DATABASE}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.error(`Error with MongoDB connection - ${err}`);
      process.exit(1);
    }
  },
);

const { connection } = mongoose;

connection.once('open', () => {
  console.log('Conected to MongoDB');
  populate();
});

const populate = async () => {
  await execPopulate();

  connection.close();
  console.log('Processamento finalizado!');
  process.exit(0);
};

const execPopulate = async () => {
  const promiseTransactions = new Promise(async (resolve, reject) => {
    const stringArrayTransactions = await fs.readFile(
      __dirname + '/../../../products.csv',
      'utf-8',
    );

    let products = parse(stringArrayTransactions, {
      columns: true,
    });

    products = products.map((prod) => ({
      ...prod,
      price: parseFloat(prod.price),
      quantity: parseInt(prod.quantity),
    }));

    connection.db
      .collection(PRODUCTS_COLLECTION)
      .insertMany(products)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });

  await Promise.all([promiseTransactions]);
};
