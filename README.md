# 🥊 Mentalidad de Combate 2.0

## Descripción del Proyecto

**Mentalidad de Combate** es una aplicación web de productividad inspirada en la filosofía del boxeo y el manga. Diseñada para ayudarte a desarrollar disciplina mental, enfoque absoluto y constancia en tus objetivos diarios. La versión 2.0 introduce una arquitectura completamente renovada con base de datos local real, sistema de usuarios y funcionalidades avanzadas sin necesidad de servidor externo.

Esta aplicación está construida utilizando exclusivamente tecnologías web estándar: HTML5, CSS3 y JavaScript vanilla. No requiere frameworks, librerías externas ni conexión a internet para funcionar una vez cargada, gracias al sistema de caché y Service Worker implementado. El diseño visual adopta una estética en blanco y negro inspirada en el boxeo profesional y el manga japonés, con animaciones fluidas y una experiencia de usuario inmersiva que te sumergirá en la mentalidad de un verdadero guerrero.

La filosofía detrás de Mentalidad de Combate es simple pero poderosa: el éxito no es cuestión de talento innato, sino de disciplina diaria. Cada sesión de trabajo enfocada es un round ganado en tu propia vida. La aplicación te proporciona las herramientas para entrenar tu mente como un atleta entrena su cuerpo, estableciendo metas alcanzables, rastreando tu progreso y recompensando tus logros de manera tangible.

## Características Principales

### Sistema de Autenticación con IndexedDB

La versión 2.0 implementa un sistema de autenticación completamente local utilizando IndexedDB, la base de datos integrada en el navegador. Este enfoque elimina la necesidad de servidores externos y garantiza que tus datos permanezcan privados en tu dispositivo. El sistema incluye registro de nuevos usuarios con validación de campos, inicio de sesión con verificación de credenciales, recuperación de sesión automática si cierras y vuelves a abrir la aplicación, y cierre de sesión seguro que limpia los datos de sesión activa.

La seguridad de las contraseñas se maneja mediante un algoritmo de hash simple que transforma las contraseñas en cadenas irreversibles antes de almacenarlas. Aunque para aplicaciones de producción se recomienda implementar autenticación del lado del servidor con técnicas como bcrypt, este enfoque es suficiente para una aplicación personal y demuestra los conceptos fundamentales de gestión de usuarios en el navegador.

El sistema también mantiene un registro de actividad detallado que registra cada acción importante: inicios de sesión, completación de sesiones, desbloqueo de logros, ascensos de nivel y más. Este historial te permite revisar tu evolución y mantenerte motivado al ver tu progreso acumulado a lo largo del tiempo.

### Timer de Combate con Modos Múltiples

El corazón de la aplicación es el temporizador de combate, diseñado específicamente para técnicas de gestión del tiempo como Pomodoro. El sistema ofrece cuatro modos de funcionamiento distintos que se adaptan a diferentes necesidades de concentración. El modo Foco tiene una duración predeterminada de 25 minutos y está diseñado para sesiones de trabajo intensivo donde necesitas máxima concentración sin interrupciones. El modo Descanso Corto dura 5 minutos y te permite recargar energías entre sesiones de foco. El modo Descanso Largo tiene 15 minutos y está pensado para pausas más prolongadas después de varias sesiones. Finalmente, el modo Libre te permite configurar cualquier duración entre 1 y 120 minutos según tus necesidades específicas.

El temporizador incluye una visualización circular progresiva que muestra visualmente el tiempo restante mediante una barra circular que se completa a medida que avanza el tiempo. El sistema emite sonidos al completar cada sesión si los sonidos están activados en la configuración, y también puede vibrar en dispositivos que lo soporten. La funcionalidad de auto-descanso permite que la aplicación cambie automáticamente al modo de descanso corto cuando completas una sesión de foco, facilitando un flujo de trabajo continuo sin intervención manual.

### Sistema de Progresión y Niveles

Cada sesión completada te otorga puntos de experiencia (XP) basados en el tiempo invertido: un punto por cada minuto de foco. Estos puntos te permiten subir de nivel, desbloqueando nuevos títulos que reflejan tu crecimiento como guerrero mental. El sistema de niveles comienza en Novato y progresa a través de Aprendiz, Guerrero, Luchador, Combatiente, Campeón, Legendario, Mítico, Dios y finally Master. Cada nivel requiere más XP que el anterior, reflejando el principio de que el crecimiento verdadero requiere esfuerzo creciente.

La racha de días consecutivos es otro indicador importante de tu disciplina. El sistema rastrea automáticamente si has usado la aplicación cada día y actualiza tu racha en consecuencia. Mantener una racha larga no solo es satisfactorio sino que también desbloquea logros especiales y te mantiene comprometido con tus objetivos diarios.

### Desafíos Diarios y Retos

Cada día la aplicación genera tres desafíos aleatorios que puedes completar para ganar XP adicional. Estos desafíos varían desde completar un número específico de sesiones de foco hasta mantener tu racha activa o acumular cierta cantidad de tiempo de enfoque. Los desafíos están diseñados para ser alcanzables pero requieren esfuerzo deliberado, incentivándote a superar tus límites diarios de manera saludable.

