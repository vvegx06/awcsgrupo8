--Este archivo se utilizara para agregar datos de prueba a la base de datos o tambien datos que consideramos
-- de importancia

--Ejemplo de insert a la tabala pacientes
INSERT INTO pacientes (nombre, correo, telefono) VALUES
('Josue Francisco Valverde','jvalverde40358@gmail.com','8888-1258');
GO

TRUNCATE TABLE PERSONAL_APP;
DBCC CHECKIDENT ('PERSONAL_APP', RESEED, 0);

ALTER TABLE PERSONAL_APP
ALTER COLUMN Password VARCHAR(255) NOT NULL;


DELETE FROM PERSONAL_APP WHERE Usuario = 'admin@admin.com';
