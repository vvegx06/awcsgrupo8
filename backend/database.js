// backend/database.js
const sql = require('mssql'); // <--- ¡Esta línea faltaba o fue eliminada!

// Configuración de la conexión a SQL Server
// **NOTA:** Reemplaza los placeholders con tus credenciales reales.
const config = {
    // ... (Tu configuración) ...
    user: 'DB_CONEXION', 
    password: 'Bienvenido19', 
    server: 'localhost', // Dejamos 'localhost' para evitar errores de ENOTFOUND
    database: 'awcs_ClinicaDental',
    options: {
        trustServerCertificate: true, 
        encrypt: false,
        port: 1433 
    }
};

// Objeto para manejar la conexión y las consultas
const pool = new sql.ConnectionPool(config); // Ahora 'sql' está definido

/**
 * Función para establecer la conexión al iniciar el servidor.
 */
async function connectDB() {
    try {
        await pool.connect();
        console.log('✅ Conexión a SQL Server exitosa.');
    } catch (err) {
        console.error('❌ Error al conectar a SQL Server:', err);
        // Terminar el proceso si la conexión a la DB falla.
        process.exit(1); 
    }
}

// Exportar el pool de conexión y la función de conexión
module.exports = {
    sql, 
    pool,
    connectDB
};
