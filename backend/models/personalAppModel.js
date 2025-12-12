const { sql, pool } = require('../database'); 
const bcrypt = require('bcrypt');

const personalAppModel = {

    // =======================================================
    // 1. OBTENER UN USUARIO POR SU NOMBRE DE USUARIO (PARA LOGIN)
    // =======================================================
    async getByUsername(usuario) {
        console.log(`Buscando usuario en DB: ${usuario}`); // DEBUGGING 1
        try {
            // 🌟 CORRECCIÓN 1: Convertir la entrada a minúsculas
            const usuarioMinusculas = usuario.toLowerCase(); 
            
            const result = await pool.request()
                // Usamos el valor en minúsculas para el parámetro
                .input('usuario', sql.VarChar(80), usuarioMinusculas)
                .query(`
                    SELECT 
                        pa.id, pa.id_rol, pa.id_referencia, pa.usuario, pa.password, 
                        pa.nombre, pa.activo, pa.creado_en,
                        r.nombre_rol
                    FROM personal_app pa
                    JOIN roles r ON r.id = pa.id_rol
                    -- 🌟 CORRECCIÓN 2: Forzamos la columna de la DB a minúsculas para la comparación
                    WHERE LOWER(pa.usuario) = @usuario AND pa.activo = 1
                `);
            
            // DEBUGGING
            console.log('Resultado del recordset (longitud):', result.recordset.length);
            console.log('Registro encontrado (si existe):', result.recordset[0]);
            
            // Devuelve el primer resultado
            return result.recordset[0]; 
        } catch (err) {
            console.error('Error en getByUsername:', err);
            throw err;
        }
    },

    // =======================================================
    // 2. CREAR UN NUEVO REGISTRO DE PERSONAL (EJ: RECEPCIONISTA/PACIENTE/ADMIN)
    // =======================================================
    async create(data) {
        try {
            let passwordToSave = data.password;

            // 🌟 CORRECCIÓN: Evitar el doble hashing si ya viene un hash de bcrypt del seeder
            if (!passwordToSave.startsWith('$2b$')) {
                passwordToSave = await bcrypt.hash(data.password, 10);
            } 
            
            const result = await pool.request()
                .input('id_rol', sql.Int, data.id_rol)
                .input('id_referencia', sql.Int, data.id_referencia || null)
                .input('usuario', sql.VarChar(80), data.usuario)
                .input('password', sql.VarChar(255), passwordToSave) // Usamos el hash validado
                .input('nombre', sql.VarChar(120), data.nombre)
                .query(`
                    INSERT INTO personal_app (id_rol, id_referencia, usuario, password, nombre)
                    OUTPUT INSERTED.id
                    VALUES (@id_rol, @id_referencia, @usuario, @password, @nombre)
                `);

            return { id: result.recordset[0].id, nombre: data.nombre };

        } catch (err) {
            if (err.number === 2627) { 
                throw new Error('El nombre de usuario ya existe.');
            }
            console.error('Error en create PersonalApp:', err);
            throw err;
        }
    }
    // ... otros métodos (getAll, update, delete)
};

module.exports = personalAppModel;
