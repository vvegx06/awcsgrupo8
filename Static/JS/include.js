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