// backend/database.js
const sql = require('mssql'); 

// Configuración de la conexión a SQL Server
// **NOTA:** Reemplaza los placeholders con tus credenciales reales.
const config = {
    user: 'DB_CONEXION', 
    password: 'Bienvenido19', 
    server: 'localhost', 
    database: 'awcs_ClinicaDental',
    options: {
        trustServerCertificate: true, 
        encrypt: false,
        port: 1433 
    }
};

// Objeto para manejar la conexión y las consultas
const pool = new sql.ConnectionPool(config); 

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

// Exportar el pool de conexión, el objeto sql y la función de conexión
module.exports = {
    sql, 
    pool,
    connectDB
};
