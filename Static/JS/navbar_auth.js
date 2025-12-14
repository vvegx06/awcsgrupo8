// static/JS/navbar_auth.js

// =======================================================
// 1. FUNCIÓN DE CERRAR SESIÓN (Global)
// =======================================================
function logout() {
    // Elimina el token y el rol del almacenamiento local
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRol');
    
    // Redirige al login. Asegúrate de que esta ruta es correcta.
    window.location.href = '/templates/account/login.html'; 
}
// Hace la función accesible globalmente para el evento click
window.logout = logout;


// =======================================================
// 2. LÓGICA DE MODIFICACIÓN DEL NAVBAR (Manejo de Timing)
// =======================================================
function modifyNavbar() {
    const authToken = localStorage.getItem('authToken');
    const navegacion = document.querySelector('.navegacion');

    // Si NO hay token, no hacemos nada y el navbar queda por defecto.
    if (!authToken) {
        return;
    }
    
    // 🌟 CORRECCIÓN DE TIMING: Si el elemento 'navegacion' aún no existe, reintentamos.
    if (!navegacion) {
        setTimeout(modifyNavbar, 50); 
        return;
    }

    // --- SESIÓN INICIADA: AGREGAR SOLO EL BOTÓN DE LOGOUT ---
    
    // NOTA: El enlace 'Agendar Cita' se mantiene porque NO estamos ejecutando:
    // btnCita.style.display = 'none';

    // 1. Verificar si ya existe un botón de Cerrar Sesión para evitar duplicación
    const existingLogout = navegacion.querySelector('a[href="#"]');
    if (existingLogout && existingLogout.textContent === "Cerrar Sesión") {
        return; // Ya existe, no agregar otro
    }

    // 2. Crear y añadir el enlace "Cerrar Sesión"
    const logoutLink = document.createElement('a');
    logoutLink.href = "#"; 
    logoutLink.textContent = "Cerrar Sesión";
    
    // Opcional: Asigna la clase 'btn-cita' si quieres que tenga el mismo estilo visual
    logoutLink.classList.add('btn-cita'); 
    
    // Asignamos el evento click
    logoutLink.addEventListener('click', (e) => {
         e.preventDefault(); // Previene la acción por defecto del enlace '#'
         logout();
    });

    // 3. Insertamos el nuevo enlace al final del <nav>.
    navegacion.appendChild(logoutLink);
}

// 3. Iniciamos la lógica al final de la carga del DOM
document.addEventListener('DOMContentLoaded', modifyNavbar);

