# Delivery Much - Backend Challenge

### Requirements

- Docker and Docker Compose

## **Initialization**

### Populate the database

```
docker-compose run --rm api yarn populate
```

### Initialize all services (API, DB, RabbitMQ, Stock Service)

```
docker-compose up
```

## **Running tests**

### Start the database and then populate it

```
docker-compose up db
```

You only need to run the command below once

```
docker-compose run -e NODE_ENV=test --rm --no-deps api yarn populate
```

### Run tests

```
docker-compose run -e NODE_ENV=test --rm --no-deps api yarn test
```
