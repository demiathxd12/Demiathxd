/* ================================================
   MENTALIDAD DE COMBATE - Lógica Expandida
   Sistema de Retos Progresivos
   Desarrollado con JavaScript Puro (Vanilla JS)
   ================================================ */

// ================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ================================================

// Duraciones disponibles para el temporizador (en segundos)
const ROUND_DURATIONS = {
    quick: 60,      // 1 minuto - Enfoque rápido
    classic: 180,   // 3 minutos - Round clásico
    endurance: 300  // 5 minutos - Resistencia mental
};

// Elementos del DOM - Principales
const elements = {
    // Secciones
    homeSection: document.getElementById('homeSection'),
    challengesSection: document.getElementById('challengesSection'),
    progressSection: document.getElementById('progressSection'),
    heroSection: document.getElementById('heroSection'),
    combatPanel: document.getElementById('combatPanel'),
    victoryPanel: document.getElementById('victoryPanel'),
    
    // Temporizador
    combatBtn: document.getElementById('combatBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    resetBtn: document.getElementById('resetBtn'),
    restBtn: document.getElementById('restBtn'),
    nextRoundBtn: document.getElementById('nextRoundBtn'),
    timerDisplay: document.getElementById('timerDisplay'),
    progressBar: document.getElementById('progressBar'),
    roundNumberDisplay: document.getElementById('roundNumberDisplay'),
    roundOptions: document.querySelectorAll('.round-option'),
    
    // Citas y mensajes
    quoteText: document.getElementById('quoteText'),
    quoteCategory: document.getElementById('quoteCategory'),
    victoryMessage: document.getElementById('victoryMessage'),
    betweenRoundsMessage: document.getElementById('betweenRoundsMessage'),
    
    // Contador de racha
    streakCount: document.getElementById('streakCount'),
    
    // Video de fondo
    bgVideo: document.getElementById('bgVideo'),
    
    // Notificaciones
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText'),
    
    // Navegación
    navBtns: document.querySelectorAll('.nav-btn')
};

// Variables de estado
let timerInterval = null;
let currentTime = ROUND_DURATIONS.classic;
let currentDuration = ROUND_DURATIONS.classic;
let isRunning = false;
let roundNumber = 1;

// ================================================
// FRASES MOTIVACIONALES POR CATEGORÍA
// ================================================

const quotes = {
    disciplina: [
        "La disciplina es hacer lo que necesitas hacer, incluso cuando no quieres hacerlo.",
        "Sin sacrificio no hay victoria. Cada día de esfuerzo cuenta.",
        "La consistencia supera al talento cuando el talento no es constante.",
        "No esperes la motivación. Créala mediante la acción diaria.",
        "La excelencia no es un acto, sino un hábito que se construye cada día.",
        "Tu futuro se construye con las decisiones que tomas hoy.",
        "La disciplina libertad da. Controlarte es tu mayor poder.",
        "Cada pequeña acción disciplinada te acerca a tus grandes metas."
    ],
    enfoque: [
        "El enfoque es el puente entre la intención y la acción.",
        "Elimina las distracciones. Tu mente solo puede procesar una cosa a la vez.",
        "Lo importante no es cuánto tiempo trabajas, sino cuánto enfocas.",
        "La multitarea es el enemigo del rendimiento.",
        "Enfócate en un paso a la vez. El camino se hace caminando.",
        "Tu concentración es tu arma más poderosa.",
        "En el silencio de tu mente encontrarás las respuestas que buscas.",
        "Divide las grandes tareas en pequeños pasos enfocados."
    ],
    resiliencia: [
        "El dolor que sientes hoy será tu fuerza de mañana.",
        "No pares cuando estés cansado. Para cuando hayas terminado.",
        "Cada obstáculo es una oportunidad de demostrar tu fuerza.",
        "La mentalidad de campeones se forja en los momentos difíciles.",
        "Caer es optional. Levantarse es obligatorio.",
        "Los momentos más oscuros preceden a los amaneceres más brillantes.",
        "Tu mayor prueba será tu mayor maestro.",
        "La adversidad no te construye, te revela."
    ],
    mentalidad: [
        "Tu único límite eres tú mismo.",
        "Cree que puedes y ya estás a mitad del camino.",
        "El boxeo mental es tuyo. Domina tu mente, domina tu vida.",
        "Despierta, trabaja, conquista. Repite.",
        "Cada round ganado te hace más fuerte e indomable.",
        "La victoria pertenece a quienes creen en ella.",
        "Tu mente te dice que pares, tu corazón te dice que continúes.",
        "En la oscuridad encuentra tu luz interior."
    ]
};

// Mensajes entre rounds
const betweenRoundsMessages = [
    "Respira. Ajusta la guardia. Continúa.",
    "El descanso es parte del entrenamiento.",
    "Mantén la mente fría. El siguiente round te espera.",
    "Recupera fuerzas. La batalla no ha terminado.",
    "Visualiza tu victoria. El éxito está en tu mente.",
    "Cada segundo de descanso es preparación para la victoria.",
    "El campeon sabe cuándo descansar y cuándo luchar."
];

// ================================================
// RETOS PREDEFINIDOS
// ================================================

// Reto 100 Días de Flexiones - Progresión
const pushupProgression = [];
for (let day = 1; day <= 100; day++) {
    // Progresión no lineal: días fáciles y días difíciles
    if (day <= 20) {
        pushupProgression.push(10 + (day - 1) * 2);
    } else if (day <= 40) {
        pushupProgression.push(50 + (day - 21) * 3);
    } else if (day <= 60) {
        pushupProgression.push(110 + (day - 41) * 4);
    } else if (day <= 80) {
        pushupProgression.push(190 + (day - 61) * 5);
    } else {
        pushupProgression.push(290 + (day - 81) * 5);
    }
}

// Reto Mental - 30 Días de Disciplina
const mentalDisciplineTasks = [
    "Levántate inmediatamente cuando suene la alarma.",
    "Realiza una tarea importante sin distracciones durante 25 minutos.",
    "No revises redes sociales durante las primeras 2 horas del día.",
    "Haz tu cama en cuanto te levantes.",
    "Bebe 2 litros de agua a lo largo del día.",
    "Realiza 10 minutos de respiración consciente.",
    "Escribe 3 cosas por las que estás agradecido.",
    "Evita quejarte durante todo el día.",
    "Completa una tarea que has estado posponiendo.",
    "Lee al menos 15 minutos de contenido constructivo.",
    "No comas alimentos procesados durante todo el día.",
    "Realiza 20 minutos de ejercicio físico.",
    "Medita en silencio durante 10 minutos.",
    "Organiza tu espacio de trabajo o habitación.",
    "Planea tu día antes de dormir.",
    "No uses el teléfono 1 hora antes de dormir.",
    "Saluda a alguien nuevo o inicia una conversación.",
    "Aprende algo nuevo hoy, sin importar qué tan pequeño.",
    "Pospone una recompensa hasta terminar una tarea importante.",
    "Realiza un acto de bondad sin esperar nada a cambio.",
    "Duerme 7-8 horas completas.",
    "Avoid caffeine after 2 PM.",
    "Write down your goals for the week.",
    "Review your progress and ajusta tu estrategia.",
    "Say 'no' to something that doesn't align with your priorities.",
    "Take a cold shower or splash cold water on your face.",
    "Practice deep breathing 5 times when stressed.",
    "Finish your last meal 3 hours before sleeping.",
    "Do something that scares you, no matter how small.",
    "Celebrate your wins, big or small."
];

// Traducciones para el día 22 (estaba en inglés)
mentalDisciplineTasks[21] = "Evita la cafeína después de las 14:00.";

// Reto Físico Diario - Ejercicios
const dailyExercises = [
    { name: "Flexiones", reps: "15-25 repeticiones", icon: "💪" },
    { name: "Abdominales", reps: "20-30 repeticiones", icon: "🔥" },
    { name: "Sentadillas", reps: "20-30 repeticiones", icon: "🦵" },
    { name: "Plancha", reps: "30-60 segundos", icon: "🪵" },
    { name: "Zancadas", reps: "10-15 por pierna", icon: "🦶" },
    { name: "Burpees", reps: "10-15 repeticiones", icon: "⚡" },
    { name: "Mountain Climbers", reps: "30-50 repeticiones", icon: "🏃" },
    { name: "Tríceps Dips", reps: "15-20 repeticiones", icon: "💪" },
    { name: "Elevaciones de Piernas", reps: "15-20 repeticiones", icon: "🦵" },
    { name: "Puentes", reps: "15-20 repeticiones", icon: "🔥" }
];

// ================================================
// DATOS DE LOGROS
// ================================================

const achievements = {
    "first-round": {
        name: "Primer Round",
        icon: "🥊",
        condition: () => getTotalRounds() >= 1
    },
    "week-streak": {
        name: "Semana de Hierro",
        icon: "📅",
        condition: () => loadStreak() >= 7
    },
    "pushup-warrior": {
        name: "Guerrero de Flexiones",
        icon: "💪",
        condition: () => {
            const data = loadChallengeData('pushup');
            return data.completed >= 30;
        }
    },
    "mental-master": {
        name: "Maestro Mental",
        icon: "🧠",
        condition: () => {
            const data = loadChallengeData('mental');
            return data.completed >= 15;
        }
    },
    "century": {
        name: "Cien Rounds",
        icon: "💯",
        condition: () => getTotalRounds() >= 100
    },
    "discipline-king": {
        name: "Rey de la Disciplina",
        icon: "👑",
        condition: () => {
            const pushup = loadChallengeData('pushup');
            const mental = loadChallengeData('mental');
            return pushup.completed >= 50 && mental.completed >= 20;
        }
    }
};

// ================================================
// FUNCIONES UTILITARIAS
// ================================================

/**
 * Genera un número aleatorio entre min y max
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Obtiene una frase aleatoria de una categoría específica
 */
function getQuote(category) {
    const categoryQuotes = quotes[category] || quotes.disciplina;
    const randomIndex = getRandomInt(0, categoryQuotes.length - 1);
    return {
        text: categoryQuotes[randomIndex],
        category: category
    };
}

/**
 * Obtiene una frase motivacional aleatoria de cualquier categoría
 */
function getRandomQuote() {
    const categories = Object.keys(quotes);
    const randomCategory = categories[getRandomInt(0, categories.length - 1)];
    return getQuote(randomCategory);
}

/**
 * Formatea el tiempo en minutos y segundos
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
        minutes: mins.toString().padStart(2, '0'),
        seconds: secs.toString().padStart(2, '0')
    };
}

/**
 * Obtiene la fecha actual formateada
 */
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Obtiene ayer formateado
 */
function getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

// ================================================
// PERSISTENCIA CON LOCALSTORAGE
// ================================================

// Claves de localStorage
const STORAGE_KEYS = {
    STREAK: 'combatStreak',
    LAST_ACTIVE_DATE: 'combatLastActiveDate',
    TOTAL_ROUNDS: 'combatTotalRounds',
    CHALLENGES_COMPLETED: 'combatChallengesCompleted',
    PUSHUP_CHALLENGE: 'combatPushupChallenge',
    MENTAL_CHALLENGE: 'combatMentalChallenge',
    DAILY_EXERCISE: 'combatDailyExercise',
    UNLOCKED_ACHIEVEMENTS: 'combatUnlockedAchievements'
};

/**
 * Guarda datos de un reto específico
 */
function saveChallengeData(type, data) {
    localStorage.setItem(STORAGE_KEYS[type + '_CHALLENGE'], JSON.stringify(data));
}

/**
 * Carga datos de un reto específico
 */
function loadChallengeData(type) {
    const saved = localStorage.getItem(STORAGE_KEYS[type + '_CHALLENGE']);
    if (saved) {
        return JSON.parse(saved);
    }
    // Datos por defecto según el tipo
    if (type === 'pushup') {
        return { day: 1, completed: 0, lastCompleted: null };
    } else if (type === 'mental') {
        return { day: 1, completed: 0, lastCompleted: null, taskIndex: 0 };
    } else if (type === 'daily') {
        return { date: null, exercise: null };
    }
    return { day: 1, completed: 0, lastCompleted: null };
}

/**
 * Guarda la racha
 */
function saveStreak(streak) {
    localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString());
}

