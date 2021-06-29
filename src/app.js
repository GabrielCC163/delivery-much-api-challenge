const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
require('dotenv').config();

const { connect } = require('../worker');

let database;
let hostname;

console.log(
  `Application started with NODE_ENV ${process.env.NODE_ENV}`,
);

if (process.env.NODE_ENV === 'test') {
  database = process.env.DB_DATABASE_TEST;
  hostname = process.env.DB_HOSTNAME;
} else if (process.env.NODE_ENV === 'development') {
  database = process.env.DB_DATABASE;
  hostname = process.env.DB_HOSTNAME_DEV;
} else {
  database = process.env.DB_DATABASE;
  hostname = process.env.DB_HOSTNAME;
  connect();
}

const errorHandler = require('./app/controllers/ErrorController');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Delivery Much API',
      description:
        'Documentação da API para criar e buscar pedidos e produtos.',
      contact: {
        name: 'Gabriel Brum Rodrigues',
      },
      servers: ['http://localhost:3000'],
    },
  },
  apis: ['./src/routes.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

//iniciando o app
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//iniciando o DB
const { DB_HOSTNAME, DB_PORT } = process.env;

mongoose.connect(`mongodb://${hostname}:${DB_PORT}/${database}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
  console.log(`Connected to database ${database}`);
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to database  ', err);
});

autoIncrement.initialize(mongoose.connection);

const routes = require('./routes');
app.use(routes);

app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(errorHandler);

module.exports = { app, mongoose };
