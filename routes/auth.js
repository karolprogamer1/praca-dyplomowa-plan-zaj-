const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
    }

    const result = await pool.query(
      'SELECT id, rola, login FROM uzytkownicy WHERE login = $1 AND haslo = $2 AND lower(rola) = lower($3)',
      [username, password, role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Nieprawidłowy login, hasło lub rola' });
    }

    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.error('Auth login error:', err);
    if (err.code === '28P01') {
      return res.status(500).json({ message: 'Błąd uwierzytelniania bazy danych. Sprawdź backend/.env.' });
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.status(500).json({ message: 'Nie można połączyć z serwerem bazy danych. Sprawdź backend/.env.' });
    }
    res.status(500).json({ message: 'Błąd serwera podczas logowania' });
  }
});

module.exports = router;
