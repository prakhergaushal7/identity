## Description

Identity Reconciliation Service: POST {baseUrl}/contact/identify

## Sample Request

```
curl --location '{baseUrl}/contact/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
}'
```

## ToDo

```
Refactoring (SOLID)
Use ORM instead of raw queries to query the database
Tests
```

## Installation

```
bash
$ npm install
```

## Running the app

```
bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```
bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
