// import express from 'express';
// import bodyParser from 'body-parser';
// import routes from './routes';  // Importa as rotas definidas

// const app = express();
// const port = 3000;

// // Middleware para interpretar o corpo da requisição como JSON
// app.use(bodyParser.json());

// // Define as rotas da API
// app.use(routes);

// // Inicia o servidor na porta 3000
// app.listen(port, () => {
//   console.log(`Servidor rodando na porta ${port}`);
// });

import { env } from './config/env';
import app from './app';

app.listen(env.port, () => console.log(`Server on :${env.port}`));
