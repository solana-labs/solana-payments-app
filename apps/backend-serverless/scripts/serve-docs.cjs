const express = require('express');
const swaggerUi = require('swagger-ui-express');

const app = express();

const openApiDocument = require('../openapi.json');

app.use('/', swaggerUi.serve, swaggerUi.setup(openApiDocument));

console.log("Serving docs on http://localhost:3009");

app.listen(3009);
