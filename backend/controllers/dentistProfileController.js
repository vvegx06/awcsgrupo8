const sql = require('mssql');
const path = require('path');
const fs = require('fs');
const config = require('../database');

// Directorio para almacenar las imágenes de perfil
const UPLOAD_DIR = path.join(__dirname, '../../Static/uploads/dentist-profiles');

// Asegurarse de que el directorio de subidas exista
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Obtener perfil del dentista
const getDentistProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Asumiendo que el middleware de autenticación agrega el usuario a req.user
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT o.*, pa.usuario, pa.nombre as nombre_usuario
                FROM odontologos o
                INNER JOIN personal_app pa ON o.id = pa.id_referencia
                WHERE pa.id = @userId AND pa.id_rol = 2
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Perfil de dentista no encontrado' });
        }

        const profile = result.recordset[0];
        
        // Formatear la respuesta
        const response = {
            id: profile.id,
            nombre: profile.nombre_usuario || profile.nombre,
            especialidades: profile.especialidad ? profile.especialidad.split(',').map(s => s.trim()) : [],
            experiencia: profile.experiencia || 0,
            telefono: profile.telefono || '',
            correo: profile.correo || '',
            foto_url: profile.foto_url ? `/Static/uploads/dentist-profiles/${profile.foto_url}` : null,
            usuario: profile.usuario
        };

        res.json(response);
    } catch (error) {
        console.error('Error al obtener el perfil del dentista:', error);
        res.status(500).json({ message: 'Error al obtener el perfil del dentista' });
    }
};

// Actualizar perfil del dentista
const updateDentistProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombre, especialidades, experiencia, telefono, correo } = req.body;
        
        // Validar datos de entrada
        if (!nombre || !especialidades || experiencia === undefined || !telefono || !correo) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const pool = await sql.connect(config);
        
        // Iniciar transacción
        const transaction = new sql.Transaction(pool);
        await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

        try {
            const request = new sql.Request(transaction);
            
            // 1. Actualizar tabla personal_app (nombre de usuario)
            await request
                .input('id', sql.Int, userId)
                .input('nombre', sql.NVarChar(120), nombre)
                .query('UPDATE personal_app SET nombre = @nombre WHERE id = @id');
            
            // 2. Actualizar tabla odontologos
            let fotoUrl = null;
            
            // Procesar la imagen si se subió una
            if (req.file) {
                const fileExt = path.extname(req.file.originalname);
                fotoUrl = `dentist-${userId}-${Date.now()}${fileExt}`;
                const filePath = path.join(UPLOAD_DIR, fotoUrl);
                
                // Mover el archivo subido al directorio de destino
                fs.renameSync(req.file.path, filePath);
                
                // Si había una imagen anterior, eliminarla
                const oldProfile = await request
                    .input('userId', sql.Int, userId)
                    .query(`
                        SELECT foto_url FROM odontologos o
                        INNER JOIN personal_app pa ON o.id = pa.id_referencia
                        WHERE pa.id = @userId
                    `);
                
                if (oldProfile.recordset.length > 0 && oldProfile.recordset[0].foto_url) {
                    const oldFilePath = path.join(UPLOAD_DIR, oldProfile.recordset[0].foto_url);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            }
            
            // Actualizar los datos del dentista
            const updateDentistQuery = `
                UPDATE odontologos
                SET 
                    nombre = @nombre,
                    especialidad = @especialidad,
                    experiencia = @experiencia,
                    telefono = @telefono,
                    correo = @correo
                    ${fotoUrl ? ', foto_url = @foto_url' : ''}
                FROM odontologos o
                INNER JOIN personal_app pa ON o.id = pa.id_referencia
                WHERE pa.id = @userId
            `;
            
            const updateRequest = new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .input('nombre', sql.NVarChar(120), nombre)
                .input('especialidad', sql.NVarChar(255), Array.isArray(especialidades) ? especialidades.join(', ') : especialidades)
                .input('experiencia', sql.Int, parseInt(experiencia) || 0)
                .input('telefono', sql.NVarChar(30), telefono)
                .input('correo', sql.NVarChar(150), correo);
            
            if (fotoUrl) {
                updateRequest.input('foto_url', sql.NVarChar(255), fotoUrl);
            }
            
            await updateRequest.query(updateDentistQuery);
            
            // Confirmar la transacción
            await transaction.commit();
            
            // Devolver los datos actualizados
            const updatedProfile = await getDentistProfile(req, res);
            res.json(updatedProfile);
            
        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error al actualizar el perfil del dentista:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el perfil del dentista',
            error: error.message 
        });
    }
};

// Middleware para manejar la subida de archivos
const uploadDentistPhoto = (req, res, next) => {
    // Configurar multer para manejar la subida de archivos
    const multer = require('multer');
    
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
            // Usar un nombre de archivo temporal, se renombrará después de validar el usuario
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
    
    const fileFilter = (req, file, cb) => {
        // Aceptar solo imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    };
    
    const upload = multer({ 
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
    }).single('foto');
    
    // Ejecutar la subida
    upload(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'El archivo es demasiado grande. El tamaño máximo permitido es de 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

module.exports = {
    getDentistProfile,
    updateDentistProfile,
    uploadDentistPhoto
};
