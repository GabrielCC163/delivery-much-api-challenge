# Delivery Much - Backend Challenge

### Requirements

- Docker and Docker Compose

## **Initialization**

### Start the database and then populate it

```
docker-compose up -d db
```

You only need to run the command below once

```
docker-compose run --rm --no-deps api yarn populate
```

### Initialize all services (API, DB, RabbitMQ, Stock Service)

```
docker-compose up
```

---

## **Running requests with Insomnia**

[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=delivery-much-api-requests&uri=https%3A%2F%2Fgist.githubusercontent.com%2FGabrielCC163%2Fa8c9ca24c8d6b05786154ea6a300954a%2Fraw%2F0980267905cc6372a2a33d021553f0b45f831afc%2Fgistfile1.txt)

---

## **Running tests**

### Start the test database and then populate it

```
docker-compose up -d db
```

You only need to run the command below once

```
docker-compose run -e NODE_ENV=test --rm --no-deps api yarn populate
```

### Run tests

```
docker-compose run -e NODE_ENV=test --rm --no-deps api yarn test
```
