CREATE TABLE Uzytkownicy(
    id INT GENERATED ALWAYS AS IDENTITY,
    rola VARCHAR(50),
    login VARCHAR(50),
    haslo VARCHAR(50),
    PRIMARY KEY(id)
);

CREATE TABLE wykladowca(
    idwykladowca INT GENERATED ALWAYS AS IDENTITY,
    Uzytkownicy_id INT,
    imie VARCHAR(50),
    nazwisko VARCHAR(50),
    tytul_naukowy VARCHAR(50),

    PRIMARY KEY(idwykladowca),

    CONSTRAINT fk_wykladowca_uzytkownik
        FOREIGN KEY(Uzytkownicy_id)
        REFERENCES Uzytkownicy(id)
);

CREATE TABLE przedmiot(
    idprzedmiotu INT GENERATED ALWAYS AS IDENTITY,
    wykladowca_id INT,
    nazwa VARCHAR(50),
    typ VARCHAR(50),
    ilosc_godz INT,

    PRIMARY KEY(idprzedmiotu),

    CONSTRAINT fk_przedmiot_wykladowca
        FOREIGN KEY(wykladowca_id)
        REFERENCES wykladowca(idwykladowca)
);

CREATE TABLE zajecia(
    idzajecia INT GENERATED ALWAYS AS IDENTITY,
    przedmiot_id INT,
    typ VARCHAR(50),
    czas TIME NOT NULL,

    PRIMARY KEY(idzajecia),

    CONSTRAINT fk_zajecia_przedmiot
        FOREIGN KEY(przedmiot_id)
        REFERENCES przedmiot(idprzedmiotu)
);

CREATE TABLE student(
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

CREATE TABLE grupa(
    id_grupa INT GENERATED ALWAYS AS IDENTITY,
    student_id INT,
    ilosc INT,

    PRIMARY KEY(id_grupa),

    CONSTRAINT fk_grupa_student
        FOREIGN KEY(student_id)
        REFERENCES student(idstudent)
);

insert into Uzytkownicy (rola, login, haslo) values ('student', 'student', 'student');
insert into Uzytkownicy (rola, login, haslo) values ('wykladowca', 'wykladowca', 'wykladowca');
insert into Uzytkownicy (rola, login, haslo) values ('administrator', 'admin', 'admin');
insert into uzytkownicy (rola, login, haslo) values ('planista', 'planista', 'planista');