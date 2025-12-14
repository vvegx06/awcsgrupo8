async function cargarNavbar() {
    const contenedor = document.getElementById("navbar");
    if (!contenedor) return;

    // Ruta correcta desde cualquier página del proyecto
    const response = await fetch("/templates/Componentes/navbar.html");
    const html = await response.text();
    contenedor.innerHTML = html;
}

cargarNavbar();

async function cargarNavbarAdmin() {
    const contenedor = document.getElementById("navbarAdmin");
    if (!contenedor) return;

    // Ruta correcta desde cualquier página del proyecto
    const response = await fetch("/templates/Componentes/navbarAdmin.html");
    const html = await response.text();
    contenedor.innerHTML = html;
}

cargarNavbarAdmin();

// Nueva función para cargar navbar dinámico según rol
async function cargarNavbarDinamico() {
    const contenedor = document.getElementById("navbar-container");
    if (!contenedor) return;

    // Obtener el rol del usuario desde localStorage
    const userRol = localStorage.getItem('userRol');
    
    let navbarPath;
    if (userRol === 'Odontólogo') {
        navbarPath = "/templates/Componentes/navbarOdontologo.html";
    } else if (userRol === 'Administrador') {
        navbarPath = "/templates/Componentes/navbarAdmin.html";
    } else {
        // Si no hay rol o es otro rol, cargar navbar por defecto
        navbarPath = "/templates/Componentes/navbar.html";
    }

    try {
        const response = await fetch(navbarPath);
        const html = await response.text();
        contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar el navbar:', error);
        // En caso de error, cargar navbar por defecto
        const fallbackResponse = await fetch("/templates/Componentes/navbar.html");
        const fallbackHtml = await fallbackResponse.text();
        contenedor.innerHTML = fallbackHtml;
    }
}

cargarNavbarDinamico();