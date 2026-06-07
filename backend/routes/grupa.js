const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const pool = require('../db');

router.get('/grupa', async (req, res) =>{
    try {
        const result = await pool.query('SELECT * FROM grupa ORDER BY id_grupa');
        res.json(result.rows);
    }catch (err){
        console.error(err.message);
        res.status(500).send('Błąd servera');
    }
});
router.get('/grupa/:id', async (req, res) =>{
    try{
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if(isNaN(idNum)){
        return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
    }
    const result = await pool.query('SELECT * FROM grupa where idgrupa = $1', [idNum])
    if (result.rows.length === 0){
        return res.status(404).json({ message: 'Dany element nie istnieje'})
    }
    res.json(result.rows[0]);

    }catch (err){
        console.error(err.message);
        res.status(500).send('Błąd servera');
    }
});

router.get('/grupa/:id/:idt',async (req, res) =>{
    try{
    const { id, idt  } = req.params;
    const idNum = parseInt(id, 10);
    const idtNum = parseInt(idt, 10);
    if(isNaN(idtNum || idNum)){
            return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
    }
    const result = await pool.query('SELECT * FROM grupa where id_grupa >= $1 and id_grupa <= $2',[idNum,idtNum])
    if (result.rows.length === 0){
        return res.status(404).json({ message: 'W tym przedziale nie ma elementów'})
    }
    res.json(result.rows);
    }catch (err){
        console.error(err.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});
router.post('/grupa',  async (req, res) => {
    try{
        const {przedmiot_id, typ, czas} = req.body
        const result = await pool.query(
            'INSERT INTO grupa (student_zajecia_id, student_id , ilosc) VALUES($1,$2,$3) RETURNING *',
            [
                student_zajecia_id,
                student_id,
                ilosc || Null
            ]
        );
        res.status(201).json(result.rows[0]);
    }catch (err){
        console.error(err.message);
        if (err.constraint === 'fk_zajecia' || 'fk_student_id') {
            return res.status(400).json({ error: 'Podana wartość nie istnieje' });
        }
        res.status(500).json({ error: 'Błąd serwera' });
    }
});
router.put('/grupa/:id', async (req,res) =>{
    try{
        const { id } = req.params;
        const idNum = parseInt(id, 10);
        if(isNaN(idNum)){
        return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
        const {przedmiot_id, typ, czas} = req.body;
        const check = await pool.query('SELECT * FROM grupa where id_grupa = $1',[idNum]);
        if(check.rows.lenght === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        const result = await pool.query(
          'UPDATE grupa SET student_zajecia_id = $1, student_id = $2 , ilosc = $3 WHERE id_grupa = $4'
          [
              student_zajecia_id,
              student_id,
              ilosc || Null
          ]
        );
        res.status(201).json(result.rows[0]);
        }catch(err){
            console.error(err.message);
            if (err.constraint === 'fk_zajecia' || 'fk_student_id') {
            return res.status(400).json({ error: 'Podana wartość nie istnieje' });
            }
            return res.status(500).json({error: 'Błąd serwera'});
        }
});
router.delete('/grupa/:id',async (req,res) =>{
    try{
        const { id } = req.params;
        const idNum = parseInt(id, 10);
        if(isNaN(idNum)){
        return res.status(400).json({error: 'Parametr id musi być liczbą całkowitą'})
        }
        const check = await pool.query('SELECT * FROM grupa where id_grupa = $1',[idNum]);
        if(check.rows.lenght === 0) {
            return res.status(404).json({message:'Nie znaleziono rekordu'})
        }
        const result = await pool.query('DELETE FROM grupa * WHERE id_grupa = $1',[idNum]);
        res.json({message: 'Usunięcie recordu się udało'});
    }catch(err){
        console.error(err.message);
        return res.status(500).json({error: 'Błąd serwera'});
    }

});
module.exports = router;
