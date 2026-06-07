const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const pool = require('../db');

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
router.post('/zajecia', body('czas').notEmpty().withMessage('Pole "czas" jest wymagane').matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Format czasy musi być HH:MM:SS (np. 09:05:00 )'), body('przedmiot_id').optional().isInt(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const {przedmiot_id, typ, czas} = req.body
        const result = await pool.query(
            'INSERT INTO zajecia (przedmiot_id, typ , czas) VALUES ($1,$2,$3) RETURNING * ',
            [
                przedmiot_id || null,
                typ || null,
                czas
            ]
        );
        res.status(201).json(result.rows[0]);
    }catch (err){
        console.error(err.message);
        if (err.constraint === 'fk_przedmiot') {
            return res.status(400).json({ error: 'Podany przedmiot_id nie istnieje' });
        }
        res.status(500).json({ error: 'Błąd serwera' });
    }
});
router.put('/zajecia/:id', async (req,res) =>{
    try{
        const { id } = req.params;
        const idNum = parseInt(id, 10);
         if(isNaN(idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
        const {przedmiot_id, typ, czas} = req.body;
        const check = await pool.query('SELECT * FROM zajecia where idzajecia = $1',[idNum]);
        if(check.rows.lenght === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        const result = await pool.query(
          'UPDATE zajecia SET przedmiot_id = $1, typ = $2, czas = $3 WHERE idzajecia = $4'
          [
              przedmiot_id || null,
              typ || null,
              czas,
              idNum
          ]
        );
        res.status(201).json(result.rows[0]);
        }catch(err){
            console.error(err.message);
            return res.status(500).json({error: 'Błąd serwera'});
        }
});
router.delete('zajecia/:id',async (req,res) =>{
    try{
        const { id } = req.params;
        const idNum = parseInt(id, 10);
        if(isNaN(idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
        const check = await pool.query('SELECT * FROM zajecia where idzajecia = $1',[idNum]);
        if(check.rows.lenght === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        const result = await pool.query('DELETE FROM zajecia * WHERE idzajecia = $1',[idNum]);
        res.json({message: 'Usunięcie recordu się udało'});
    }catch(err){
        console.error(err.message);
        return res.status(500).json({error: 'Błąd serwera'});
    }

});
module.exports = router;
