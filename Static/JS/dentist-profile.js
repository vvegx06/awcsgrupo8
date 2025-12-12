document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('dentistProfileForm');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelar = document.getElementById('btnCancelar');
    const fileInput = document.getElementById('foto');
    const fileNameSpan = document.getElementById('fileName');
    const preview = document.getElementById('preview');
    const imagePreview = document.getElementById('imagePreview');

    // Cargar datos actuales del perfil
    cargarDatosPerfil();

    // Manejador para la vista previa de la imagen
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            fileNameSpan.textContent = 'Ningún archivo seleccionado';
            imagePreview.style.display = 'none';
        }
    });

    // Manejador para el botón de guardar
    btnGuardar.addEventListener('click', async function() {
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/dentist/profile', {
                method: 'PUT',
                body: formData,
                // No establecer 'Content-Type': 'multipart/form-data' manualmente,
                // fetch lo hará automáticamente con el boundary correcto
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Perfil actualizado correctamente');
                window.location.href = '/perfil';
            } else {
                throw new Error(data.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el perfil: ' + error.message);
        }
    });

    // Manejador para el botón de cancelar
    btnCancelar.addEventListener('click', function() {
        if (confirm('¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.')) {
            window.location.href = '/perfil';
        }
    });

    // Función para cargar los datos actuales del perfil
    async function cargarDatosPerfil() {
        try {
            const response = await fetch('/api/dentist/profile');
            if (!response.ok) {
                throw new Error('Error al cargar el perfil');
            }
            
            const data = await response.json();
            
            // Rellenar el formulario con los datos del perfil
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('especialidades').value = data.especialidades ? data.especialidades.join(', ') : '';
            document.getElementById('experiencia').value = data.experiencia || '';
            document.getElementById('telefono').value = data.telefono || '';
            document.getElementById('correo').value = data.correo || '';
            
            // Mostrar la imagen de perfil si existe
            if (data.foto_url) {
                preview.src = data.foto_url;
                imagePreview.style.display = 'block';
                fileNameSpan.textContent = 'Imagen actual';
            }
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
            alert('No se pudieron cargar los datos del perfil');
        }
    }
});
