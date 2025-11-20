async function cargarNavbar() {
    const contenedor = document.getElementById("navbar");
    if (!contenedor) return;

    // Ruta correcta desde cualquier página del proyecto
    const response = await fetch("/templates/Componentes/navbar.html");
    const html = await response.text();
    contenedor.innerHTML = html;
}

cargarNavbar();