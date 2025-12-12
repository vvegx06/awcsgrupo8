async function cargarHistorial() {
    const idPaciente = 1; 

    try {
        const res = await fetch(`http://localhost:3000/citas/${idPaciente}`);
        const data = await res.json();

        console.log("Datos recibidos:", data);

        const { citas_futuras, citas_pasadas } = data;

        const tablaFuturas = document.querySelector("#tablaFuturas tbody");
        const tablaPasadas = document.querySelector("#tablaPasadas tbody");

        tablaFuturas.innerHTML = "";
        tablaPasadas.innerHTML = "";

        const formatFecha = f => new Date(f).toLocaleDateString("es-CR");
        const formatHora = h => new Date(h).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });

        citas_futuras.forEach(cita => {
            tablaFuturas.innerHTML += `
                <tr>
                    <td>${formatFecha(cita.fecha)}</td>
                    <td>${formatHora(cita.hora)}</td>
                    <td>${cita.servicio}</td>
                    <td>${cita.odontologo}</td>
                    <td>${cita.estado}</td>
                </tr>
            `;
        });

        citas_pasadas.forEach(cita => {
            tablaPasadas.innerHTML += `
                <tr>
                    <td>${formatFecha(cita.fecha)}</td>
                    <td>${formatHora(cita.hora)}</td>
                    <td>${cita.servicio}</td>
                    <td>${cita.odontologo}</td>
                    <td>${cita.estado}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error cargando citas:", error);
    }
}

cargarHistorial();