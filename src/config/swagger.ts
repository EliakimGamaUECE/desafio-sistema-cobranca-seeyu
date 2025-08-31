// src/config/swagger.ts
import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Cobrança API',
      version: '1.0.0',
      description: 'API do desafio Seeyu (importar CSV, billing, webhook)',
    },
  },
  // Arquivos onde vamos colocar as anotações @swagger
  apis: ['./src/routes/*.ts', './src/dto/*.ts'],
};

export const setupSwagger = (app: Express) => {
  const specs = swaggerJSDoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
};

