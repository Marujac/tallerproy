const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Reescribe rutas para que coincidan con /api/* según mock/routes.json
const routes = require('./routes.json');
const rewriter = jsonServer.rewriter(routes);

const port = process.env.MOCK_PORT || 4000;

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(rewriter);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server mock corriendo en http://localhost:${port}`);
});