/**
 * Carga la racha
 */
function loadStreak() {
    const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
    return saved ? parseInt(saved, 10) : 0;
}

/**
 * Guarda la última fecha de actividad
 */
function saveLastActiveDate(date) {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, date);
}

/**
 * Carga la última fecha de actividad
 */
function loadLastActiveDate() {
    return localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE);
}

/**
 * Guarda el total de rounds
 */
function saveTotalRounds(count) {
    localStorage.setItem(STORAGE_KEYS.TOTAL_ROUNDS, count.toString());
}

/**
 * Carga el total de rounds
 */
function getTotalRounds() {
    const saved = localStorage.getItem(STORAGE_KEYS.TOTAL_ROUNDS);
    return saved ? parseInt(saved, 10) : 0;
}

/**
 * Guarda los desafíos completados
 */
function saveChallengesCompleted(count) {
    localStorage.setItem(STORAGE_KEYS.CHALLENGES_COMPLETED, count.toString());
}

/**
 * Carga los desafíos completados
 */
function getChallengesCompleted() {
    const saved = localStorage.getItem(STORAGE_KEYS.CHALLENGES_COMPLETED);
    return saved ? parseInt(saved, 10) : 0;
}

/**
 * Guarda logros desbloqueados
 */
function saveUnlockedAchievements(achievements) {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, JSON.stringify(achievements));
}

