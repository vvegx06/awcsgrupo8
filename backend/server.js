// backend/server.js

const express = require('express'); 
const path = require('path'); 
const { connectDB } = require('./database'); 
const authRoutes = require('./routes/authRoutes');
const dentistProfileRoutes = require('./routes/dentistProfileRoutes');
const { errorHandler } = require('./middleware/error');

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

// Middleware para manejo de errores
app.use(errorHandler);

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
