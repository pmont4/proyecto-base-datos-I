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