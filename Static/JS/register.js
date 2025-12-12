// static/JS/register.js

document.addEventListener('DOMContentLoaded', () => {
    // Captura el formulario usando el ID que añadimos en el HTML
    const registerForm = document.getElementById('registerForm'); 
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password2 = document.getElementById('password2').value;

            if (password !== password2) {
                alert('Error: Las contraseñas no coinciden.');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password, password2 }) 
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Registro exitoso: ¡Ya puedes iniciar sesión!');
                    // Redirigir al login
                    window.location.href = 'login.html'; 
                } else {
                    // Mostrar error específico del backend (ej: email duplicado)
                    alert('Error en el registro: ' + (data.message || 'Error desconocido.'));
                }
                
            } catch (error) {
                console.error('Error de red/servidor:', error);
                alert('Ocurrió un error al intentar registrarse.');
            }
        });
    }
});
