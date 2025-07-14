fetch('/estado-sesion')
    .then(res => res.json())
    .then(data => {
      if (!data.sesion) {
        window.location.href = '/'; // Redirige si no hay sesión
      }
    });
    