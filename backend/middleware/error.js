// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Errores de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            error: err.message
        });
    }
    
    // Errores de autenticación
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'No autorizado',
            error: 'Token no válido o expirado'
        });
    }
    
    // Errores de base de datos
    if (err.name === 'MSSQLError') {
        return res.status(500).json({
            success: false,
            message: 'Error en la base de datos',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
        });
    }
    
    // Error por defecto
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

// Middleware para manejar rutas no encontradas
const notFound = (req, res, next) => {
    const error = new Error(`No se encontró - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
