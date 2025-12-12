// backend/server.js

const express = require('express'); 
const path = require('path'); 
const { connectDB } = require('./database'); 
const authRoutes = require('./routes/authRoutes'); // <--- 🌟 CORRECCIÓN 1: Descomentar e importar rutas

const app = express(); 
const port = 3000; 

// --- MIDDLEWARES GLOBALES ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Middleware para manejar datos de formularios (aunque en este caso usamos JSON)
app.use('/Static', express.static(path.join(__dirname, '..', 'static'))); 
app.use('/templates', express.static(path.join(__dirname, '..', 'templates')));

// --- RUTAS DE LA API ---
app.use('/api/auth', authRoutes); // <--- 🌟 CORRECCIÓN 1: Usar las rutas de autenticación

// --- SERVIR VISTAS DEL FRONTEND ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'templates', 'index.html'));
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
