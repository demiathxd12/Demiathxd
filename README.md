# 📦 Mentalidad de Combate - Despliegue en Netlify

## 🚀 Métodos de Despliegue

### Método 1: Arrastrar y Soltar (Más Sencillo)

1. Ve a [Netlify Drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `mentalidad-de-combate` completa
3. Netlify generará automáticamente un sitio con URL única
4. ¡Listo! Tu app está en línea

### Método 2: Conectando con GitHub

1. Sube el proyecto a un repositorio GitHub
2. Inicia sesión en [Netlify](https://app.netlify.com)
3. Click en "Add new site" → "Import an existing project"
4. Selecciona tu repositorio
5. Configura los ajustes de build (no necesarios para sitio estático)
6. Click en "Deploy site"

### Método 3: Netlify CLI

```bash
# Instalar Netlify CLI
npm install netlify-cli -g

# Iniciar sesión
netlify login

# Deploy desde la carpeta
netlify deploy --prod --dir=.
```

## 📁 Archivos Necesarios para el Deploy

```
mentalidad-de-combate/
├── index.html          # Archivo principal
├── style.css          # Estilos
├── script.js          # Lógica JavaScript
├── background.mp4     # Video de fondo (opcional)
├── netlify.toml       # Configuración de Netlify (opcional)
└── README.md          # Este archivo
```

## ⚠️ Notas Importantes

### Video de Fondo
- El archivo `background.mp4` es opcional
- Si no se incluye, la app funciona perfectamente con un fondo oscuro
- El video mejora la experiencia pero no es crítico

### LocalStorage
- Los datos de progreso se guardan en el navegador del usuario
- Cada usuario tiene su propio progreso independiente
- No hay sincronización entre dispositivos (sin backend)

### Rendimiento
- La app carga instantáneamente (sin dependencias externas)
- Funciona offline después de la primera carga
- Totalmente responsiva en todos los dispositivos

## 🎨 Personalización

### Cambiar el Video de Fondo
Reemplaza `background.mp4` con tu propio video:
- Formato: MP4
- Duración recomendada: Loop infinito
- Tamaño máximo recomendado: 10MB

### Cambiar Colores
Edita las variables CSS en `style.css`:
```css
:root {
    --color-accent: #ffffff;  /* Color principal */
    --color-bg-primary: #0b0b0b;  /* Fondo oscuro */
}
```

## 🔗 Recursos

- [Documentación de Netlify](https://docs.netlify.com/)
- [Netlify CLI](https://cli.netlify.com/)
- [Formularios en Netlify](https://docs.netlify.com/forms/setup/)

## 📝 Licencia

Este proyecto es de código abierto. Feel free to use and modify.

---

**Creado por Demiath Jiménez**
**Contacto: demiathviadero@gmail.com**
