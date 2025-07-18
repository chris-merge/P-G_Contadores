 //bloquea los espacio en los inputs
        function bloquearEspacios(event) {
            if (event.key === ' ') {
                event.preventDefault();
            }
        }
     function togglePasswordVisibility() {
    var passwordInput = document.getElementById("clave");
    var showPasswordCheckbox = document.getElementById("showPassword");

    if (showPasswordCheckbox.checked) {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}