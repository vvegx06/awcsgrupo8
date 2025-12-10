-- ================================
-- 1. TABLA ROLES
-- ================================
CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);
GO

-- ================================
-- 2. TABLA ODONTOLOGOS
-- ================================
CREATE TABLE odontologos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    especialidad VARCHAR(120),
    correo VARCHAR(150),
    telefono VARCHAR(30),
    creado_en DATETIME DEFAULT GETDATE()
);
GO

-- ================================
-- 3. TABLA PACIENTES
-- ================================
CREATE TABLE pacientes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    creado_en DATETIME DEFAULT GETDATE()
);
GO

-- ================================
-- 4. TABLA PERSONAL_APP
-- ================================
CREATE TABLE personal_app (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_rol INT NOT NULL,
    id_referencia INT NULL,
    usuario VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(120),
    activo BIT DEFAULT 1,
    creado_en DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (id_rol) REFERENCES roles(id)
);
GO

-- ================================
-- 5. TABLA CITAS
-- ================================
CREATE TABLE citas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_odontologo INT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    servicio VARCHAR(150),
    estado VARCHAR(20) DEFAULT 'Programada',
    observaciones VARCHAR(MAX),
    creado_en DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (id_paciente) REFERENCES pacientes(id),
    FOREIGN KEY (id_odontologo) REFERENCES odontologos(id)
);
GO

-- ================================================================
-- POBLACIÓN DE DATOS (INSERTS)
-- ================================================================

-- Roles
INSERT INTO roles (nombre_rol) VALUES
('Administrador'),
('Odontólogo'),
('Recepcionista'),
('Paciente');
GO

-- Odontólogos
INSERT INTO odontologos (nombre, especialidad, correo, telefono)
VALUES
('Dr. John Vega R.','General','jvega@clinicadental.com','8888-0000'),
('Dra. Sofía Jiménez','Ortodoncia','sjimenez@clinicadental.com','8888-0001'),
('Dra. Bárbara Soto','Periodoncia','bsoto@clinicadental.com','8888-0002');
GO

-- Personal APP
INSERT INTO personal_app (id_rol, id_referencia, usuario, password, nombre)
VALUES
(2, 1, 'jvega', '$2y$10$Q1K8vZ9fQJQ6oN4pZbR8ge.2x0QkFzQ8pM1tD1Lq8kqXUoYKdGJ7K', 'Dr. John Vega R.');

INSERT INTO personal_app (id_rol, id_referencia, usuario, password, nombre)
VALUES
(2, 3, 'barbara', '$2y$10$Q1K8vZ9fQJQ6oN4pZbR8ge.2x0QkFzQ8pM1tD1Lq8kqXUoYKdGJ7K', 'Dra. Bárbara Soto');

INSERT INTO personal_app (id_rol, usuario, password, nombre)
VALUES
(3, 'recepcion', '$2y$10$Q1K8vZ9fQJQ6oN4pZbR8ge.2x0QkFzQ8pM1tD1Lq8kqXUoYKdGJ7K', 'Laura Recepción');
GO

-- Pacientes
INSERT INTO pacientes (nombre, correo, telefono) VALUES
('Borbón Arias Angie','aborbon70131@ufide.ac.cr','8888-1234'),
('Alfaro Quesada Luis','lalfa70119@ufide.ac.cr','8888-2345');
GO

-- Cita ejemplo
INSERT INTO citas (id_paciente, id_odontologo, fecha, hora, servicio, estado)
VALUES (1, 1, DATEADD(DAY, 2, CAST(GETDATE() AS DATE)), '10:00:00', 'Consulta General', 'Programada');
GO
