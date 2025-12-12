const express = require('express');
const router = express.Router();
const path = require('path');
const { 
    getDentistProfile, 
    updateDentistProfile, 
    uploadDentistPhoto 
} = require('../controllers/dentistProfileController');
const { protect, authorize } = require('../middleware/auth');

// Ruta para obtener el perfil del dentista actual
router.get('/', protect, authorize(['Odontólogo']), getDentistProfile);

// Ruta para actualizar el perfil del dentista actual
router.put(
    '/', 
    protect, 
    authorize(['Odontólogo']), 
    uploadDentistPhoto, 
    updateDentistProfile
);

// Ruta para obtener la foto de perfil
router.get('/foto/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(path.join(__dirname, '..', '..', 'Static', 'uploads', 'dentist-profiles', filename));
});

module.exports = router;
