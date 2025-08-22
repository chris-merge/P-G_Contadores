const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de multer para subir archivos JSON
const upload = multer({ dest: 'uploads/' });

// Sesiones activas en memoria
let activeSessions = new Set();

// Configuración de sesión (24 horas)
app.use(session({
    secret: 'P_Gadmin',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware para parsear datos y servir archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para limitar a máximo 2 sesiones activas
app.use((req, res, next) => {
    if (!req.session.idGuardado) {
        if (activeSessions.size >= 2) {
            return res.redirect('/404.html');
        }
        req.session.idGuardado = req.sessionID;
        activeSessions.add(req.sessionID);
    }
    next();
});

// Middleware para verificar sesión activa
function verificarSesion(req, res, next) {
    if (req.session && req.session.autenticado) {
        next();
    } else {
        res.redirect('/');
    }
}

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta protegida: home
app.get('/home', verificarSesion, (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Ruta protegida: json.html
app.get('/json', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'json.html'));
});
/*
PdfConvertir
*/
// Página Convertir PDF A json 
app.get('/PdfConvertir', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'View', 'PDF_JSON.html'));
});


// Página fuera de línea (404 personalizada)
app.get('/Fuera_Linea', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'NotFund.html'));
});
//ruta de login
app.get('/login_home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// Ruta de login (POST)
app.post('/login', (req, res) => {
    const { usuario, clave } = req.body;
    if (usuario === 'admin' && clave === 'P_Gadmin') {
        req.session.autenticado = true; // ✅ Marcar sesión como válida
        res.redirect('/home');
    } else {
        res.send('Credenciales incorrectas');
         res.redirect('/');
    }
});

// Logout y destrucción de sesión
app.get('/logout', (req, res) => {
  if (req.session) {
    // Quitar la sesión activa de tu conjunto
    activeSessions.delete(req.sessionID);

    // Destruir la sesión en el servidor
    req.session.destroy(err => {
      if (err) {
        return res.send('Error al cerrar sesión');
      }
      // Redirigir al login o página pública
      res.redirect('/');
    });
  } else {
    // Si no hay sesión, solo redirige
    res.redirect('/');
  }
});
// Redireccionar a login 
app.get('/logs', (req, res) => {
    res.redirect('/login_home');
});

// Redireccionar a página json
app.get('/jsonConvert', (req, res) => {
    res.redirect('/json');
});

// Redireccionar a página 404
app.get('/notfound', (req, res) => {
    res.redirect('/Fuera_Linea');
});
//sesion creada
app.get('/estado-sesion', (req, res) => {
    if (req.session && req.session.autenticado) {
        res.json({ sesion: true });
    } else {
        res.json({ sesion: false });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
