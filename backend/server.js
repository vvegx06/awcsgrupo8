// backend/server.js

const express = require('express'); // 1. Importar Express
const path = require('path');       // Para manejar rutas de archivos
const { connectDB } = require('./database'); // Importar la conexión DB
// const authRoutes = require('./routes/authRoutes'); // <--- Importa tus rutas aquí (Ej: login/register)
const cors = require("cors");
const { sql, config, pool } = require("./database");

const app = express(); // 2. Inicializar la aplicación Express
const port = 3000;     // 3. Definir el puerto

// --- MIDDLEWARES GLOBALES ---
// Esto le dice a Express que lea el cuerpo de las peticiones JSON
app.use(express.json()); 
// Esto sirve los archivos estáticos (CSS, JS, imágenes) desde la carpeta 'static'
app.use('/Static', express.static(path.join(__dirname, '..', 'static'))); 
app.use('/templates', express.static(path.join(__dirname, '..', 'templates')));
app.use(cors());
app.use(express.json());


// --- RUTAS DE LA API ---
// Ejemplo: Si tienes rutas para autenticación:
// app.use('/api/auth', authRoutes); 

// -------------------------
//  RUTA PARA CREAR CITA
// -------------------------
app.post("/agendar-cita", async (req, res) => {
    try {
        const { id_paciente, fecha, hora } = req.body;

        console.log("Fecha recibida:", fecha);
        console.log("Hora recibida:", hora);

        // Asegurar formato HH:mm:ss
        let horaFinal = hora.length === 5 ? hora + ":00" : hora;
        console.log("Hora final enviada a SQL:", horaFinal);

        // Convertir a un objeto Date real (soluciona el error)
        const [h, m, s] = horaFinal.split(":");
        const horaDate = new Date(1970, 0, 1, h, m, s); // <-- Esto NUNCA falla

        const request = pool.request();

        request
            .input("id_paciente", sql.Int, id_paciente)
            .input("fecha", sql.Date, fecha)
            .input("hora", sql.Time, horaDate)  // <-- EL FIX REAL
            .input("id_odontologo", sql.Int, 1)
            .input("servicio", sql.VarChar, "Consulta General");

        const query = `
            INSERT INTO citas (id_paciente, id_odontologo, fecha, hora, servicio)
            VALUES (@id_paciente, @id_odontologo, @fecha, @hora, @servicio)
        `;

        await request.query(query);

        res.json({ mensaje: "Cita guardada con éxito" });

    } catch (err) {
        console.error("Error al guardar cita:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});





// --- SERVIR VISTAS DEL FRONTEND ---
// Servir el archivo principal index.html (desde la carpeta templates)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'templates', 'index.html'));
});

// --- INICIO DEL SERVIDOR ---
// Conectar a la DB y luego iniciar el servidor
connectDB().then(() => {
    // 4. Usar 'app' y 'port' que ya están definidos
    app.listen(port, () => {
        console.log(`🚀 Servidor backend escuchando en http://localhost:${port}`);
        console.log(`🌐 Accede a tu aplicación en http://localhost:${port}`);
    });
}).catch(err => {
    // Esto solo se ejecuta si la promesa de app.listen falla, aunque el error ya fue manejado en connectDB()
    console.error('No se pudo iniciar la aplicación:', err);
});
