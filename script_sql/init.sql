CREATE DATABASE proyecto_umg;
USE proyecto_umg;

CREATE TABLE Carrera (
    IdCarrera INT IDENTITY(1,1) PRIMARY KEY,
    Codigo VARCHAR(10) UNIQUE NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Facultad NVARCHAR(100) NOT NULL
);

CREATE TABLE Docente (
    IdDocente INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL,
    Apellido NVARCHAR(50) NOT NULL,
    Especialidad NVARCHAR(100),
    Telefono VARCHAR(20),
    Correo VARCHAR(255) UNIQUE
);

CREATE TABLE Curso (
    IdCurso INT IDENTITY(1,1) PRIMARY KEY,
    CodigoCurso VARCHAR(20) UNIQUE NOT NULL,
    NombreCurso NVARCHAR(100) NOT NULL,
    Creditos TINYINT NOT NULL CHECK (Creditos > 0)
);
GO

CREATE TABLE Estudiante (
    IdEstudiante INT IDENTITY(1,1) PRIMARY KEY,
    Carnet VARCHAR(20) UNIQUE NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    Apellido NVARCHAR(50) NOT NULL,
    IdCarrera INT NOT NULL,
    Telefono VARCHAR(20),
    Correo VARCHAR(255) UNIQUE,
    CONSTRAINT FK_Estudiante_Carrera FOREIGN KEY (IdCarrera) REFERENCES Carrera(IdCarrera)
);
GO

CREATE TABLE Seccion (
    IdSeccion INT IDENTITY(1,1) PRIMARY KEY,
    IdCurso INT NOT NULL,
    IdDocente INT NOT NULL,
    CicloAcademico VARCHAR(10) NOT NULL, -- Formato: '2026-01'
    SeccionCodigo VARCHAR(5) NOT NULL,   -- Ej: 'A'
    CupoMaximo INT NOT NULL CHECK (CupoMaximo > 0),
    CONSTRAINT FK_Seccion_Curso FOREIGN KEY (IdCurso) REFERENCES Curso(IdCurso),
    CONSTRAINT FK_Seccion_Docente FOREIGN KEY (IdDocente) REFERENCES Docente(IdDocente),
    CONSTRAINT UQ_Seccion_Ciclo UNIQUE (IdCurso, CicloAcademico, SeccionCodigo)
);

CREATE TABLE SeccionHorario (
    IdSeccionHorario INT IDENTITY(1,1) PRIMARY KEY,
    IdSeccion INT NOT NULL,
    DiaSemana TINYINT NOT NULL CHECK (DiaSemana BETWEEN 1 AND 7),
    HoraInicio TIME NOT NULL,
    HoraFin TIME NOT NULL,
    Aula VARCHAR(20) NOT NULL,
    CONSTRAINT FK_SeccionHorario_Seccion FOREIGN KEY (IdSeccion) REFERENCES Seccion(IdSeccion),
    CONSTRAINT CHK_HorarioValido CHECK (HoraInicio < HoraFin)
);
GO

CREATE TABLE Matricula (
    IdMatricula INT IDENTITY(1,1) PRIMARY KEY,
    IdEstudiante INT NOT NULL,
    IdSeccion INT NOT NULL,
    FechaInscripcion DATETIME NOT NULL DEFAULT GETDATE(),
    Estado VARCHAR(20) NOT NULL CHECK (Estado IN ('ACTIVA', 'CONGELADA', 'BAJA')),
    CONSTRAINT FK_Matricula_Estudiante FOREIGN KEY (IdEstudiante) REFERENCES Estudiante(IdEstudiante),
    CONSTRAINT FK_Matricula_Seccion FOREIGN KEY (IdSeccion) REFERENCES Seccion(IdSeccion),
    CONSTRAINT UQ_Matricula_Estudiante_Seccion UNIQUE (IdEstudiante, IdSeccion)
);

