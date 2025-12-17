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

// --- RUTA agendar CITAS ---

app.post("/citas-publicas", async (req, res) => {
    try {
        const { nombre, correo, telefono, servicio, fecha } = req.body;

        // 1️⃣ Buscar o crear paciente
        let pacienteResult = await pool.request()
            .input("correo", sql.VarChar, correo)
            .query("SELECT id FROM pacientes WHERE correo = @correo");

        let id_paciente;

        if (pacienteResult.recordset.length === 0) {
            const nuevoPaciente = await pool.request()
                .input("nombre", sql.VarChar, nombre)
                .input("correo", sql.VarChar, correo)
                .input("telefono", sql.VarChar, telefono)
                .query(`
                    INSERT INTO pacientes (nombre, correo, telefono)
                    OUTPUT INSERTED.id
                    VALUES (@nombre, @correo, @telefono)
                `);

            id_paciente = nuevoPaciente.recordset[0].id;
        } else {
            id_paciente = pacienteResult.recordset[0].id;
        }

        // 2️⃣ Hora FIJA como objeto Date (CLAVE)
        const hora = new Date("1970-01-01T09:00:00");

        // 3️⃣ Insertar cita
        await pool.request()
            .input("id_paciente", sql.Int, id_paciente)
            .input("fecha", sql.Date, fecha)
            .input("hora", sql.Time, hora) // 👈 AQUÍ está la solución
            .input("servicio", sql.VarChar, servicio)
            .query(`
                INSERT INTO citas (id_paciente, fecha, hora, servicio)
                VALUES (@id_paciente, @fecha, @hora, @servicio)
            `);

        res.json({ mensaje: "Cita registrada correctamente" });

    } catch (error) {
        console.error("Error al registrar cita:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// --- RUTA Obtener CITAS ---

app.get("/agenda", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT 
                c.id,
                p.nombre AS paciente,
                c.fecha,
                c.hora,
                c.servicio,
                c.estado
            FROM citas c
            INNER JOIN pacientes p ON c.id_paciente = p.id
            WHERE c.estado = 'Programada'
            ORDER BY c.fecha, c.hora
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error("Error al obtener agenda:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// --- RUTA cambiar estado CITAS ---

app.put("/citas/:id/estado", async (req, res) => {
    try {
        const { estado } = req.body;
        const id = req.params.id;

        await pool.request()
            .input("estado", sql.VarChar, estado)
            .input("id", sql.Int, id)
            .query(`
                UPDATE citas
                SET estado = @estado
                WHERE id = @id
            `);

        res.json({ mensaje: "Estado actualizado" });

    } catch (error) {
        console.error("Error al actualizar estado:", error);
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
