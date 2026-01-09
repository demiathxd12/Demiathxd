# Mentalidad de Combate - Guía de Despliegue en Netlify

## Verificación del Proyecto

Antes del despliegue, se realizó una prueba exhaustiva con Playwright para garantizar que todos los componentes funcionan correctamente. Los resultados de las pruebas fueron satisfactorios: la página carga correctamente, todos los elementos principales están presentes, la navegación entre secciones funciona sin problemas, las frases motivacionales se muestran adecuadamente, el contador de racha opera correctamente y no se detectaron errores críticos de JavaScript. Estas pruebas confirman que el proyecto está listo para ser desplegado en producción.

## Archivos del Proyecto

El proyecto contiene todos los archivos necesarios para un funcionamiento óptimo en Netlify. El archivo `index.html` de 14KB contiene la estructura semántica con sistema de navegación y sección de retos. El archivo `style.css` de 25KB implementa el diseño completamente responsivo con animaciones suaves y estética en blanco y negro. El archivo `script.js` de 35KB contiene toda la lógica del sistema de retos, temporizador configurable y seguimiento de progreso. El archivo `background.mp4` de 4.5MB proporciona el video de fondo que mejora la experiencia visual. Adicionalmente, se incluyen archivos de configuración como `netlify.toml` para optimización del servidor y `README.md` con instrucciones detalladas de despliegue.

## Pasos para Publicar en Netlify

El proceso de despliegue en Netlify es extremadamente sencillo y puede realizarse de varias formas según las preferencias del usuario. La primera opción consiste en utilizar Netlify Drop: simplemente accede a la dirección app.netlify.com/drop desde tu navegador, arrastra la carpeta completa del proyecto hacia el área designada y Netlify generará automáticamente un sitio web con una URL única y aleatoria. Esta opción no requiere registro ni configuración adicional, siendo ideal para pruebas rápidas o proyectos personales.

La segunda opción implica conectar el proyecto con un repositorio de GitHub. Para ello, primero debes subir la carpeta del proyecto a un repositorio en GitHub utilizando Git desde la terminal o la interfaz gráfica de GitHub Desktop. Una vez publicado el repositorio, inicia sesión en Netlify, haz clic en "Add new site" y selecciona "Import an existing project". Elige tu repositorio de la lista, confirma los ajustes de construcción (que no son necesarios para un sitio estático como este) y haz clic en "Deploy site". Netlify configurará automáticamente el entorno de construcción y publicará tu aplicación. Esta opción es recomendable si planeas realizar actualizaciones frecuentes del proyecto.

La tercera opción utiliza Netlify CLI para un despliegue más controlado. Primero, instala la CLI globalmente mediante el comando `npm install netlify-cli -g`. Luego, autentícate con `netlify login` y ejecuta `netlify deploy --prod --dir=.` desde la carpeta del proyecto. Esta opción ofrece mayor control sobre el proceso de despliegue y es preferida por desarrolladores avanzados.

## Configuración Avanzada

El archivo `netlify.toml` incluido en el proyecto proporciona configuraciones optimizadas para el servidor de Netlify. Este archivo define encabezados de seguridad que protegen la aplicación contra ataques comunes como clickjacking y cross-site scripting. También configura políticas de caché para los diferentes tipos de archivos: el video de fondo se cachea durante un año completo, al igual que los archivos CSS y JavaScript, lo que mejora significativamente el rendimiento en visitas posteriores. Adicionalmente, se configuran encabezados CORS para las fuentes web, garantizando una carga rápida y sin problemas de los recursos tipográficos.

Estas configuraciones son completamente opcionales y el sitio funcionará perfectamente sin ellas, ya que Netlify proporciona valores predeterminados seguros. Sin embargo, incluirlas mejora el rendimiento y la seguridad de la aplicación en producción.

## Consideraciones Técnicas

El video de fondo es un elemento opcional que mejora la experiencia visual pero no es crítico para el funcionamiento de la aplicación. Si decides no incluir el archivo `background.mp4`, la aplicación mostrará un fondo oscuro elegante que mantiene la estética profesional del proyecto. El sistema maneja correctamente la ausencia del video sin mostrar errores visibles al usuario.

Los datos de progreso del usuario se guardan mediante localStorage del navegador, lo que significa que cada usuario tiene su progreso independiente almacenado en su propio dispositivo. Esta arquitectura no requiere backend y funciona completamente en el lado del cliente. Sin embargo, esto también significa que los datos no se sincronizan entre diferentes dispositivos o navegadores. Si necesitas sincronización multiplataforma, sería necesario implementar un backend con base de datos.

La aplicación está optimizada para funcionar sin conexión después de la primera carga, lo que la hace ideal para usuarios con conectividad intermitente. El peso total del proyecto es de aproximadamente 4.6MB, con el video representando la mayor parte de este tamaño. Para conexiones más lentas, se recomienda comprimir el video o reducir su resolución.

## Personalización Post-Despliegue

Una vez desplegada la aplicación en Netlify, puedes personalizarla según tus necesidades. Para cambiar el video de fondo, simplemente reemplaza el archivo `background.mp4` por otro video en formato MP4, idealmente con duración recomendada de loop infinito y tamaño máximo de 10MB para mantener tiempos de carga óptimos. Los colores de la aplicación pueden modificarse editando las variables CSS en el archivo `style.css`, específicamente las variables `--color-accent` para el color principal y `--color-bg-primary` para el fondo oscuro.

Si necesitas realizar cambios después del despliegue inicial y utilizaste la opción de repositorio conectado, simplemente haz push de los cambios a GitHub y Netlify reconstruirá automáticamente el sitio. Para despliegues mediante arrastre, debes repetir el proceso con la carpeta actualizada.

## Soporte y Recursos

La aplicación Mentalidad de Combate ha sido diseñada y probada siguiendo las mejores prácticas de desarrollo web frontend. El código utiliza exclusivamente HTML5, CSS3 y JavaScript puro sin dependencias externas, lo que garantiza compatibilidad con todos los navegadores modernos y facilita el mantenimiento a largo plazo. La arquitectura modular del código JavaScript permite agregar nuevas funcionalidades en el futuro sin afectar las existentes.

Para dudas sobre el despliegue o personalización adicional, puedes contactar al creador del proyecto a través del correo electrónico incluido en el pie de página de la aplicación. Netlify también ofrece documentación extensa y una comunidad activa para resolver cualquier problema técnico relacionado con el alojamiento de sitios estáticos.

---

**Proyecto listo para producción.**
**Despliegue recomendado: Netlify Drop (más rápido) o GitHub Connect (más profesional).**
