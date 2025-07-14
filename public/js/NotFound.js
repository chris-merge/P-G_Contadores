 // Animación del logo
        document.getElementById('logo').addEventListener('mouseover', function() {
            this.classList.add('scale-110');
        });
        document.getElementById('logo').addEventListener('mouseout', function() {
            this.classList.remove('scale-110');
        });

        // Contador regresivo para redirección
        let seconds = 10;
        const countdownElement = document.getElementById('countdown');
        
        const interval = setInterval(() => {
            seconds--;
            countdownElement.textContent = seconds;
            
            if(seconds <= 0) {
                clearInterval(interval);
                window.location.href = '/public';
            }
        }, 1000);

        // Efecto de error de página (consola)
        console.log('%c¡Error 404!', 'color: #3B82F6; font-size: 18px; font-weight: bold;');
        console.log('%cLa página solicitada no fue encontrada', 'color: #64748B;');
