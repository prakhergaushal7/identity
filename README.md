## Description

Identity Reconciliation Service: POST https://20002.stg.doubtnut.com/contact/identify

## Sample Request

```curl --location 'https://20002.stg.doubtnut.com/contact/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
}'
```

## ToDo

```Refactoring (SOLID)
Use ORM instead of raw queries to query the database
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
