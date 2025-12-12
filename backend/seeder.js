// backend/seeder.js
const bcrypt = require('bcrypt');
const { connectDB, sql, pool } = require('./database'); 
const PersonalAppModel = require('./models/personalAppModel'); 

// 🚨 CONFIGURACIÓN DE LAS CREDENCIALES DEL ADMINISTRADOR (¡Cámbialas!)
const ADMIN_USER = 'admin@admin.com';
const ADMIN_PASSWORD = 'Admin123*'; 
const ADMIN_NOMBRE = 'Administrador Maestro';
const ROL_NOMBRE = 'Administrador';

async function seedAdminUser() {
    console.log('--- Iniciando Seeder de Administrador ---');
    
    try {
        await connectDB();
        console.log('Conexión a DB exitosa.');

        // =======================================================
        // A. ASEGURAR EL ROL DE ADMINISTRADOR
        // =======================================================
        
        let rolResult = await pool.request()
            .input('rolNombre', sql.VarChar(50), ROL_NOMBRE) 
            .query(`SELECT Id FROM ROLES WHERE Nombre_Rol = @rolNombre`);
            
        let idRolAdmin = rolResult.recordset.length > 0 ? rolResult.recordset[0].Id : null;

        if (!idRolAdmin) {
            console.log(`Rol '${ROL_NOMBRE}' no encontrado. Insertando...`);
            
            let insertRol = await pool.request()
                .input('rolNombre', sql.VarChar(50), ROL_NOMBRE)
                .query(`
                    INSERT INTO ROLES (Nombre_Rol, Descripcion)
                    OUTPUT inserted.Id
                    VALUES (@rolNombre, 'Acceso total al sistema y gestión.');
                `);
            
            idRolAdmin = insertRol.recordset[0].Id;
            console.log(`Rol Administrador creado con ID: ${idRolAdmin}`);
        } else {
            console.log(`Rol Administrador encontrado con ID: ${idRolAdmin}`);
        }

        // =======================================================
        // B. ASEGURAR EL USUARIO ADMINISTRADOR
        // =======================================================

        const existingAdmin = await PersonalAppModel.getByUsername(ADMIN_USER); 
        
        if (existingAdmin) {
            console.log(`✅ El usuario Administrador (${ADMIN_USER}) ya existe. Saltando inserción.`);
            return;
        }

        // 3. Generar el Hash de la Contraseña (¡SOLO UNA VEZ!)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
        console.log('Hash de contraseña generado.');

        // 4. Crear el Registro en la tabla PERSONAL_APP
        // El modelo NO lo hasheará de nuevo debido a la corrección
        await PersonalAppModel.create({
            id_rol: idRolAdmin, 
            id_referencia: 0, 
            usuario: ADMIN_USER,
            password: hashedPassword, // Pasa el hash completo
            nombre: ADMIN_NOMBRE
        });

        console.log(`🎉 Usuario Administrador creado exitosamente con rol ID ${idRolAdmin}.`);

    } catch (error) {
        console.error('❌ ERROR GRAVE durante la ejecución del Seeder:', error.message);
        console.log('Verifica la longitud de la columna Password (VARCHAR(255)) en SQL Server.');
    } finally {
        console.log('--- Seeder Finalizado ---');
    }
}

seedAdminUser();

