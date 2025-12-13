// Static/JS/perfil.js

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const userRol = localStorage.getItem('userRol');
    const authToken = localStorage.getItem('authToken');
    
    console.log('QA: Usuario en perfil:', userName);
    console.log('QA: Rol en perfil:', userRol);
    
    // Si es un odontólogo, cargar datos completos del perfil
    if (userRol === 'Odontólogo' && authToken) {
        loadDentistProfile();
    } else if (userName) {
        // Para otros roles, solo mostrar el nombre
        const nombreUsuarioElement = document.getElementById('nombreUsuario');
        if (nombreUsuarioElement) {
            nombreUsuarioElement.textContent = userName;
        }
    }
});

// Función para cargar el perfil completo del odontólogo
async function loadDentistProfile() {
    try {
        const authToken = localStorage.getItem('authToken');
        console.log('QA: Token en localStorage:', authToken ? 'existe' : 'no existe');
        console.log('QA: Token length:', authToken ? authToken.length : 0);
        
        const response = await fetch('/api/dentist', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const profileData = await response.json();
            updateProfileUI(profileData);
            console.log('QA: Perfil de odontólogo cargado:', profileData);
        } else {
            console.error('Error al cargar perfil:', response.statusText);
            // Fallback: mostrar nombre del localStorage
            const userName = localStorage.getItem('userName');
            if (userName) {
                document.getElementById('nombreUsuario').textContent = userName;
            }
        }
    } catch (error) {
        console.error('Error de red al cargar perfil:', error);
        // Fallback: mostrar nombre del localStorage
        const userName = localStorage.getItem('userName');
        if (userName) {
            document.getElementById('nombreUsuario').textContent = userName;
        }
    }
}

// Función para actualizar la UI con los datos del perfil
function updateProfileUI(profileData) {
    // Actualizar nombre
    const nombreUsuarioElement = document.getElementById('nombreUsuario');
    if (nombreUsuarioElement && profileData.nombre) {
        nombreUsuarioElement.textContent = profileData.nombre;
    }
    
    // Actualizar especialidades
    const especialidadesList = document.querySelector('.perfil-info .lista');
    if (especialidadesList && profileData.especialidades && profileData.especialidades.length > 0) {
        especialidadesList.innerHTML = '';
        profileData.especialidades.forEach(especialidad => {
            const li = document.createElement('li');
            li.textContent = especialidad;
            especialidadesList.appendChild(li);
        });
    }
    
    // Actualizar email
    const emailElement = document.getElementById('perfil-email');
    if (emailElement && profileData.correo) {
        emailElement.textContent = profileData.correo;
    }
    
    // Actualizar teléfono
    const telefonoElement = document.getElementById('perfil-telefono');
    if (telefonoElement && profileData.telefono) {
        telefonoElement.textContent = profileData.telefono;
    }
    
    // Actualizar experiencia
    const experienciaElement = document.getElementById('perfil-experiencia');
    if (experienciaElement && profileData.experiencia) {
        experienciaElement.textContent = `Más de ${profileData.experiencia} años de experiencia brindando atención odontológica integral, enfocado en tratamientos modernos, estética y bienestar del paciente.`;
    }
    
    // Actualizar foto de perfil
    const perfilImg = document.querySelector('.perfil-img img');
    if (perfilImg) {
        // Generar nombre de imagen basado en el nombre del usuario
        const imageName = profileData.nombre
            .replace(/\s+/g, '') // Eliminar espacios
            .replace(/\./g, '')  // Eliminar puntos
            .replace(/Dr/gi, '') // Eliminar "Dr"
            + '.jpeg';
        
        // Construir ruta de la imagen
        const imagePath = `/Static/img/${imageName}`;
        
        // Actualizar src y alt
        perfilImg.src = imagePath;
        perfilImg.alt = `Foto del ${profileData.nombre}`;
        
        console.log('QA: Imagen de perfil generada:', imagePath);
    }
}
