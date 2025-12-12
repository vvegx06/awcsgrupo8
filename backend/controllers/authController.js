// backend/controllers/authController.js
const PacienteModel = require('../models/pacienteModel'); 
const PersonalAppModel = require('../models/personalAppModel'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const JWT_SECRET = 'TU_CLAVE_SECRETA_SUPER_SEGURA'; 
const ROL_PACIENTE = 4; // ID del rol 'Paciente' en la tabla roles

const authController = {

    // =======================================================
    // 1. REGISTRO DE PACIENTE (ROL 4)
    // =======================================================
    async register(req, res) {
        const { nombre, email, password, password2 } = req.body; 

        if (password !== password2) {
             return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
        }

        try {
            // 1. Crear el registro en la tabla PACIENTES
            const newPaciente = await PacienteModel.create({ nombre, correo: email });
            const pacienteId = newPaciente.id;
            
            // 2. Crear el registro en la tabla PERSONAL_APP (para login)
            await PersonalAppModel.create({
                id_rol: ROL_PACIENTE,
                id_referencia: pacienteId,
                usuario: email, 
                password: password,
                nombre: nombre
            });

            res.status(201).json({ 
                message: 'Registro de paciente exitoso.', 
                pacienteId: pacienteId
            });

        } catch (error) {
            console.error('Error al registrar usuario:', error);
            
            if (error.message.includes('El correo ya existe') || error.message.includes('El nombre de usuario ya existe')) { 
                 return res.status(400).json({ message: 'El correo electrónico ya está registrado. Intenta iniciar sesión.' });
            }
            
            res.status(500).json({ message: 'Error interno al procesar el registro.' });
        }
    },

    // =======================================================
    // 2. INICIO DE SESIÓN
    // =======================================================
    async login(req, res) {
        const { usuario, password } = req.body; 

        try {
            // 1. Buscar usuario por nombre de usuario (email)
            const user = await PersonalAppModel.getByUsername(usuario);

            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            // 🌟🌟🌟 DEBUGGING: VERIFICAR QUÉ PROPIEDAD CONTIENE EL HASH 🌟🌟🌟
            console.log('--- DEBUG DE LOGIN DE ADMINISTRADOR ---');
            console.log('Hash en user.password (minúsculas):', user.password); 
            console.log('Hash en user.Password (MAYÚSCULA):', user.Password); 
            console.log('Objeto completo:', user); 
            console.log('------------------------------------');
            // 🌟🌟🌟 FIN DE DEBUGGING 🌟🌟🌟

            // 🌟 CORRECCIÓN CLAVE: Intentamos usar la propiedad que contiene el hash.
            // Si la librería devuelve 'Password' (mayúscula) o si la minúscula es undefined, 
            // usamos la mayúscula. De lo contrario, usamos la minúscula.
            const storedHash = user.password || user.Password; 
            
            if (!storedHash) {
                // Esto solo debería pasar si la consulta SELECT no incluyó el campo 'password'
                console.error("Error: Campo de hash no encontrado en el objeto de usuario.");
                return res.status(500).json({ message: 'Error de configuración de usuario.' });
            }
            
            // 2. Comparar la contraseña hasheada
            const isMatch = await bcrypt.compare(password, storedHash); // Usamos la variable almacenada

            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            // 3. Generar un token JWT para mantener la sesión
            const token = jwt.sign(
                { id: user.id, rol: user.nombre_rol, referenciaId: user.id_referencia }, 
                JWT_SECRET, 
                { expiresIn: '1h' }
            );
            
            // 4. Devolver el token (y quizás el rol para el frontend)
            res.json({ 
                message: 'Inicio de sesión exitoso.', 
                token: token,
                rol: user.nombre_rol,
                usuario: user.nombre
            });

        } catch (error) {
            console.error('Error durante el login:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
};

module.exports = authController;