/**
 * Carga logros desbloqueados
 */
function loadUnlockedAchievements() {
    const saved = localStorage.getItem(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS);
    return saved ? JSON.parse(saved) : [];
}

// ================================================
// ACTUALIZACIÓN DE LA RACHA
// ================================================

/**
 * Actualiza la racha verificando la fecha
 */
function updateStreak() {
    const today = getTodayString();
    const lastActive = loadLastActiveDate();
    let currentStreak = loadStreak();
    
    if (lastActive === today) {
        // Ya registró actividad hoy
        return currentStreak;
    } else if (lastActive === getYesterdayString()) {
        // Continuidad preservada
        saveLastActiveDate(today);
        return currentStreak;
    } else if (lastActive === null) {
        // Primera vez
        saveLastActiveDate(today);
        return 1;
    } else {
        // Racha rota
        saveLastActiveDate(today);
        return 1;
    }
}

/**
 * Incrementa la racha por actividad del día
 */
function incrementStreak() {
    const today = getTodayString();
    const lastActive = loadLastActiveDate();
    let streak = loadStreak();
    
    if (lastActive !== today) {
        if (lastActive === getYesterdayString() || lastActive === null) {
            streak++;
        } else {
            streak = 1;
        }
        saveStreak(streak);
        saveLastActiveDate(today);
        elements.streakCount.textContent = streak;
    }
    
    return streak;
}

