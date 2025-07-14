# P-G_Contadores
Herramienta de convertidor de json a exel csv
# 🧾 Proyecto: Visualizador y Exportador de JSON

Aplicación web construida con **Node.js**, **Express** y HTML puro para una empresa de servicios contables. Permite:

- Subida de archivos `.json`
- Visualización de datos
- Exportación a Excel (futuro)
- Sistema de login con control de sesiones
- Seguridad por sesión limitada y token temporal

---

## 🚀 Tecnologías utilizadas

- **Node.js**
- **Express**
- **HTML + CSS + JS Vanilla**
- **Multer** para carga de archivos
- **express-session** para manejo de sesiones
- **Tailwind CSS** para estilos (en desarrollo)
- **Render** para despliegue en la nube

---

## 🔐 Funcionalidad destacada

- Login con usuario y contraseña
- Control de máximo **2 sesiones activas simultáneas**
- Sesiones duran **24 horas**
- Logout manual y redirección segura
- Navbar dinámico con nombre del usuario autenticado
- Protección de rutas (`/home`, `/json`) solo si hay sesión activa

---

## 📁 Estructura del proyecto

