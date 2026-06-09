const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Trasy
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/zajecia'));
app.use('/api', require('./routes/wykladowca'));
app.use('/api', require('./routes/uzytkownicy'));
app.use('/api', require('./routes/student'));
app.use('/api', require('./routes/przedmiot'));
app.use('/api', require('./routes/grupa'));
app.use('/api', require('./routes/planista'));

// 404 dla nieznanych tras
app.use((req, res) => {
  res.status(404).json({ message: 'Nie znaleziono zasobu' });
});

// Obsługa błędów parsowania JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Nieprawidłowy format JSON' });
  }
  next(err);
});

// Globalny error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