// ================================================
// CONTROL DEL TEMPORIZADOR
// ================================================

/**
 * Actualiza la visualización del temporizador
 */
function updateTimerDisplay() {
    const time = formatTime(currentTime);
    
    const minutesEl = elements.timerDisplay.querySelector('.timer-minutes');
    const secondsEl = elements.timerDisplay.querySelector('.timer-seconds');
    
    minutesEl.textContent = time.minutes;
    secondsEl.textContent = time.seconds;
    
    // Actualiza la barra de progreso
    const progressPercent = (currentTime / currentDuration) * 100;
    elements.progressBar.style.width = `${progressPercent}%`;
    
    // Efecto visual cuando queda poco tiempo
    if (currentTime <= 30) {
        elements.timerDisplay.classList.add('active');
    } else {
        elements.timerDisplay.classList.remove('active');
    }
}

/**
 * Inicia el temporizador del round
 */
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    elements.timerDisplay.classList.add('active');
    
    // Reducir volumen del video
    setVideoVolume(0.1);
    
    // Obtener cita según la categoría activa
    const activeCategory = getActiveCategory();
    const quote = getQuote(activeCategory);
    elements.quoteText.textContent = quote.text;
    elements.quoteCategory.textContent = `[${activeCategory.toUpperCase()}]`;
    
    timerInterval = setInterval(() => {
        currentTime--;
        updateTimerDisplay();
        
        if (currentTime <= 0) {
            completeRound();
        }
    }, 1000);
}

