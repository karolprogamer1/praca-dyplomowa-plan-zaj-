const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/student', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT s.idstudent, s.nr_albumu, s.zajecia_id, s.uzytkownicy_id, s.imie, s.nazwisko, u.login AS user_login FROM student s LEFT JOIN uzytkownicy u ON s.uzytkownicy_id = u.id ORDER BY s.idstudent'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'Parametr id musi być liczbą całkowitą' });
    }
    const result = await pool.query(
      'SELECT s.idstudent, s.nr_albumu, s.zajecia_id, s.uzytkownicy_id, s.imie, s.nazwisko, u.login AS user_login FROM student s LEFT JOIN uzytkownicy u ON s.uzytkownicy_id = u.id WHERE s.idstudent = $1',
      [idNum]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Dany element nie istnieje' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/student', async (req, res) => {
  try {
    const { nr_albumu, zajecia_id, uzytkownicy_id, imie, nazwisko } = req.body;
    const studentNumber = nr_albumu == null || nr_albumu === '' ? null : Number(nr_albumu);
    if (nr_albumu != null && nr_albumu !== '' && Number.isNaN(studentNumber)) {
      return res.status(400).json({ error: 'Numer albumu musi być liczbą' });
    }

    // jeśli podane id referencyjne nie istnieją, ustaw je na null (nie blokujemy tworzenia studenta)
    let validZajeciaId = null;
    if (zajecia_id != null) {
      const z = await pool.query('SELECT 1 FROM zajecia WHERE idzajecia = $1', [zajecia_id]);
      if (z.rows.length > 0) validZajeciaId = zajecia_id;
    }
    let validUzytkownicyId = null;
    if (uzytkownicy_id != null) {
      const u = await pool.query('SELECT 1 FROM Uzytkownicy WHERE id = $1', [uzytkownicy_id]);
      if (u.rows.length > 0) validUzytkownicyId = uzytkownicy_id;
    }

    const result = await pool.query(
      'INSERT INTO student (zajecia_id, Uzytkownicy_id, nr_albumu, imie, nazwisko) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [validZajeciaId, validUzytkownicyId, studentNumber, imie || null, nazwisko || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Podany klucz obcy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'Parametr id musi być liczbą całkowitą' });
    }
    const { nr_albumu, zajecia_id, uzytkownicy_id, imie, nazwisko } = req.body;
    const studentNumber = nr_albumu == null || nr_albumu === '' ? null : Number(nr_albumu);
    if (nr_albumu != null && nr_albumu !== '' && Number.isNaN(studentNumber)) {
      return res.status(400).json({ error: 'Numer albumu musi być liczbą' });
    }

    const check = await pool.query('SELECT * FROM student WHERE idstudent = $1', [idNum]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono rekordu' });
    }
    // jeśli podane id referencyjne nie istnieją, ustaw je na null (nie blokujemy aktualizacji studenta)
    let validZajeciaIdUpd = null;
    if (zajecia_id != null) {
      const z = await pool.query('SELECT 1 FROM zajecia WHERE idzajecia = $1', [zajecia_id]);
      if (z.rows.length > 0) validZajeciaIdUpd = zajecia_id;
    }
    let validUzytkownicyIdUpd = null;
    if (uzytkownicy_id != null) {
      const u = await pool.query('SELECT 1 FROM Uzytkownicy WHERE id = $1', [uzytkownicy_id]);
      if (u.rows.length > 0) validUzytkownicyIdUpd = uzytkownicy_id;
    }

    const result = await pool.query(
      'UPDATE student SET zajecia_id = $1, Uzytkownicy_id = $2, nr_albumu = $3, imie = $4, nazwisko = $5 WHERE idstudent = $6 RETURNING *',
      [validZajeciaIdUpd, validUzytkownicyIdUpd, studentNumber, imie || null, nazwisko || null, idNum]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Podany klucz obcy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.delete('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'Parametr id musi być liczbą całkowitą' });
    }
    const check = await pool.query('SELECT * FROM student WHERE idstudent = $1', [idNum]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono rekordu' });
    }
    await pool.query('DELETE FROM student WHERE idstudent = $1', [idNum]);
    res.json({ message: 'Usunięcie rekordu się udało' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
