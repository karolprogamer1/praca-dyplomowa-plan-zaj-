const pool = require('./db');
const sql = `
CREATE TABLE IF NOT EXISTS student(
    idstudent INT GENERATED ALWAYS AS IDENTITY,
    zajecia_id INT,
    Uzytkownicy_id INT,
    nr_albumu INT,

    PRIMARY KEY(idstudent),

    CONSTRAINT fk_student_uzytkownik
        FOREIGN KEY(Uzytkownicy_id)
        REFERENCES Uzytkownicy(id),

    CONSTRAINT fk_student_zajecia
        FOREIGN KEY(zajecia_id)
        REFERENCES zajecia(idzajecia)
);

CREATE TABLE IF NOT EXISTS grupa(
    id_grupa INT GENERATED ALWAYS AS IDENTITY,
    student_id INT,
    ilosc INT,

    PRIMARY KEY(id_grupa),

    CONSTRAINT fk_grupa_student
        FOREIGN KEY(student_id)
        REFERENCES student(idstudent)
);
`;

pool.query(sql)
  .then(() => { console.log('Tables created'); process.exit(0); })
  .catch(err => { console.error('Error creating tables:', err.message); process.exit(1); });
