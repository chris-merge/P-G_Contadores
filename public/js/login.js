 //bloquea los espacio en los inputs
        function bloquearEspacios(event) {
            if (event.key === ' ') {
                event.preventDefault();
            }
        }
        //Muestras la contraseña en el input
        function togglePasswordVisibility() {
            var passwordInput = document.getElementById("passwordInput");
            var showPasswordCheckbox = document.getElementById("showPassword");   


            if (showPasswordCheckbox.checked) {
                passwordInput.type = "text";
            } else {
                passwordInput.type = "password";
            }
        }