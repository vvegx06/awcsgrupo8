// backend/server.js

const express = require('express'); // 1. Importar Express
const path = require('path');       // Para manejar rutas de archivos
const { connectDB } = require('./database'); // Importar la conexión DB
// const authRoutes = require('./routes/authRoutes'); // <--- Importa tus rutas aquí (Ej: login/register)

const app = express(); // 2. Inicializar la aplicación Express
const port = 3000;     // 3. Definir el puerto

// --- MIDDLEWARES GLOBALES ---
// Esto le dice a Express que lea el cuerpo de las peticiones JSON
app.use(express.json()); 
// Esto sirve los archivos estáticos (CSS, JS, imágenes) desde la carpeta 'static'
app.use('/Static', express.static(path.join(__dirname, '..', 'static'))); 
app.use('/templates', express.static(path.join(__dirname, '..', 'templates')));

// --- RUTAS DE LA API ---
// Ejemplo: Si tienes rutas para autenticación:
// app.use('/api/auth', authRoutes); 

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
