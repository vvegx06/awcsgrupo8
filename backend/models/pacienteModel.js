// backend/models/pacienteModel.js
const { sql, pool } = require('../database'); 

const pacienteModel = {
    
    // Método necesario para el Registro
    async create({ nombre, correo, telefono }) {
        try {
            const result = await pool.request()
                .input('nombre', sql.VarChar(120), nombre)
                .input('correo', sql.VarChar(150), correo)
                .input('telefono', sql.VarChar(30), telefono || null) // El teléfono puede ser opcional
                .query(`
                    INSERT INTO pacientes (nombre, correo, telefono)
                    OUTPUT INSERTED.id, INSERTED.correo  -- Devolvemos el ID y correo
                    VALUES (@nombre, @correo, @telefono)
                `);
            
            // Si el INSERT fue exitoso, devolvemos el ID del nuevo paciente
            return { id: result.recordset[0].id, correo: result.recordset[0].correo };
            
        } catch (err) {
            // Manejar error de UNIQUE (correo duplicado)
            if (err.number === 2627) { 
                // Lanzamos un error específico que el controlador pueda capturar
                throw new Error('El correo ya existe en la base de datos de pacientes.');
            }
            console.error('Error en create Paciente:', err);
            throw err;
        }
    },
    
    // Método auxiliar (puedes implementarlo si lo necesitas después)
    async getByEmail(correo) {
        // Lógica para SELECT * FROM pacientes WHERE correo = @correo
    }
    // ...
};

module.exports = pacienteModel;
