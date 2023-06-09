const swaggerJsDoc = require('swagger-jsdoc');
const fs = require('fs');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API title",
      version: "1.0.0",
    },
  },
  // Path to the API docs
  apis: ["./**/*.ts"],
};

const openApiSpecification = swaggerJsDoc(options);

// Write the specification to a file
fs.writeFileSync('./openapi.json', JSON.stringify(openApiSpecification, null, 2));
