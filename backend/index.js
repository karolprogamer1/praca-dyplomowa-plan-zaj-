const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());                  // zezwala na zapytania z Reacta
app.use(express.json());         // parsowanie JSON z body

// Trasy
app.use('/api', require('./routes/zajecia'));
app.use('/api', require('./routes/wykladowca'));
app.use('/api', require('./routes/uzytkownicy'));
app.use('/api', require('./routes/student'));
app.use('/api', require('./routes/przedmiot'));
app.use('/api', require('./routes/grupa'));

// 404 dla nieznanych tras
app.use((req, res) => {
  res.status(404).json({ message: 'Nie znaleziono zasobu' });
});

// Globalny error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
