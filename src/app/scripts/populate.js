var fs = require('fs').promises;
var parse = require('csv-parse/lib/sync');

const { Product } = require('../models');

(async function () {
  try {
    const fileContent = await fs.readFile(
      __dirname + '/../../../products.csv',
    );

    const records = parse(fileContent, { columns: true });

    await Product.bulkCreate(records, {
      fields: ['id', 'name', 'price', 'quantity'],
      updateOnDuplicate: ['id', 'name'],
    });

    console.log('Import CSV into database successfully.');

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
