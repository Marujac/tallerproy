// Prueba unitaria de ejemplo para el backend

jest.mock('mongoose', () => ({
  connect: jest.fn(() => Promise.resolve()),
  connection: { on: jest.fn(), once: jest.fn() },
}));
const request = require('supertest');
const app = require('../app');

describe('Prueba unitaria: server', () => {
  it('debería responder a / con status 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /api/saludo', () => {
  it('debería responder con un saludo', async () => {
    const res = await request(app).get('/api/saludo');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje).toMatch(/Hola/);
  });
});