Además de los desafíos diarios, puedes registrarte manualmente para desafíos a largo plazo que se mantienen en tu lista de retos activos hasta completarlos. El sistema hace seguimiento de tu progreso en cada desafío y te notifica cuando los completas, otorgándote las recompensas de XP correspondientes.

### Logros y Sistema de Recompensas

El sistema de logros reconoce hitos significativos en tu viaje de productividad. Hay logros para completar tu primera sesión, alcanzar rachas de 3, 7 y 30 días consecutivos, completar 10, 50 y 100 sesiones totales, acumular 1, 10 y 100 horas de foco, y alcanzar los niveles 5, 10 y 25. Cada logro otorga una cantidad específica de XP como recompensa, incentivándote a explorar diferentes aspectos de la aplicación y mantener variedad en tu práctica.

Los logros desbloqueados se muestran en tu perfil con un distintivo visual, mientras que los logros bloqueados permanecen borrados hasta que cumples las condiciones necesarias. Este sistema de gamificación hace que el desarrollo de hábitos productivos sea más divertido y motivador, especialmente para personas que responden bien a las recompensas externas.

### Estadísticas Avanzadas

La sección de estadísticas proporciona análisis detallados de tu rendimiento a lo largo del tiempo. Puedes filtrar los datos por semana, mes, año o ver todas tus estadísticas desde que comenzaste a usar la aplicación. Los gráficos muestran tu tiempo de foco diario y las sesiones completadas, permitiéndote identificar patrones y tendencias en tu productividad.

Las estadísticas avanzadas incluyen tu mejor racha histórica, tu promedio diario de tiempo de foco, el día de la semana en que eres más productivo y la hora del día en la que rindes mejor. Esta información es invaluable para optimizar tus horarios de trabajo y aprovechar tus momentos de mayor energía para las tareas más exigentes.

### Exportación de Datos

La aplicación incluye una función de exportación que te permite descargar todos tus datos en formato JSON. Esta característica garantiza la portabilidad de tu información y te permite realizar copias de seguridad externas o importar tus datos a otras aplicaciones si alguna vez decides dejar de usar Mentalidad de Combate. El archivo exportado incluye tu perfil, estadísticas, historial de sesiones, logros y registro de actividades completo.

## Arquitectura Técnica

### IndexedDB y Persistencia de Datos

La aplicación utiliza IndexedDB como sistema de almacenamiento principal, una base de datos transaccional de alto rendimiento integrada en todos los navegadores modernos. A diferencia de localStorage, que tiene limitaciones de capacidad y solo almacena strings, IndexedDB puede manejar objetos complejos, grandes cantidades de datos y operaciones asíncronas eficientes.

La arquitectura de la base de datos está organizada en varios almacenes de objetos (object stores), cada uno diseñado para un tipo específico de información. El almacén de usuarios almacena perfiles con credenciales y progreso. El almacén de sesiones guarda registros de cada temporizador completado con marca de tiempo y duración. El almacén de desafíos mantiene el estado de desafíos activos y completados. El almacén de logros registra los logros disponibles y su estado de desbloqueo para cada usuario. El almacén de actividades mantiene un historial cronológico de todas las acciones importantes. Finalmente, el almacén de configuración almacena preferencias del usuario y settings de la aplicación.

### Service Worker y Funcionalidad Offline

El Service Worker implementado permite que la aplicación funcione sin conexión a internet después de la primera carga. Intercepta todas las solicitudes de red y responde desde la caché cuando hay conectividad limitada o nula. También maneja notificaciones push, permitiendo recibir recordatorios para volver a la aplicación cuando tu racha está en riesgo.

### Diseño Responsivo y Accesibilidad

La interfaz está diseñada siguiendo principios mobile-first, adaptándose fluidamente a pantallas de cualquier tamaño. El sistema de navegación inferior facilita el uso con una mano en dispositivos móviles. Los colores de alto contraste y las fuentes legibles garantizan buena accesibilidad. Todos los elementos interactivos tienen áreas táctiles adecuadas y estados visuales claros que indican su función.

## Guía de Instalación y Uso

### Uso Local

Para ejecutar Mentalidad de Combate en tu computadora local, simplemente abre el archivo index.html en cualquier navegador moderno. La aplicación funcionará completamente sin necesidad de instalar nada adicional. Si deseas modificar el código, puedes editar los archivos HTML, CSS y JS con cualquier editor de texto o IDE de tu preferencia.

### Despliegue en Netlify

Netlify es la plataforma de hosting recomendada para esta aplicación debido a su compatibilidad con aplicaciones web estáticas y su generoso plan gratuito. Para desplegar la aplicación, crea una cuenta en Netlify si no tienes una, conecta tu repositorio de GitHub que contenga los archivos de la aplicación, y Netlify detectará automáticamente la configuración en el archivo netlify.toml. El despliegue será automático y tu aplicación estará disponible en minutos con un dominio HTTPS gratuito.

