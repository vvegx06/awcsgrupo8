// static/JS/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // Obtener datos del formulario
            const usuario = document.getElementById('usuario').value; 
            const password = document.getElementById('password').value;
            
            try {
                // Petición al backend
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario, password }) 
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 1. Guardar el token y el rol
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userRol', data.rol);
                    
                    alert('Bienvenido, ' + data.usuario + '! (Rol: ' + data.rol + ')');
                    
                    // 2. Redirigir según el rol del usuario
                    const userRole = data.rol;
                    
                    if (userRole === 'Administrador') {
                        // 🌟 CORRECCIÓN: Redirección específica para el Administrador
                        window.location.href = '/templates/homeAdmin.html'; 
                    } else {
                        // Redirección por defecto para otros roles (Paciente, etc.)
                        window.location.href = '/templates/home.html'; 
                    }
                    
                } else {
                    alert('Error de login: ' + (data.message || 'Usuario o contraseña incorrectos.'));
                }
                
            } catch (error) {
                console.error('Error de red/servidor:', error);
                alert('Ocurrió un error al intentar iniciar sesión.');
            }
        });
    }
});
