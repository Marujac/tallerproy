const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error en conexión MongoDB:', err));

app.get('/', (req, res) => {
  res.json({ message: 'Hello World desde Express y MongoDB' });
});

app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: 'Hola desde la API!' });
});

module.exports = app;
