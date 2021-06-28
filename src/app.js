const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
require('dotenv').config();

const { connect } = require('../worker');
connect();

const requireDir = require('require-dir');
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
const { DB_DATABASE, DB_HOSTNAME, DB_PORT } = process.env;

mongoose.connect(
  `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_DATABASE}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

mongoose.connection.once('open', async () => {
  console.log('Connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to database  ', err);
});

autoIncrement.initialize(mongoose.connection);

requireDir('./app/models');

const routes = require('./routes');
app.use(routes);

app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(errorHandler);

module.exports = app;
