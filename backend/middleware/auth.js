const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('../database');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
    let token;

    // Verificar si el token está en el encabezado
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener el token del encabezado
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_seguro');

            // Obtener el usuario del token
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, decoded.id)
                .query('SELECT * FROM personal_app WHERE id = @id');

            if (result.recordset.length === 0) {
                throw new Error('Usuario no encontrado');
            }

            // Adjuntar el usuario al objeto de solicitud
            req.user = result.recordset[0];
            next();
        } catch (error) {
            console.error('Error de autenticación:', error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
    }
};

// Middleware para autorizar roles específicos
const authorize = (...roles) => {
    return (req, res, next) => {
        // Obtener el rol del usuario desde la base de datos
        const pool = sql.connect(config).then(pool => {
            return pool.request()
                .input('id', sql.Int, req.user.id)
                .query('SELECT r.nombre_rol FROM roles r INNER JOIN personal_app pa ON r.id = pa.id_rol WHERE pa.id = @id');
        }).then(result => {
            if (result.recordset.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'No tiene permisos para realizar esta acción' 
                });
            }

            const userRole = result.recordset[0].nombre_rol;
            
            if (!roles.includes(userRole)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `El rol ${userRole} no tiene acceso a esta ruta` 
                });
            }
            
            next();
        }).catch(error => {
            console.error('Error al verificar roles:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al verificar permisos de usuario' 
            });
        });
    };
};

module.exports = { protect, authorize };
