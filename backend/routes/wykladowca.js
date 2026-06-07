const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const pool = require('../db');

router.get('/wykladowca', async (req, res) =>{
    try {
        const result = await pool.query('SELECT * FROM wykladowca ORDER BY idwykladowca');
        res.json(result.rows);
    }catch (err){
        console.error(err.message);
        res.status(500).send('Błąd servera');
    }
});
router.get('/wykladowca/:id', async (req, res) =>{
    try{
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    const result = await pool.query('SELECT * FROM wykladowca where idwykladowca = $1', [idNum])
    if (result.rows.length === 0){
        return res.status(404).json({ message: 'Dany element nie istnieje'})
    }
    res.json(result.rows[0]);

    }catch (err){
        console.error(err.message);
        res.status(500).send('Błąd servera');
    }
});

router.get('/wykladowca/:id/:idt',async (req, res) =>{
    try{
    const { id, idt  } = req.params;
    const idNum = parseInt(id, 10);
    const idtNum = parseInt(idt, 10);
     if(isNaN(idtNum || idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
    const result = await pool.query('SELECT * FROM wykladowca where idwykladowca  >= $1 and idwykladowca <= $2',[idNum,idtNum])
    if (result.rows.length === 0){
        return res.status(404).json({ message: 'W tym przedziale nie ma elementów'})
    }
    res.json(result.rows);
    }catch (err){
        console.error(err.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});
router.post('/wykladowca',  async (req, res) => {
    try{
        const {uzytkownicy_id, imie, nazwisko, tytul_naukowy} = req.body
        const result = await pool.query(
            'INSERT INTO wykladowca (uzytkownicy_id, imie, nazwisko, tytul_naukowy) VALUES($1,$2,$3,$4)RETURNING *',
            [
                uzytkownicy_id || null,
                imie || null,
                nazwisko || null,
                tytul_naukowy || null,
            ]
        );
        res.status(201).json(result.rows[0]);
    }catch (err){
        console.error(err.message);
        if (err.constraint === 'fk_uzytkownicy') {
            return res.status(400).json({ error: 'Podany uzytkownic nie istnieje' });
        }
        res.status(500).json({ error: 'Błąd serwera' });
    }
});
router.put('/wykladowca/:id', async (req,res) =>{
    try{
        const { id } = req.params;
        const {uzytkownicy_id, imie, nazwisko, tytul_naukowy} = req.body;
        const check = await pool.query('SELECT * FROM wykladowca where idwykladowca = $1',[id]);
        if(check.rows.lenght === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        const result = await pool.query(
          'UPDATE wykladowca SET uzytkownicy_id = $1, imie = $2, nazwisko = $3 , tytul_naukowy = $4 WHERE idwykladowca = $5'
          [
              uzytkownicy_id ,
              imie || null,
              nazwisko || null,
              tytul_naukowy || null
          ]
        );
        res.status(201).json(result.rows[0]);
        }catch(err){
            console.error(err.message);
             if (err.constraint === 'fk_uzytkownicy') {
            return res.status(400).json({ error: 'Podany uzytkownic nie istnieje' });
            }
            return res.status(500).json({error: 'Błąd serwera'});
        }
});
router.delete('/wykladowca/:id',async (req,res) =>{
    try{
        const { id } = req.params;
        const check = await pool.query('SELECT * FROM wykladowca where idwykladowca = $1',[id]);
        if(check.rows.lenght === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        const result = await pool.query('DELETE FROM wykladowca * WHERE idwykladowca = $1',[id]);
        res.json({message: 'Usunięcie recordu się udało'});
    }catch(err){
        console.error(err.message);
        return res.status(500).json({error: 'Błąd serwera'});
    }

});
module.exports = router;
