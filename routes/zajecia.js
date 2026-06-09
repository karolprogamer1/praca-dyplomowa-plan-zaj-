const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const pool = require('../db');

const normalizeTime = (time) => {
  if (typeof time !== 'string') return time
  const trimmed = time.trim()
  const hhmm = /^([01]\d|2[0-3]):([0-5]\d)$/
  const hhmmss = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
  if (hhmmss.test(trimmed)) return trimmed
  if (hhmm.test(trimmed)) return `${trimmed}:00`
  return trimmed
}

const validateClassTime = [
  body('czas')
    .notEmpty().withMessage('Pole "czas" jest wymagane')
    .custom((value) => {
      const normalized = normalizeTime(value)
      const isValid = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(normalized)
      if (!isValid) {
        throw new Error('Format czasu musi być HH:MM lub HH:MM:SS (np. 09:05 lub 09:05:00)')
      }
      return true
    }),
  body('przedmiot_id').optional().isInt().withMessage('Pole "przedmiot_id" musi być liczbą całkowitą'),
]

router.get('/test', (req, res) => res.send('route works'));
router.get('/zajecia', async (req, res) =>{
    try {
        const result = await pool.query('SELECT * FROM zajecia ORDER BY idzajecia');
        res.json(result.rows);
    }catch (err){
        console.error(err.message);
        res.status(500).send('Błąd servera');
    }
});
router.get('/zajecia/:id', async (req, res) =>{
    try{
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if(isNaN(idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
    }
    const result = await pool.query('SELECT * FROM zajecia where idzajecia = $1', [idNum])
    if (result.rows.length === 0){
        return res.status(404).json({ message: 'Dany element nie istnieje'})
    }
    res.json(result.rows[0]);

    }catch (err){
        console.error(err.message);
        res.status(500).send('Błąd servera');
    }
});

router.get('/zajecia/:id/:idt',async (req, res) =>{
    try{
    const { id, idt  } = req.params;
    const idNum = parseInt(id, 10);
    const idtNum = parseInt(idt, 10);
     if(isNaN(idtNum || idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
    const result = await pool.query('SELECT * FROM zajecia where idzajecia >= $1 and idzajecia <= $2',[idNum,idtNum])
    if (result.rows.length === 0){
        return res.status(404).json({ message: 'W tym przedziale nie ma elementów'})
    }
    res.json(result.rows);
    }catch (err){
        console.error(err.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});
router.post('/zajecia', validateClassTime, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        let {przedmiot_id, typ, czas} = req.body
        // jeśli podano przedmiot_id — sprawdź czy istnieje
        if (przedmiot_id != null) {
            const chk = await pool.query('SELECT 1 FROM przedmiot WHERE idprzedmiotu = $1', [przedmiot_id])
            if (chk.rows.length === 0) {
                return res.status(400).json({ error: `Przedmiot o id ${przedmiot_id} nie istnieje` })
            }
        }
        czas = normalizeTime(czas)
        const result = await pool.query(
            'INSERT INTO zajecia (przedmiot_id, typ , czas) VALUES ($1,$2,$3) RETURNING *',
            [przedmiot_id || null, typ || null, czas]
        );
        res.status(201).json(result.rows[0]);
    }catch (err){
        console.error(err.message);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Niepoprawny klucz obcy' });
        }
        res.status(500).json({ error: 'Błąd serwera' });
    }
});
router.put('/zajecia/:id', validateClassTime, async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
        const { id } = req.params;
        const idNum = parseInt(id, 10);
         if(isNaN(idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
        let {przedmiot_id, typ, czas} = req.body;
        const check = await pool.query('SELECT * FROM zajecia WHERE idzajecia = $1',[idNum]);
        if(check.rows.length === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        if (przedmiot_id != null) {
            const chk = await pool.query('SELECT 1 FROM przedmiot WHERE idprzedmiotu = $1', [przedmiot_id])
            if (chk.rows.length === 0) {
                return res.status(400).json({ error: `Przedmiot o id ${przedmiot_id} nie istnieje` })
            }
        }
        czas = normalizeTime(czas)
        const result = await pool.query(
          'UPDATE zajecia SET przedmiot_id = $1, typ = $2, czas = $3 WHERE idzajecia = $4 RETURNING *',
          [przedmiot_id || null, typ || null, czas || null, idNum]
        );
        res.json(result.rows[0]);
        }catch(err){
            console.error(err.message);
            return res.status(500).json({error: 'Błąd serwera'});
        }
});
router.delete('/zajecia/:id',async (req,res) =>{
    try{
        const { id } = req.params;
        const idNum = parseInt(id, 10);
        if(isNaN(idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
        const check = await pool.query('SELECT * FROM zajecia WHERE idzajecia = $1',[idNum]);
        if(check.rows.length === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        await pool.query('DELETE FROM zajecia WHERE idzajecia = $1',[idNum]);
        res.json({message: 'Usunięcie rekordu się udało'});
    }catch(err){
        console.error(err.message);
        return res.status(500).json({error: 'Błąd serwera'});
    }

});
module.exports = router;