/**
 * Detiene el temporizador
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isRunning = false;
    
    // Restaurar volumen del video
    setVideoVolume(0.3);
}

/**
 * Reinicia el temporizador
 */
function resetTimer() {
    stopTimer();
    currentTime = currentDuration;
    updateTimerDisplay();
    elements.timerDisplay.classList.remove('active');
    
    // Generar nueva cita motivacional
    const quote = getRandomQuote();
    elements.quoteText.textContent = quote.text;
    elements.quoteCategory.textContent = `[${quote.category.toUpperCase()}]`;
}

/**
 * Completa el round exitosamente
 */
function completeRound() {
    stopTimer();
    
    // Actualizar estadísticas
    const newStreak = incrementStreak();
    const totalRounds = getTotalRounds() + 1;
    saveTotalRounds(totalRounds);
    
    // Actualizar UI
    elements.streakCount.textContent = newStreak;
    
    // Mensajes de victoria
    const messages = [
        `¡Impresionante! ${totalRounds} rounds de disciplina total.`,
        `Tu constancia te hace imparable. Victoria #${totalRounds}.`,
        `El boxeo mental es tuyo. ${newStreak} días de fuego.`,
        `Cada round te acerca más a tu mejor versión. ${totalRounds} y contando.`
    ];
    
    elements.victoryMessage.textContent = messages[getRandomInt(0, messages.length - 1)];
    
    // Mensaje entre rounds
    elements.betweenRoundsMessage.textContent = betweenRoundsMessages[getRandomInt(0, betweenRoundsMessages.length - 1)];
    
    // Animación de celebración
    const victoryIcon = document.querySelector('.victory-icon');
    victoryIcon.classList.add('celebrating');
    setTimeout(() => victoryIcon.classList.remove('celebrating'), 600);
    
    // Verificar logros
    checkAchievements();
    
    // Mostrar panel de victoria
    showVictoryPanel();
}

/**
 * Obtiene la categoría activa basada en la sección
 */
function getActiveCategory() {
    if (elements.challengesSection.classList.contains('active')) {
        return 'disciplina';
    } else if (elements.combatPanel.classList.contains('active')) {
        return quotes[Object.keys(quotes)[getRandomInt(0, 3)]] ? 'disciplina' : 'disciplina';
    }
    return 'disciplina';
}

// ================================================
// CONTROL DE INTERFAZ
// ================================================

/**
 * Cambia entre secciones
 */
function switchSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Actualizar botones de navegación
    elements.navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Reiniciar panel de combate si vamos a inicio
    if (sectionName === 'home') {
        resetToHero();
    }
    
    // Actualizar progreso
    if (sectionName === 'progress') {
        updateProgressDisplay();
    }
}

/**
 * Muestra el panel de combate
 */
function showCombatPanel() {
    elements.heroSection.style.display = 'none';
    elements.victoryPanel.classList.remove('active');
    elements.combatPanel.classList.add('active');
    
    resetTimer();
    elements.timerDisplay.focus();
}

/**
 * Muestra el panel de victoria
 */
function showVictoryPanel() {
    elements.combatPanel.classList.remove('active');
    elements.victoryPanel.classList.add('active');
}

/**
 * Vuelve al modo descanso
 */
function goToRest() {
    elements.combatPanel.classList.remove('active');
    elements.victoryPanel.classList.add('active');
}

/**
 * Regresa al combate para siguiente ronda
 */
function returnToCombat() {
    elements.victoryPanel.classList.remove('active');
    elements.combatPanel.classList.add('active');
    
    roundNumber++;
    elements.roundNumberDisplay.textContent = `#${roundNumber}`;
    
    resetTimer();
}