### Despliegue en GitHub Pages

Otra opción válida es GitHub Pages, que también ofrece hosting gratuito para proyectos estáticos. Simplemente activa GitHub Pages en la configuración de tu repositorio y selecciona la rama source. Ten en cuenta que GitHub Pages tiene algunas limitaciones con los Service Workers, por lo que las funcionalidades offline podrían no funcionar completamente.

## Estructura de Archivos

El proyecto está organizado de manera modular y limpia para facilitar el mantenimiento y las modificaciones futuras. El archivo index.html contiene toda la estructura de la aplicación, incluyendo las pantallas de autenticación, el dashboard principal, las diferentes secciones de contenido y los modales emergentes. El archivo style.css alberga más de 1500 líneas de estilos CSS que definen la identidad visual de la aplicación, incluyendo variables CSS para facilitar cambios de tema, media queries para responsividad y animaciones para una experiencia fluida.

El archivo script.js es el núcleo de la aplicación, conteniendo más de 1000 líneas de JavaScript organizadas en clases especializadas. La clase Database encapsula todas las operaciones de IndexedDB. La clase AuthSystem maneja el registro, inicio de sesión y gestión de usuarios. La clase CombatTimer implementa toda la lógica del temporizador con sus modos y transiciones. La clase ChallengeSystem gestiona los desafíos diarios y a largo plazo. Finalmente, la clase App coordina todas las funcionalidades y responde a las interacciones del usuario.

Los archivos adicionales complementan la funcionalidad principal. El manifest.json define los metadatos de la aplicación para instalación como PWA. El sw.js implementa el Service Worker para funcionalidad offline. El archivo netlify.toml configura el despliegue en Netlify. El archivo test.js contiene pruebas automatizadas con Playwright para verificar el funcionamiento correcto de la aplicación.

## Personalización y Extensión

### Modificar Tiempos del Timer

Si deseas ajustar los tiempos predeterminados de los modos de temporizador, busca en el archivo script.js la sección donde se define el objeto modes dentro de la clase CombatTimer. Puedes modificar los valores de duración en segundos según tus preferencias. Recuerda que el modo de foco de 25 minutos es el estándar Pomodoro, pero puedes ajustarlo a lo que mejor funcione para tu flujo de trabajo personal.

### Añadir Nuevos Logros

Para agregar nuevos logros al sistema, localiza el método createDefaultAchievements en la clase AuthSystem. Cada logro se define como un objeto con las propiedades id, name, description, icon, xpReward y unlocked. Añade nuevos objetos al array siguiendo el mismo formato. El sistema verificará automáticamente las condiciones de desbloqueo si las agregas al método checkAchievements.

### Cambiar la Estética Visual

Los colores y estilos principales están definidos como variables CSS en la parte superior del archivo style.css. Puedes modificar la paleta de colores cambiando los valores de las variables como --black, --white, --accent y otras. Para un cambio más drástico, también puedes ajustar las fuentes cambiando las referencias a Google Fonts en el head del HTML.

### Agregar Nuevas Secciones

Para añadir nuevas secciones a la aplicación, primero crea el contenido HTML en index.html dentro del elemento content-area, luego añade los estilos correspondientes en style.css, y finalmente conecta la navegación en el método setupNavigation de la clase App en script.js. El sistema de navegación está diseñado para ser fácilmente extensible.

## Contribución y Desarrollo Futuro

Esta aplicación fue diseñada con la filosofía de simplicidad y autonomía en mente. No depende de servicios externos, frameworks complicados ni configuraciones complejas. Si deseas contribuir al proyecto, puedes hacerlo de muchas maneras: reportando errores, sugiriendo nuevas funcionalidades, mejorando la documentación, o añadiendo nuevas características que beneficien a toda la comunidad de usuarios.

Entre las posibles mejoras futuras que podrían implementarse se encuentran: sincronización entre dispositivos mediante una cuenta en la nube, integración con calendarios para programación automática de sesiones, modo oscuro adicional además del actual, temas visuales intercambiables, sistema de estadísticas más elaborado con comparativas, integración con aplicaciones de seguimiento de hábitos, y soporte para múltiples idiomas.

## Licencia y Uso

Este proyecto se distribuye bajo licencia de código abierto y puede ser utilizado, modificado y compartido libremente. El objetivo original es proporcionar una herramienta gratuita y efectiva para el desarrollo personal, y esperamos que terus de la comunidad contribuyan a hacerlo aún mejor.

---

**Mentalidad de Combate** no es solo una aplicación, es una filosofía de vida. El boxeo nos enseña que el éxito no llega de la noche a la mañana, sino de miles de horas de entrenamiento disciplinado. Cada sesión de foco completada es un round ganado. Cada día de racha mantenido es una prueba de carácter. Cada nivel alcanzado es evidencia de crecimiento.

🥊 **Entrena tu mente. Gana tu combate.**

