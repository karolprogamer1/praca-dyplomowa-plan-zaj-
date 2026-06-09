const pool = require('./db');

(async () => {
  try {
    const res = await pool.query(`SELECT current_database() as db, current_user as user`);
    console.log('DB OK:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('DB ERROR:', err.code, err.message);
    process.exit(1);
  }
})();