/**
 * Cancela el combate actual
 */
function cancelCombat() {
    stopTimer();
    resetToHero();
}

/**
 * Reinicia al estado inicial
 */
function resetToHero() {
    elements.combatPanel.classList.remove('active');
    elements.victoryPanel.classList.remove('active');
    elements.heroSection.style.display = 'block';
    roundNumber = 1;
    elements.roundNumberDisplay.textContent = `#${roundNumber}`;
    
    setVideoVolume(0.3);
}

/**
 * Ajusta el volumen del video
 */
function setVideoVolume(volume) {
    if (elements.bgVideo) {
        elements.bgVideo.volume = volume;
    }
}

// ================================================
// SISTEMA DE RETOS
// ================================================

/**
 * Inicializa el reto de flexiones
 */
function initPushupChallenge() {
    const data = loadChallengeData('pushup');
    const today = getTodayString();
    
    // Verificar si es un nuevo día
    if (data.lastCompleted !== today) {
        // Asegurar que el día avance solo si completó el anterior
        document.getElementById('pushupDay').textContent = data.day;
        document.getElementById('pushupReps').textContent = `${pushupProgression[data.day - 1]} flexiones`;
    }
    
    // Actualizar barra de progreso
    const progress = (data.day / 100) * 100;
    document.getElementById('pushupProgressBar').style.width = `${progress}%`;
}

/**
 * Completa un día del reto de flexiones
 */
function completePushupChallenge() {
    const data = loadChallengeData('pushup');
    const today = getTodayString();
    
    if (data.lastCompleted === today) {
        showNotification('¡Ya completaste el reto hoy! Vuelve mañana.');
        return;
    }
    
    // Marcar como completado hoy
    data.lastCompleted = today;
    data.completed++;
    
    // Avanzar al siguiente día
    if (data.day < 100) {
        data.day++;
    }
    
    saveChallengeData('pushup', data);
    
    // Actualizar UI
    initPushupChallenge();
    
    // Actualizar estadísticas
    const total = getChallengesCompleted() + 1;
    saveChallengesCompleted(total);
    incrementStreak();
    
    // Verificar logros
    checkAchievements();
    
    // Feedback visual
    const card = document.getElementById('pushupChallenge');
    card.classList.add('completing');
    setTimeout(() => card.classList.remove('completing'), 500);
    
    showNotification(`¡Día ${data.day} completado! ${data.completed} días totales.`);
}

/**
 * Reinicia el reto de flexiones
 */
function resetPushupChallenge() {
    if (confirm('¿Estás seguro de que quieres reiniciar el progreso de flexiones?')) {
        localStorage.removeItem(STORAGE_KEYS.PUSHUP_CHALLENGE);
        initPushupChallenge();
        showNotification('Progreso de flexiones reiniciado.');
    }
}

/**
 * Inicializa el reto mental
 */
function initMentalChallenge() {
    const data = loadChallengeData('mental');
    const today = getTodayString();
    
    // Verificar si es un nuevo día
    if (data.lastCompleted !== today) {
        document.getElementById('mentalDay').textContent = data.day;
        document.getElementById('mentalTaskText').textContent = mentalDisciplineTasks[data.taskIndex];
    }
    
    // Actualizar barra de progreso
    const progress = (data.day / 30) * 100;
    document.getElementById('mentalProgressBar').style.width = `${progress}%`;
}

/**
 * Completa un día del reto mental
 */
function completeMentalChallenge() {
    const data = loadChallengeData('mental');
    const today = getTodayString();
    
    if (data.lastCompleted === today) {
        showNotification('¡Ya completaste el reto mental hoy!');
        return;
    }
    
    data.lastCompleted = today;
    data.completed++;
    
    // Avanzar al siguiente día y tarea
    if (data.day < 30) {
        data.day++;
        data.taskIndex = (data.taskIndex + 1) % mentalDisciplineTasks.length;
    }
    
    saveChallengeData('mental', data);
    
    initMentalChallenge();
    
    const total = getChallengesCompleted() + 1;
    saveChallengesCompleted(total);
    incrementStreak();
    checkAchievements();
    
    const card = document.getElementById('mentalChallenge');
    card.classList.add('completing');
    setTimeout(() => card.classList.remove('completing'), 500);
    
    showNotification('¡Reto mental completado! Tu mente es más fuerte.');
}

