require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
});
(async () => {
  try {
    const students = await pool.query('SELECT s.idstudent, s.nr_albumu, s.uzytkownicy_id, u.login FROM student s LEFT JOIN uzytkownicy u ON s.uzytkownicy_id = u.id ORDER BY s.idstudent');
    console.log('STUDENTS');
    console.log(JSON.stringify(students.rows, null, 2));
    const users = await pool.query('SELECT * FROM uzytkownicy ORDER BY id');
    console.log('USERS');
    console.log(JSON.stringify(users.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();