CREATE TABLE Pago (
    IdPago INT IDENTITY(1,1) PRIMARY KEY,
    IdMatricula INT NOT NULL,
    Monto DECIMAL(10,2) NOT NULL CHECK (Monto > 0),
    MetodoPago VARCHAR(30) NOT NULL CHECK (MetodoPago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
    FechaPago DATETIME NOT NULL DEFAULT GETDATE(),
    ReferenciaTransaccion VARCHAR(100),
    CONSTRAINT FK_Pago_Matricula FOREIGN KEY (IdMatricula) REFERENCES Matricula(IdMatricula)
);
GO

INSERT INTO Carrera (Codigo, Nombre, Facultad)
VALUES 
    ('ING-01', N'Ingeniería en Sistemas', N'FACULTAD_INGENIERIA'),
    ('ING-02', N'Ingeniería Industrial', N'FACULTAD_INGENIERIA'),
    ('ARQ-01', N'Arquitectura', N'FACULTAD_ARQUITECTURA'),
    ('DER-01', N'Ciencias Jurídicas y Sociales', N'FACULTAD_DERECHO'),
    ('MED-01', N'Medicina', N'FACULTAD_CIENCIAS_MEDICAS');

SELECT * FROM carrera;

UPDATE Carrera SET Facultad = N'FACULTAD_INGENIERIA' WHERE IdCarrera IN (1, 2);
UPDATE Carrera SET Facultad = N'FACULTAD_ARQUITECTURA' WHERE IdCarrera IN (3);
UPDATE Carrera SET Facultad = N'FACULTAD_DERECHO' WHERE IdCarrera IN (4);
UPDATE Carrera SET Facultad = N'FACULTAD_CIENCIAS_MEDICAS' WHERE IdCarrera IN (5);

INSERT INTO Docente (Nombre, Apellido, Especialidad, Telefono, Correo)
VALUES 
    (N'Carlos', N'Mendoza', N'Bases de Datos', '5555-1001', 'cmendoza@umg.edu.gt'),
    (N'Ana', N'Juárez', N'Física Cuántica', '5555-1002', 'ajuarez@umg.edu.gt'),
    (N'Luis', N'Pérez', N'Derecho Constitucional', '5555-1003', 'lperez@umg.edu.gt'),
    (N'María', N'Gómez', N'Anatomía Descriptiva', '5555-1004', 'mgomez@umg.edu.gt'),
    (N'Jorge', N'López', N'Investigación de Operaciones', '5555-1005', 'jlopez@umg.edu.gt');

INSERT INTO Curso (CodigoCurso, NombreCurso, Creditos)
VALUES 
    ('SIS-101', N'Bases de Datos I', 5),
    ('FIS-201', N'Física I', 4),
    ('DER-301', N'Derecho Penal', 4),
    ('MED-401', N'Anatomía Humana', 6),
    ('IND-501', N'Estadística Aplicada', 5);

-- 2. Entidades Secundarias (Dependen de Catálogos Base)
-- Requiere: IdCarrera existente (1 a 5)
INSERT INTO Estudiante (Carnet, Nombre, Apellido, IdCarrera, Telefono, Correo)
VALUES 
    ('0900-26-0001', N'Pedro', N'Alvarado', 1, '4444-2001', 'palvarado@alumnos.umg.gt'),
    ('0900-26-0002', N'Sofía', N'Castro', 2, '4444-2002', 'scastro@alumnos.umg.gt'),
    ('0900-26-0003', N'Miguel', N'Ruiz', 3, '4444-2003', 'mruiz@alumnos.umg.gt'),
    ('0900-26-0004', N'Lucía', N'Navarro', 4, '4444-2004', 'lnavarro@alumnos.umg.gt'),
    ('0900-26-0005', N'Roberto', N'Morales', 5, '4444-2005', 'rmorales@alumnos.umg.gt');

-- Requiere: IdCurso (1 a 5), IdDocente (1 a 5)
INSERT INTO Seccion (IdCurso, IdDocente, CicloAcademico, SeccionCodigo, CupoMaximo)
VALUES 
    (1, 1, '2026-01', 'A', 35),
    (2, 2, '2026-01', 'A', 40),
    (3, 3, '2026-01', 'B', 30),
    (4, 4, '2026-01', 'A', 25),
    (5, 5, '2026-01', 'C', 45);

-- 3. Entidades de Detalle Operativo (Dependen de Secciones)
-- Requiere: IdSeccion (1 a 5)
INSERT INTO SeccionHorario (IdSeccion, DiaSemana, HoraInicio, HoraFin, Aula)
VALUES 
    (1, 1, '18:00:00', '20:00:00', 'T1-101'), -- Lunes
    (2, 3, '07:00:00', '09:00:00', 'T2-205'), -- Miércoles
    (3, 5, '10:00:00', '12:00:00', 'T3-301'), -- Viernes
    (4, 2, '14:00:00', '17:00:00', 'LAB-MED'), -- Martes
    (5, 6, '09:00:00', '11:00:00', 'T1-102'); -- Sábado

-- 4. Entidades Transaccionales (Dependen de Estudiante y Seccion)
-- Requiere: IdEstudiante (1 a 5), IdSeccion (1 a 5)
INSERT INTO Matricula (IdEstudiante, IdSeccion, FechaInscripcion, Estado)
VALUES 
    (1, 1, '2026-01-15 08:30:00', 'ACTIVA'),
    (2, 5, '2026-01-15 09:15:00', 'ACTIVA'),
    (3, 2, '2026-01-16 14:20:00', 'CONGELADA'),
    (4, 3, '2026-01-17 11:00:00', 'ACTIVA'),
    (5, 4, '2026-01-18 16:45:00', 'ACTIVA');

-- Requiere: IdMatricula (1 a 5)
INSERT INTO Pago (IdMatricula, Monto, MetodoPago, FechaPago, ReferenciaTransaccion)
VALUES 
    (1, 550.00, 'TRANSFERENCIA', '2026-01-15 08:35:00', 'REF-909012'),
    (2, 600.00, 'TARJETA', '2026-01-15 09:20:00', 'AUTH-8844'),
    (3, 550.00, 'EFECTIVO', '2026-01-16 14:25:00', 'REC-100234'),
    (4, 700.00, 'TRANSFERENCIA', '2026-01-17 11:05:00', 'REF-909331'),
    (5, 800.00, 'TARJETA', '2026-01-18 16:50:00', 'AUTH-9921');
GO