/**
 * Reinicia el reto mental
 */
function resetMentalChallenge() {
    if (confirm('¿Reiniciar el progreso del reto mental?')) {
        localStorage.removeItem(STORAGE_KEYS.MENTAL_CHALLENGE);
        initMentalChallenge();
        showNotification('Progreso mental reiniciado.');
    }
}

/**
 * Inicializa el reto físico diario
 */
function initDailyExercise() {
    const data = loadChallengeData('daily');
    const today = getTodayString();
    
    if (data.date !== today || !data.exercise) {
        // Generar nuevo ejercicio
        const exercise = dailyExercises[getRandomInt(0, dailyExercises.length - 1)];
        data.exercise = exercise;
        data.date = today;
        saveChallengeData('daily', data);
    }
    
    document.getElementById('exerciseText').textContent = data.exercise.name;
    document.getElementById('exerciseReps').textContent = data.exercise.reps;
}

/**
 * Completa el ejercicio diario
 */
function completeDailyExercise() {
    const data = loadChallengeData('daily');
    
    showNotification('¡Ejercicio completado! Tu cuerpo te lo agradece.');
    
    // Animación de celebración
    const animation = document.getElementById('exerciseAnimation');
    animation.classList.add('active');
    setTimeout(() => animation.classList.remove('active'), 2000);
    
    const total = getChallengesCompleted() + 1;
    saveChallengesCompleted(total);
    incrementStreak();
    checkAchievements();
}

/**
 * Genera un nuevo ejercicio
 */
function newDailyExercise() {
    const exercise = dailyExercises[getRandomInt(0, dailyExercises.length - 1)];
    const data = loadChallengeData('daily');
    data.exercise = exercise;
    saveChallengeData('daily', data);
    
    document.getElementById('exerciseText').textContent = exercise.name;
    document.getElementById('exerciseReps').textContent = exercise.reps;
    
    showNotification('¡Nuevo ejercicio generado!');
}

// ================================================
// SISTEMA DE LOGROS
// ================================================

/**
 * Verifica y desbloquea logros
 */
function checkAchievements() {
    const unlocked = loadUnlockedAchievements();
    let newUnlock = false;
    
    Object.keys(achievements).forEach(key => {
        if (!unlocked.includes(key) && achievements[key].condition()) {
            unlocked.push(key);
            newUnlock = true;
            showNotification(`🏆 Logro desbloqueado: ${achievements[key].name}!`);
        }
    });
    
    if (newUnlock) {
        saveUnlockedAchievements(unlocked);
        updateAchievementsDisplay();
    }
}

/**
 * Actualiza la visualización de logros
 */
function updateAchievementsDisplay() {
    const unlocked = loadUnlockedAchievements();
    
    Object.keys(achievements).forEach(key => {
        const element = document.querySelector(`[data-achievement="${key}"]`);
        if (element) {
            if (unlocked.includes(key)) {
                element.classList.remove('locked');
                element.classList.add('unlocked');
            }
        }
    });
}

// ================================================
// PANEL DE PROGRESO
// ================================================

/**
 * Actualiza la visualización del progreso
 */
function updateProgressDisplay() {
    // Actualizar estadísticas
    document.getElementById('statStreak').textContent = loadStreak();
    document.getElementById('statRounds').textContent = getTotalRounds();
    document.getElementById('statChallenges').textContent = getChallengesCompleted();
    
    // Actualizar última actividad
    const lastActive = loadLastActiveDate();
    if (lastActive === getTodayString()) {
        document.getElementById('statLastActive').textContent = 'Hoy';
    } else if (lastActive === getYesterdayString()) {
        document.getElementById('statLastActive').textContent = 'Ayer';
    } else if (lastActive) {
        document.getElementById('statLastActive').textContent = lastActive;
    } else {
        document.getElementById('statLastActive').textContent = 'Nunca';
    }
    
    // Actualizar visualización de logros
    updateAchievementsDisplay();
}

