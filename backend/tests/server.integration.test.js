// Prueba de integración de ejemplo para el backend

jest.mock('mongoose', () => ({
  connect: jest.fn(() => Promise.resolve()),
  connection: { on: jest.fn(), once: jest.fn() },
}));
const request = require('supertest');
const app = require('../app');

describe('Prueba de integración: endpoints', () => {
  it('debería responder correctamente a un flujo completo', async () => {
    // Simula un flujo: petición a /, luego a otro endpoint (ajusta según tu server.js)
    const resRoot = await request(app).get('/');
    expect(resRoot.statusCode).toBe(200);
    // Ejemplo: si tienes otro endpoint, agrégalo aquí
    // const resOther = await request(app).get('/api/otro');
    // expect(resOther.statusCode).toBe(200);
  });
});
