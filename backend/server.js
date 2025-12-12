// backend/server.js

const express = require('express'); 
const path = require('path'); 
const { connectDB } = require('./database'); 
const authRoutes = require('./routes/authRoutes');
const dentistProfileRoutes = require('./routes/dentistProfileRoutes');
const { errorHandler } = require('./middleware/error');
const cors = require("cors");
const { sql, config, pool } = require("./database");

const app = express(); 
const port = 3000; 

// --- MIDDLEWARES GLOBALES ---
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/Static', express.static(path.join(__dirname, '..', 'Static')));
app.use('/templates', express.static(path.join(__dirname, '..', 'templates')));

// --- RUTAS DE LA API ---
app.use('/api/auth', authRoutes);
app.use('/api/dentist', dentistProfileRoutes);
app.use(cors());
app.use(express.json());

// Middleware para manejo de errores
app.use(errorHandler);

// --- SERVIR VISTAS DEL FRONTEND ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'templates', 'index.html'));
});

// --- RUTA CREAR CITAS ---

app.post("/agendar-cita", async (req, res) => {
    try {
        const { id_paciente, fecha, hora } = req.body;

        console.log("Fecha recibida:", fecha);
        console.log("Hora recibida:", hora);

        let horaFinal = hora.length === 5 ? hora + ":00" : hora;
        console.log("Hora final enviada a SQL:", horaFinal);

        const [h, m, s] = horaFinal.split(":");
        const horaDate = new Date(1970, 0, 1, h, m, s); 

        const request = pool.request();

        request
            .input("id_paciente", sql.Int, id_paciente)
            .input("fecha", sql.Date, fecha)
            .input("hora", sql.Time, horaDate)  
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


// --- RUTA MOSTRAR CITAS ---
app.get("/citas/:id_paciente", async (req, res) => {
    try {
        const id_paciente = req.params.id_paciente;

        const requestSQL = pool.request();
        requestSQL.input("id_paciente", sql.Int, id_paciente);

        const query = `
            SELECT 
                c.id,
                c.fecha,
                c.hora,
                c.servicio,
                c.estado,
                o.nombre AS odontologo
            FROM citas c
            LEFT JOIN odontologos o ON c.id_odontologo = o.id
            WHERE c.id_paciente = @id_paciente
            ORDER BY c.fecha ASC, c.hora ASC
        `;

        const result = await requestSQL.query(query);
        const citas = result.recordset;

        // Fecha actual SIN hora
        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        // Clasificación correcta usando objetos Date
        const citas_futuras = [];
        const citas_pasadas = [];

        citas.forEach(c => {
            const fechaCita = new Date(c.fecha);

            if (fechaCita >= hoy) {
                citas_futuras.push(c);
            } else {
                citas_pasadas.push(c);
            }
        });

        res.json({ citas_futuras, citas_pasadas });

    } catch (err) {
        console.error("Error al obtener citas:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});




// --- INICIO DEL SERVIDOR ---
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Servidor backend escuchando en http://localhost:${port}`);
        console.log(`🌐 Accede a tu aplicación en http://localhost:${port}`);
    });
}).catch(err => {
    console.error('No se pudo iniciar la aplicación:', err);
});