/**
 * Reinicia todo el progreso
 */
function resetAllProgress() {
    if (confirm('¿Estás seguro? Esto borrará TODO tu progreso, incluyendo logros y rachas.')) {
        if (confirm('Esta acción no se puede deshacer. ¿Continuar?')) {
            // Limpiar localStorage
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Reiniciar variables
            elements.streakCount.textContent = '0';
            
            // Actualizar UI
            updateProgressDisplay();
            initPushupChallenge();
            initMentalChallenge();
            initDailyExercise();
            
            showNotification('Todo el progreso ha sido reiniciado.');
        }
    }
}

// ================================================
// NOTIFICACIONES
// ================================================

/**
 * Muestra una notificación
 */
function showNotification(message) {
    elements.notificationText.textContent = message;
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// ================================================
// SELECCIÓN DE DURACIÓN DEL ROUND
// ================================================

/**
 * Configura los botones de selección de duración
 */
function setupRoundSelector() {
    elements.roundOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar UI
            elements.roundOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar duración
            currentDuration = parseInt(btn.dataset.duration, 10);
            currentTime = currentDuration;
            
            // Actualizar visualización si está en modo combate
            if (elements.combatPanel.classList.contains('active')) {
                updateTimerDisplay();
            }
        });
    });
}

// ================================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ================================================

/**
 * Configura los botones de navegación
 */
function setupNavigation() {
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection(btn.dataset.section);
        });
    });
}

// ================================================
// INICIALIZACIÓN Y EVENTOS
// ================================================

/**
 * Inicializa la aplicación
 */
function init() {
    // Actualizar racha
    updateStreak();
    elements.streakCount.textContent = loadStreak();
    
    // Mostrar cita inicial
    const initialQuote = getRandomQuote();
    elements.quoteText.textContent = initialQuote.text;
    elements.quoteCategory.textContent = `[${initialQuote.category.toUpperCase()}]`;
    
    // Configurar volumen del video
    setVideoVolume(0.3);
    
    // Inicializar retos
    initPushupChallenge();
    initMentalChallenge();
    initDailyExercise();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar selector de duración
    setupRoundSelector();
    
    // Configurar eventos de botones del temporizador
    elements.combatBtn.addEventListener('click', () => {
        showCombatPanel();
        setTimeout(startTimer, 300);
    });
    
    elements.cancelBtn.addEventListener('click', cancelCombat);
    elements.resetBtn.addEventListener('click', resetTimer);
    elements.restBtn.addEventListener('click', goToRest);
    elements.nextRoundBtn.addEventListener('click', returnToCombat);
    
    // Configurar eventos de retos
    document.getElementById('completePushupBtn').addEventListener('click', completePushupChallenge);
    document.getElementById('resetPushupBtn').addEventListener('click', resetPushupChallenge);
    
    document.getElementById('completeMentalBtn').addEventListener('click', completeMentalChallenge);
    document.getElementById('resetMentalBtn').addEventListener('click', resetMentalChallenge);
    
    document.getElementById('completeExerciseBtn').addEventListener('click', completeDailyExercise);
    document.getElementById('newExerciseBtn').addEventListener('click', newDailyExercise);
    
    // Configurar reinicio total
    document.getElementById('resetAllProgress').addEventListener('click', resetAllProgress);
    
    // Manejo de errores del video
    if (elements.bgVideo) {
        elements.bgVideo.addEventListener('canplay', () => {
            console.log('🎬 Video de fondo cargado correctamente');
        });
        
        elements.bgVideo.addEventListener('error', (e) => {
            console.log('Nota: Video no disponible, la app funciona sin él.');
        });
    }
    
    // Verificar logros al cargar
    checkAchievements();
    
    console.log('🧠🥊 Mentalidad de Combate expandido inicializado');
    console.log('📊 Sistema de retos: Activo');
    console.log('🏆 Sistema de logros: Activo');
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', init);
