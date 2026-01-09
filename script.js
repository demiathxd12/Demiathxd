/**
 * MENTALIDAD DE COMBATE 3.0
 * JavaScript Principal - IndexedDB, Animaciones Apple Style y Lógica Mejorada
 */

// ==========================================
// BASE DE DATOS INDEXEDDB
// ==========================================

const DB_NAME = 'MentalidadCombateDB';
const DB_VERSION = 3;
let db = null;

class Database {
    constructor() {
        this.dbName = DB_NAME;
        this.dbVersion = DB_VERSION;
    }

    async init() {
        return new Promise((resolve, reject) => {
            if (db) {
                db.close();
            }
            
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Error al abrir la base de datos:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('Base de datos abierta exitosamente, versión:', db.version);
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                console.log('Ejecutando migración de base de datos, versión:', event.target.version);

                const existingStores = ['users', 'sessions', 'challenges', 'achievements', 'activity', 'settings', 'analytics'];
                for (const storeName of existingStores) {
                    if (database.objectStoreNames.contains(storeName)) {
                        database.deleteObjectStore(storeName);
                        console.log(`Eliminado almacén: ${storeName}`);
                    }
                }

                // Almacén de usuarios
                const userStore = database.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('username', 'username', { unique: true });
                userStore.createIndex('email', 'email', { unique: true });

                // Almacén de sesiones de timer
                const sessionStore = database.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                sessionStore.createIndex('userId', 'userId', { unique: false });
                sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
                sessionStore.createIndex('date', 'date', { unique: false });
                sessionStore.createIndex('completed', 'completed', { unique: false });

                // Almacén de desafíos
                const challengeStore = database.createObjectStore('challenges', { keyPath: 'id', autoIncrement: true });
                challengeStore.createIndex('userId', 'userId', { unique: false });
                challengeStore.createIndex('type', 'type', { unique: false });
                challengeStore.createIndex('date', 'date', { unique: false });

                // Almacén de logros
                const achievementStore = database.createObjectStore('achievements', { keyPath: 'id' });

                // Almacén de actividad
                const activityStore = database.createObjectStore('activity', { keyPath: 'id', autoIncrement: true });
                activityStore.createIndex('userId', 'userId', { unique: false });
                activityStore.createIndex('timestamp', 'timestamp', { unique: false });
                activityStore.createIndex('type', 'type', { unique: false });

                // Almacén de configuración
                database.createObjectStore('settings', { keyPath: 'key' });

                // Almacén de analíticas diarias
                const analyticsStore = database.createObjectStore('analytics', { keyPath: 'date' });
                analyticsStore.createIndex('userId', 'userId', { unique: false });

                console.log('Esquema de base de datos creado exitosamente');
            };
        });
    }

    async add(storeName, data) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            if (!store.indexNames.contains(indexName)) {
                const allRequest = store.getAll();
                allRequest.onsuccess = () => {
                    const all = allRequest.result;
                    const filtered = all.filter(item => item[indexName] === value);
                    resolve(filtered[0] || null);
                };
                allRequest.onerror = () => reject(allRequest.error);
                return;
            }
            
            const index = store.index(indexName);
            const request = index.get(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllByIndex(storeName, indexName, value) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            if (!store.indexNames.contains(indexName)) {
                const allRequest = store.getAll();
                allRequest.onsuccess = () => {
                    const all = allRequest.result;
                    const filtered = all.filter(item => item[indexName] === value);
                    resolve(filtered);
                };
                allRequest.onerror = () => reject(allRequest.error);
                return;
            }
            
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        if (!db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    isReady() {
        return db !== null;
    }
    
    async waitForReady() {
        let attempts = 0;
        while (!this.isReady() && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (!this.isReady()) {
            await this.init();
        }
    }
}

// ==========================================
// SISTEMA DE AUTENTICACIÓN
// ==========================================

class AuthSystem {
    constructor(database) {
        this.db = database;
        this.currentUser = null;
    }

    async init() {
        try {
            const session = await this.db.get('settings', 'currentSession');
            if (session && session.userId) {
                const user = await this.db.get('users', session.userId);
                if (user) {
                    this.currentUser = user;
                    // Actualizar fecha de último acceso
                    await this.updateLastLogin(user);
                    this.showMainScreen();
                    return;
                }
            }
        } catch (error) {
            console.warn('Error al verificar sesión:', error);
        }
        this.showAuthScreen();
    }

    async updateLastLogin(user) {
        const today = new Date().toDateString();
        const lastLoginDate = new Date(user.lastLogin).toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLoginDate !== today) {
            if (lastLoginDate === yesterday.toDateString()) {
                user.currentStreak += 1;
                if (user.currentStreak > user.bestStreak) {
                    user.bestStreak = user.currentStreak;
                }
            } else {
                user.currentStreak = 1;
            }
        }
        
        user.lastLogin = new Date().toISOString();
        await this.db.put('users', user);
    }

    async register(username, email, password) {
        const existingUser = await this.db.getByIndex('users', 'username', username);
        if (existingUser) {
            throw new Error('El nombre de usuario ya está en uso');
        }

        const existingEmail = await this.db.getByIndex('users', 'email', email);
        if (existingEmail) {
            throw new Error('El email ya está registrado');
        }

        const user = {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            level: 1,
            xp: 0,
            totalFocusTime: 0,
            totalSessions: 0,
            currentStreak: 1,
            bestStreak: 1,
            longestStreak: 1,
            achievements: [],
            settings: {
                sound: true,
                vibration: true,
                autoBreak: false,
                notifications: false,
                dailyGoal: 8,
                darkMode: true
            }
        };

        const userId = await this.db.add('users', user);
        user.id = userId;

        await this.createDefaultAchievements(userId);
        await this.logActivity(userId, 'user_register', 'Comenzaste tu viaje');

        return user;
    }

    async login(username, password) {
        const user = await this.db.getByIndex('users', 'username', username);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (user.password !== this.hashPassword(password)) {
            throw new Error('Contraseña incorrecta');
        }

        await this.updateLastLogin(user);
        await this.db.put('settings', { key: 'currentSession', userId: user.id });

        this.currentUser = user;
        return user;
    }

    async logout() {
        await this.db.delete('settings', 'currentSession');
        this.currentUser = null;
        this.showAuthScreen();
    }

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    async updateUser(updates) {
        if (!this.currentUser) return;
        
        const updatedUser = { ...this.currentUser, ...updates };
        await this.db.put('users', updatedUser);
        this.currentUser = updatedUser;
        return updatedUser;
    }

    async createDefaultAchievements(userId) {
        const defaultAchievements = [
            { id: 'first_session', name: 'Primera Sangre', description: 'Completa tu primera sesión', icon: '🎯', xpReward: 10, unlocked: false, category: 'sessions' },
            { id: 'streak_3', name: 'Racha de 3', description: '3 días consecutivos', icon: '🔥', xpReward: 30, unlocked: false, category: 'streaks' },
            { id: 'streak_7', name: 'Semana de Hierro', description: '7 días consecutivos', icon: '💪', xpReward: 70, unlocked: false, category: 'streaks' },
            { id: 'streak_30', name: 'Mes de Leyenda', description: '30 días consecutivos', icon: '👑', xpReward: 300, unlocked: false, category: 'streaks' },
            { id: 'streak_100', name: 'Centuria', description: '100 días consecutivos', icon: '🏆', xpReward: 1000, unlocked: false, category: 'streaks' },
            { id: 'sessions_10', name: 'Calentamiento', description: '10 sesiones completadas', icon: '✅', xpReward: 25, unlocked: false, category: 'sessions' },
            { id: 'sessions_50', name: 'Guerrero', description: '50 sesiones completadas', icon: '⚔️', xpReward: 100, unlocked: false, category: 'sessions' },
            { id: 'sessions_100', name: 'Campeón', description: '100 sesiones completadas', icon: '🏅', xpReward: 200, unlocked: false, category: 'sessions' },
            { id: 'sessions_500', name: 'Leyenda', description: '500 sesiones completadas', icon: '⭐', xpReward: 500, unlocked: false, category: 'sessions' },
            { id: 'focus_1h', name: '1 Hora de Foco', description: 'Acumula 1 hora de tiempo de foco', icon: '⏱️', xpReward: 20, unlocked: false, category: 'time' },
            { id: 'focus_10h', name: '10 Horas de Foco', description: 'Acumula 10 horas de tiempo de foco', icon: '⏰', xpReward: 100, unlocked: false, category: 'time' },
            { id: 'focus_100h', name: 'Maestro del Foco', description: 'Acumula 100 horas de tiempo de foco', icon: '🧘', xpReward: 500, unlocked: false, category: 'time' },
            { id: 'focus_1000h', name: 'Experto', description: 'Acumula 1000 horas de tiempo de foco', icon: '🌟', xpReward: 2000, unlocked: false, category: 'time' },
            { id: 'level_5', name: 'Ascenso', description: 'Alcanza el nivel 5', icon: '⭐', xpReward: 50, unlocked: false, category: 'level' },
            { id: 'level_10', name: 'Veterano', description: 'Alcanza el nivel 10', icon: '🎖️', xpReward: 150, unlocked: false, category: 'level' },
            { id: 'level_25', name: 'Maestro', description: 'Alcanza el nivel 25', icon: '🌠', xpReward: 400, unlocked: false, category: 'level' },
            { id: 'level_50', name: 'Leyenda', description: 'Alcanza el nivel 50', icon: '💎', xpReward: 1000, unlocked: false, category: 'level' },
            { id: 'challenges_5', name: 'Cazador', description: 'Completa 5 desafíos', icon: '🎯', xpReward: 50, unlocked: false, category: 'challenges' },
            { id: 'challenges_20', name: 'Conquistador', description: 'Completa 20 desafíos', icon: '🏅', xpReward: 150, unlocked: false, category: 'challenges' },
            { id: 'challenges_50', name: 'Dominador', description: 'Completa 50 desafíos', icon: '👑', xpReward: 400, unlocked: false, category: 'challenges' },
            { id: 'early_bird', name: 'Madrugador', description: 'Completa una sesión antes de las 7 AM', icon: '🌅', xpReward: 25, unlocked: false, category: 'special' },
            { id: 'night_owl', name: 'Búho Nocturno', description: 'Completa una sesión después de las 10 PM', icon: '🦉', xpReward: 25, unlocked: false, category: 'special' },
            { id: 'marathon', name: 'Maratón', description: '4 sesiones en un solo día', icon: '🏃', xpReward: 100, unlocked: false, category: 'special' }
        ];

        for (const achievement of defaultAchievements) {
            await this.db.put('achievements', { ...achievement, userId });
        }
    }

    async logActivity(userId, type, description, data = {}) {
        const activity = {
            userId,
            type,
            description,
            data,
            timestamp: new Date().toISOString()
        };
        await this.db.add('activity', activity);
    }

    showAuthScreen() {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('main-screen').classList.add('hidden');
        this.triggerAppleAnimation(document.getElementById('auth-screen'), 'fadeIn');
    }

    showMainScreen() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        app.updateUI();
        this.triggerAppleAnimation(document.querySelector('.main-screen'), 'slideUp');
    }

    triggerAppleAnimation(element, animationType) {
        if (!element) return;
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = null;
    }
}

// ==========================================
// SISTEMA DE TIMER MEJORADO
// ==========================================

class CombatTimer {
    constructor(authSystem) {
        this.auth = authSystem;
        this.db = authSystem.db;
        this.modes = {
            focus: { duration: 25 * 60, label: 'MODO FOCO', icon: '🎯' },
            short: { duration: 5 * 60, label: 'DESCANSO', icon: '☕' },
            long: { duration: 15 * 60, label: 'DESCANSO LARGO', icon: '🌟' },
            custom: { duration: 45 * 60, label: 'MODO LIBRE', icon: '⚡' }
        };
        this.currentMode = 'focus';
        this.timeLeft = this.modes.focus.duration;
        this.isRunning = false;
        this.interval = null;
        this.sessionsToday = 0;
        this.xpToday = 0;
        this.todayDate = new Date().toDateString();
        this.sessionStartTime = null;
        this.currentSession = null;

        this.init();
    }

    async init() {
        await this.loadTodayProgress();
        this.setupEventListeners();
        this.updateDisplay();
    }

    async loadTodayProgress() {
        if (!this.auth.currentUser) return;
        
        const sessions = await this.db.getAllByIndex('sessions', 'userId', this.auth.currentUser.id);
        const today = new Date().toDateString();
        
        const todaySessions = sessions.filter(s => {
            const sessionDate = new Date(s.timestamp).toDateString();
            return sessionDate === today && s.completed;
        });
        
        this.sessionsToday = todaySessions.length;
        this.xpToday = todaySessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
        
        this.updateSessionDisplay();
        this.renderSessionDots();
    }

    setupEventListeners() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
        });

        // Timer controls
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        
        // Custom time slider
        const customTimeSlider = document.getElementById('custom-time');
        if (customTimeSlider) {
            customTimeSlider.addEventListener('input', (e) => {
                const minutes = e.target.value;
                this.modes.custom.duration = parseInt(minutes) * 60;
                document.getElementById('custom-time-label').textContent = `${minutes}m`;
                document.getElementById('custom-time-display').textContent = `${minutes} minutos`;
                
                if (this.currentMode === 'custom' && !this.isRunning) {
                    this.timeLeft = this.modes.custom.duration;
                    this.updateDisplay();
                }
            });
        }
    }

    setMode(mode) {
        if (this.isRunning) return;
        
        this.currentMode = mode;
        this.timeLeft = this.modes[mode].duration;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Show/hide custom time input
        const customContainer = document.getElementById('custom-time-container');
        if (customContainer) {
            customContainer.classList.toggle('hidden', mode !== 'custom');
        }
        
        this.updateDisplay();
        this.triggerModeAnimation();
    }

    triggerModeAnimation() {
        const timerContent = document.querySelector('.timer-content');
        if (timerContent) {
            timerContent.style.transform = 'scale(0.95)';
            timerContent.style.opacity = '0.5';
            setTimeout(() => {
                timerContent.style.transform = 'scale(1)';
                timerContent.style.opacity = '1';
            }, 150);
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.sessionStartTime = new Date();
        
        // UI updates
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('pause-btn').classList.remove('hidden');
        document.getElementById('reset-btn').classList.remove('hidden');
        
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            statusEl.textContent = this.currentMode === 'focus' ? 'Enfócate al máximo' : 'Descansando';
            statusEl.style.animation = 'pulse 2s ease-in-out infinite';
        }
        
        this.interval = setInterval(() => this.tick(), 1000);
        
        // Create session record
        if (this.auth.currentUser) {
            this.currentSession = {
                userId: this.auth.currentUser.id,
                mode: this.currentMode,
                duration: this.modes[this.currentMode].duration,
                startTime: this.sessionStartTime.toISOString(),
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                completed: false
            };
            this.db.add('sessions', this.currentSession);
        }
        
        this.triggerAppleAnimation(document.querySelector('.timer-ring-progress'), 'pulse');
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
        
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('pause-btn').classList.add('hidden');
        
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            statusEl.textContent = 'Pausado';
            statusEl.style.animation = 'none';
        }
    }

    async reset() {
        this.pause();
        this.timeLeft = this.modes[this.currentMode].duration;
        this.updateDisplay();
        
        document.getElementById('reset-btn').classList.add('hidden');
        
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            statusEl.textContent = 'Listo para entrenar';
        }
    }

    async tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            
            // Play countdown sounds for last 3 seconds
            if (this.timeLeft <= 3 && this.timeLeft > 0) {
                this.playTickSound();
            }
        } else {
            await this.complete();
        }
    }

    async complete() {
        this.pause();
        this.playCompleteSound();
        this.vibrate();
        
        document.getElementById('reset-btn').classList.add('hidden');
        
        if (this.currentMode === 'focus') {
            await this.processFocusCompletion();
        } else {
            // Auto-switch to focus after break
            if (this.auth.currentUser?.settings?.autoBreak) {
                setTimeout(() => {
                    this.setMode('focus');
                }, 1000);
            }
        }
        
        this.updateDisplay();
    }

    async processFocusCompletion() {
        const focusTime = this.modes.focus.duration;
        const xpEarned = Math.floor(focusTime / 60);
        this.xpToday += xpEarned;
        
        // Update session record
        if (this.currentSession) {
            this.currentSession.completed = true;
            this.currentSession.endTime = new Date().toISOString();
            this.currentSession.xpEarned = xpEarned;
            await this.db.put('sessions', this.currentSession);
        }
        
        this.sessionsToday++;
        
        // Update user
        const user = this.auth.currentUser;
        user.totalSessions += 1;
        user.totalFocusTime += focusTime;
        user.xp += xpEarned;
        
        // Check for level up
        const xpNeeded = user.level * 100;
        if (user.xp >= xpNeeded) {
            user.level += 1;
            user.xp = user.xp - xpNeeded;
            await this.auth.logActivity(user.id, 'level_up', `¡Nivel ${user.level} alcanzado!`, { newLevel: user.level });
            this.showLevelUpAnimation(user.level);
        }
        
        await this.auth.updateUser(user);
        await this.auth.logActivity(user.id, 'session_complete', `Sesión de ${Math.floor(focusTime / 60)}min completada`, { duration: focusTime, xpEarned });
        
        // Check achievements
        await this.checkAchievements();
        
        // Update analytics
        await this.updateDailyAnalytics();
        
        // Update UI
        this.updateSessionDisplay();
        this.renderSessionDots();
        app.updateUI();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');
        
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        
        // Update circular progress
        const total = this.modes[this.currentMode].duration;
        const circumference = 2 * Math.PI * 90;
        const progress = ((total - this.timeLeft) / total) * circumference;
        
        const ringProgress = document.querySelector('.timer-ring-progress');
        if (ringProgress) {
            ringProgress.style.strokeDasharray = circumference;
            ringProgress.style.strokeDashoffset = circumference - progress;
        }
    }

    updateSessionDisplay() {
        const goal = this.auth.currentUser?.settings?.dailyGoal || 8;
        const countEl = document.getElementById('session-count');
        const goalEl = document.getElementById('session-goal');
        
        if (countEl) countEl.textContent = this.sessionsToday;
        if (goalEl) goalEl.textContent = goal;
        
        // Update today stats
        const focusTimeEl = document.getElementById('today-focus-time');
        const xpEl = document.getElementById('today-xp');
        
        if (focusTimeEl) {
            const totalMinutes = this.sessionsToday * 25;
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            focusTimeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }
        if (xpEl) xpEl.textContent = `+${this.xpToday}`;
    }

    renderSessionDots() {
        const container = document.getElementById('session-dots');
        if (!container) return;
        
        container.innerHTML = '';
        const goal = this.auth.currentUser?.settings?.dailyGoal || 8;
        
        for (let i = 0; i < goal; i++) {
            const dot = document.createElement('span');
            dot.className = `session-dot ${i < this.sessionsToday ? 'completed' : ''}`;
            container.appendChild(dot);
        }
    }

    playTickSound() {
        if (!document.getElementById('setting-sound')?.checked) return;
        
        const audio = document.getElementById('timer-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    playCompleteSound() {
        if (!document.getElementById('setting-sound')?.checked) return;
        
        const audio = document.getElementById('timer-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    vibrate() {
        if (!this.auth.currentUser?.settings?.vibration) return;
        
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    showLevelUpAnimation(newLevel) {
        const modal = document.getElementById('achievement-modal');
        const nameEl = document.getElementById('achievement-name');
        const descEl = document.getElementById('achievement-desc');
        
        if (modal && nameEl && descEl) {
            nameEl.textContent = `¡Nivel ${newLevel}!`;
            descEl.textContent = 'Has subido de nivel. ¡Sigue así!';
            document.getElementById('achievement-xp').textContent = '+0';
            
            modal.classList.remove('hidden');
            this.triggerAppleAnimation(modal.querySelector('.modal-content'), 'popIn');
            this.createConfetti();
        }
    }

    async checkAchievements() {
        if (!this.auth.currentUser) return;
        
        const user = this.auth.currentUser;
        const achievements = await this.db.getAllByIndex('achievements', 'userId', user.id);
        const sessions = await this.db.getAllByIndex('sessions', 'userId', user.id);
        
        // Check time of session for special achievements
        const hour = this.sessionStartTime?.getHours() || new Date().getHours();
        
        const checks = [
            { id: 'first_session', condition: user.totalSessions >= 1 },
            { id: 'sessions_10', condition: user.totalSessions >= 10 },
            { id: 'sessions_50', condition: user.totalSessions >= 50 },
            { id: 'sessions_500', condition: user.totalSessions >= 500 },
            { id: 'focus_1h', condition: user.totalFocusTime >= 3600 },
            { id: 'focus_10h', condition: user.totalFocusTime >= 36000 },
            { id: 'focus_100h', condition: user.totalFocusTime >= 360000 },
            { id: 'focus_1000h', condition: user.totalFocusTime >= 3600000 },
            { id: 'streak_3', condition: user.currentStreak >= 3 },
            { id: 'streak_7', condition: user.currentStreak >= 7 },
            { id: 'streak_30', condition: user.currentStreak >= 30 },
            { id: 'streak_100', condition: user.currentStreak >= 100 },
            { id: 'level_5', condition: user.level >= 5 },
            { id: 'level_10', condition: user.level >= 10 },
            { id: 'level_25', condition: user.level >= 25 },
            { id: 'level_50', condition: user.level >= 50 },
            { id: 'early_bird', condition: hour < 7 },
            { id: 'night_owl', condition: hour >= 22 },
            { id: 'marathon', condition: this.sessionsToday >= 4 }
        ];
        
        for (const check of checks) {
            const achievement = achievements.find(a => a.id === check.id);
            if (achievement && !achievement.unlocked && check.condition) {
                await this.unlockAchievement(achievement);
            }
        }
    }

    async unlockAchievement(achievement) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        await this.db.put('achievements', achievement);
        
        const user = this.auth.currentUser;
        user.xp += achievement.xpReward;
        await this.auth.updateUser(user);
        
        app.showAchievementModal(achievement);
        await this.auth.logActivity(user.id, 'achievement', `Logro: ${achievement.name}`, { achievementId: achievement.id });
    }

    async updateDailyAnalytics() {
        if (!this.auth.currentUser) return;
        
        const today = new Date().toISOString().split('T')[0];
        let analytics = await this.db.get('analytics', today);
        
        if (!analytics) {
            analytics = {
                date: today,
                userId: this.auth.currentUser.id,
                totalSessions: 0,
                totalFocusTime: 0,
                totalXp: 0,
                hours: {}
            };
        }
        
        analytics.totalSessions += 1;
        analytics.totalFocusTime += this.modes.focus.duration;
        analytics.totalXp += Math.floor(this.modes.focus.duration / 60);
        
        const hour = new Date().getHours();
        if (!analytics.hours[hour]) {
            analytics.hours[hour] = 0;
        }
        analytics.hours[hour] += this.modes.focus.duration;
        
        await this.db.put('analytics', analytics);
    }

    triggerAppleAnimation(element, animationType) {
        if (!element) return;
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = '';
    }
}

// ==========================================
// SISTEMA DE DESAFÍOS MEJORADO
// ==========================================

class ChallengeSystem {
    constructor(authSystem) {
        this.auth = authSystem;
        this.db = authSystem.db;
        this.dailyChallenges = [];
        this.init();
    }

    init() {
        this.generateDailyChallenges();
        
        document.getElementById('refresh-challenges')?.addEventListener('click', () => {
            this.refreshChallenges();
        });
    }

    generateDailyChallenges() {
        const allChallenges = [
            { id: 'focus_3', title: 'Trinidad', desc: 'Completa 3 sesiones de foco', goal: 3, icon: '🎯', xpReward: 30, category: 'daily' },
            { id: 'focus_5', title: 'Quinteto', desc: 'Completa 5 sesiones de foco', goal: 5, icon: '🔥', xpReward: 50, category: 'daily' },
            { id: 'focus_8', title: 'Ocho de Oro', desc: 'Completa tu meta diaria de 8 sesiones', goal: 8, icon: '💪', xpReward: 80, category: 'daily' },
            { id: 'streak_1', title: 'Momentum', desc: 'Mantén tu racha activa hoy', goal: 1, icon: '🌟', xpReward: 20, category: 'daily' },
            { id: 'level_up', title: 'Ascenso', desc: 'Sube de nivel hoy', goal: 1, icon: '⬆️', xpReward: 100, category: 'special' },
            { id: 'time_2h', title: 'Dos Horas', desc: 'Acumula 2 horas de foco', goal: 120, icon: '⏰', xpReward: 40, unit: 'min', category: 'daily' },
            { id: 'time_4h', title: 'Cuatro Horas', desc: 'Acumula 4 horas de foco', goal: 240, icon: '⏳', xpReward: 80, unit: 'min', category: 'weekly' },
            { id: 'perfect_day', title: 'Día Perfecto', desc: 'Completa todas las metas del día', goal: 1, icon: '✨', xpReward: 150, category: 'special' },
            { id: 'early_session', title: 'Amanecer', desc: 'Completa una sesión antes de las 8 AM', goal: 1, icon: '🌅', xpReward: 30, category: 'special' },
            { id: 'focus_10', title: 'Diez Veces', desc: '10 sesiones en un día', goal: 10, icon: '⚡', xpReward: 200, category: 'monthly' }
        ];
        
        // Select 3 random challenges based on current time
        const seed = new Date().toDateString();
        const shuffled = this.shuffleArray([...allChallenges], seed);
        this.dailyChallenges = shuffled.slice(0, 3);
        
        this.renderDailyChallenge();
        this.renderChallengesList();
    }

    shuffleArray(array, seed) {
        let currentIndex = array.length, randomIndex;
        const stringSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        while (currentIndex !== 0) {
            randomIndex = Math.floor((stringSeed * (currentIndex--)) % 100 / 100 * currentIndex);
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        
        return array;
    }

    refreshChallenges() {
        this.generateDailyChallenges();
        const challengesList = document.getElementById('challenges-list');
        if (challengesList) {
            challengesList.style.opacity = '0';
            setTimeout(() => {
                this.renderChallengesList();
                challengesList.style.opacity = '1';
            }, 200);
        }
    }

    renderDailyChallenge() {
        if (!this.auth.currentUser || this.dailyChallenges.length === 0) return;
        
        const challenge = this.dailyChallenges[0];
        const dateEl = document.getElementById('challenge-date');
        const iconEl = document.getElementById('daily-challenge-icon');
        const titleEl = document.getElementById('daily-title');
        const descEl = document.getElementById('daily-desc');
        const progressTextEl = document.getElementById('daily-progress-text');
        const rewardEl = document.getElementById('daily-reward');
        
        if (dateEl) {
            const options = { weekday: 'long', month: 'short', day: 'numeric' };
            dateEl.textContent = new Date().toLocaleDateString('es-ES', options);
        }
        
        if (iconEl) iconEl.textContent = challenge.icon;
        if (titleEl) titleEl.textContent = challenge.title;
        if (descEl) descEl.textContent = challenge.desc;
        if (rewardEl) rewardEl.textContent = `+${challenge.xpReward}`;
        
        // Calculate and display progress
        this.calculateChallengeProgress(challenge, progressTextEl);
    }

    async calculateChallengeProgress(challenge, progressTextEl) {
        if (!this.auth.currentUser) return;
        
        const user = this.auth.currentUser;
        const today = new Date().toDateString();
        const sessions = await this.db.getAllByIndex('sessions', 'userId', user.id);
        const todaySessions = sessions.filter(s => {
            const sessionDate = new Date(s.timestamp).toDateString();
            return sessionDate === today && s.completed;
        });
        
        let currentProgress = 0;
        let totalGoal = challenge.goal;
        
        switch (challenge.id) {
            case 'focus_3':
            case 'focus_5':
            case 'focus_8':
            case 'focus_10':
                currentProgress = todaySessions.length;
                break;
            case 'streak_1':
                currentProgress = user.currentStreak >= 1 ? 1 : 0;
                break;
            case 'level_up':
                const activities = await this.db.getAllByIndex('activity', 'userId', user.id);
                const todayActivities = activities.filter(a => {
                    const actDate = new Date(a.timestamp).toDateString();
                    return actDate === today && a.type === 'level_up';
                });
                currentProgress = todayActivities.length;
                break;
            case 'time_2h':
            case 'time_4h':
                currentProgress = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
                break;
            case 'perfect_day':
                const goal = user.settings?.dailyGoal || 8;
                currentProgress = todaySessions.length >= goal ? 1 : 0;
                break;
            case 'early_session':
                const earlySessions = todaySessions.filter(s => {
                    const hour = new Date(s.startTime).getHours();
                    return hour < 8;
                });
                currentProgress = earlySessions.length;
                break;
        }
        
        if (progressTextEl) {
            const unit = challenge.unit || (challenge.goal === 1 ? '' : '');
            progressTextEl.textContent = `${Math.floor(currentProgress)}/${totalGoal}${unit}`;
        }
        
        // Update progress ring
        const progressRing = document.getElementById('daily-progress-ring');
        if (progressRing) {
            const circumference = 2 * Math.PI * 45;
            const progress = Math.min((currentProgress / totalGoal), 1) * circumference;
            progressRing.style.strokeDashoffset = circumference - progress;
        }
    }

    renderChallengesList() {
        const container = document.getElementById('challenges-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.dailyChallenges.slice(1).forEach((challenge, index) => {
            const card = document.createElement('div');
            card.className = 'challenge-card-item';
            card.innerHTML = `
                <div class="challenge-icon-small">${challenge.icon}</div>
                <div class="challenge-info-small">
                    <span class="challenge-title-small">${challenge.title}</span>
                    <span class="challenge-desc-small">${challenge.desc}</span>
                </div>
                <div class="challenge-reward-small">+${challenge.xpReward} XP</div>
            `;
            container.appendChild(card);
        });
    }
}

// ==========================================
// SISTEMA DE ESTADÍSTICAS
// ==========================================

class StatisticsSystem {
    constructor(authSystem) {
        this.auth = authSystem;
        this.db = authSystem.db;
        this.currentPeriod = 'week';
    }

    async init() {
        this.setupPeriodSelector();
        await this.loadStatistics();
    }

    setupPeriodSelector() {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                await this.loadStatistics();
            });
        });
    }

    async loadStatistics() {
        if (!this.auth.currentUser) return;
        
        const user = this.auth.currentUser;
        const sessions = await this.db.getAllByIndex('sessions', 'userId', user.id);
        const completedSessions = sessions.filter(s => s.completed);
        
        const periodData = this.getPeriodData(completedSessions);
        
        // Update period stats
        this.updatePeriodStats(periodData);
        
        // Update chart
        this.updateChart(periodData.dailyData);
        
        // Update advanced stats
        await this.updateAdvancedStats(completedSessions);
        
        // Update productive days
        this.updateProductiveDays(completedSessions);
    }

    getPeriodData(sessions) {
        const now = new Date();
        let startDate = new Date();
        
        switch (this.currentPeriod) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
                startDate = new Date(0);
                break;
        }
        
        const periodSessions = sessions.filter(s => new Date(s.timestamp) >= startDate);
        
        // Group by day
        const dailyData = {};
        periodSessions.forEach(s => {
            const date = new Date(s.timestamp).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { sessions: 0, minutes: 0 };
            }
            dailyData[date].sessions += 1;
            dailyData[date].minutes += (s.duration || 0) / 60;
        });
        
        // Calculate totals
        const totalMinutes = periodSessions.reduce((sum, s) => sum + (s.duration || 0) / 60, 0);
        const totalSessions = periodSessions.length;
        const avgSession = totalSessions > 0 ? totalMinutes / totalSessions : 0;
        
        return {
            totalMinutes,
            totalSessions,
            avgSession,
            dailyData
        };
    }

    updatePeriodStats(data) {
        const focusTimeEl = document.getElementById('period-focus-time');
        const sessionsEl = document.getElementById('period-sessions');
        const avgEl = document.getElementById('period-avg-session');
        
        if (focusTimeEl) {
            const hours = Math.floor(data.totalMinutes / 60);
            const mins = Math.round(data.totalMinutes % 60);
            focusTimeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${Math.round(mins)}m`;
        }
        
        if (sessionsEl) sessionsEl.textContent = data.totalSessions;
        if (avgEl) avgEl.textContent = `${Math.round(data.avgSession)}m`;
    }

    updateChart(dailyData) {
        const canvas = document.getElementById('focus-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        
        canvas.width = container.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get last 7 days
        const labels = [];
        const values = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
            
            labels.push(dayName.charAt(0).toUpperCase());
            values.push(dailyData[dateStr]?.minutes || 0);
        }
        
        const maxValue = Math.max(...values, 60);
        const barWidth = (canvas.width - 60) / 7 - 10;
        const chartHeight = canvas.height - 40;
        
        // Draw bars
        values.forEach((value, index) => {
            const x = 40 + index * (barWidth + 10);
            const barHeight = (value / maxValue) * chartHeight;
            const y = canvas.height - 30 - barHeight;
            
            // Bar gradient
            const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 30);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#888888');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fill();
            
            // Value label
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px SF Pro Display';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(value), x + barWidth / 2, y - 5);
            
            // Day label
            ctx.fillStyle = '#888888';
            ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 10);
        });
    }

    async updateAdvancedStats(sessions) {
        // Best day
        const dayStats = {};
        sessions.forEach(s => {
            const day = new Date(s.timestamp).toLocaleDateString('es-ES', { weekday: 'long' });
            if (!dayStats[day]) dayStats[day] = { sessions: 0, minutes: 0 };
            dayStats[day].sessions += 1;
            dayStats[day].minutes += (s.duration || 0) / 60;
        });
        
        const bestDay = Object.entries(dayStats).reduce((best, [day, stats]) => {
            return stats.minutes > (best?.minutes || 0) ? { day, ...stats } : best;
        }, null);
        
        const bestDayEl = document.getElementById('best-day');
        if (bestDayEl) {
            bestDayEl.textContent = bestDay ? `${bestDay.day.split(',')[0]}` : '-';
        }
        
        // Peak hour
        const hourStats = {};
        sessions.forEach(s => {
            const hour = new Date(s.timestamp).getHours();
            if (!hourStats[hour]) hourStats[hour] = 0;
            hourStats[hour] += 1;
        });
        
        const peakHour = Object.entries(hourStats).reduce((best, [hour, count]) => {
            return count > (best?.count || 0) ? { hour: parseInt(hour), count } : best;
        }, null);
        
        const peakHourEl = document.getElementById('peak-hour');
        if (peakHourEl) {
            peakHourEl.textContent = peakHour ? `${peakHour.hour}:00` : '-';
        }
        
        // Best streak
        const bestStreakEl = document.getElementById('best-streak-stat');
        if (bestStreakEl) {
            bestStreakEl.textContent = `${this.auth.currentUser?.bestStreak || 0} días`;
        }
        
        // Daily average
        const days = new Set(sessions.map(s => new Date(s.timestamp).toDateString())).size;
        const avgMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0) / 60, 0) / (days || 1);
        const dailyAvgEl = document.getElementById('daily-avg-stat');
        if (dailyAvgEl) {
            dailyAvgEl.textContent = `${Math.round(avgMinutes)} min`;
        }
    }

    updateProductiveDays(sessions) {
        const container = document.getElementById('days-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dayStats = {};
        
        sessions.forEach(s => {
            const day = new Date(s.timestamp).getDay();
            if (!dayStats[day]) dayStats[day] = 0;
            dayStats[day] += 1;
        });
        
        const maxSessions = Math.max(...Object.values(dayStats), 1);
        
        dayNames.forEach((name, index) => {
            const sessionsCount = dayStats[index] || 0;
            const intensity = sessionsCount / maxSessions;
            
            const dayEl = document.createElement('div');
            dayEl.className = 'day-item';
            dayEl.innerHTML = `
                <span class="day-name">${name}</span>
                <div class="day-bar" style="height: ${Math.max(8, intensity * 60)}px; opacity: ${0.3 + intensity * 0.7}"></div>
                <span class="day-count">${sessionsCount}</span>
            `;
            container.appendChild(dayEl);
        });
    }
}

// ==========================================
// APLICACIÓN PRINCIPAL
// ==========================================

class App {
    constructor() {
        this.db = new Database();
        this.auth = null;
        this.timer = null;
        this.challenges = null;
        this.statistics = null;
    }

    async init() {
        console.log('Inicializando Mentalidad de Combate 3.0...');
        
        await this.db.init();
        await this.db.waitForReady();
        console.log('Base de datos lista');
        
        this.auth = new AuthSystem(this.db);
        
        // Hide loader with animation
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                setTimeout(() => loader.classList.add('hidden'), 500);
            }
        }, 1500);
        
        this.setupAuthEvents();
        this.setupNavigation();
        this.setupSettings();
        this.setupModals();
        
        // Initialize auth
        await this.auth.init();
        
        // Load daily quote
        this.loadDailyQuote();
    }

    setupAuthEvents() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            this.animateFormTransition(loginForm, registerForm);
        });
        
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            this.animateFormTransition(registerForm, loginForm);
        });
        
        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            try {
                await this.auth.login(username, password);
                this.initializeMainApp();
            } catch (error) {
                this.showError(error.message);
            }
        });
        
        registerForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            
            if (password !== confirm) {
                this.showError('Las contraseñas no coinciden');
                return;
            }
            
            try {
                await this.auth.register(username, email, password);
                await this.auth.login(username, password);
                this.initializeMainApp();
            } catch (error) {
                this.showError(error.message);
            }
        });
        
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.auth.logout();
        });
    }

    animateFormTransition(fromEl, toEl) {
        fromEl.style.transform = 'translateX(-20px)';
        fromEl.style.opacity = '0';
        setTimeout(() => {
            fromEl.style.transform = 'translateX(20px)';
            fromEl.style.opacity = '0';
            fromEl.classList.add('hidden');
            toEl.classList.remove('hidden');
            toEl.style.transform = 'translateX(-20px)';
            toEl.style.opacity = '0';
            setTimeout(() => {
                toEl.style.transform = 'translateX(0)';
                toEl.style.opacity = '1';
            }, 50);
        }, 200);
    }

    initializeMainApp() {
        this.timer = new CombatTimer(this.auth);
        this.challenges = new ChallengeSystem(this.auth);
        this.statistics = new StatisticsSystem(this.auth);
        this.updateUI();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                const targetSection = document.getElementById(`${section}-section`);
                if (targetSection) {
                    targetSection.classList.add('active');
                    this.triggerSectionAnimation(targetSection);
                }
                
                // Refresh stats when navigating to stats section
                if (section === 'stats' && this.statistics) {
                    this.statistics.loadStatistics();
                }
            });
        });
    }

    triggerSectionAnimation(section) {
        if (!section) return;
        section.style.animation = 'none';
        section.offsetHeight;
        section.style.animation = 'fadeSlideIn 0.3s ease forwards';
    }

    setupSettings() {
        const panel = document.getElementById('settings-panel');
        
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            panel.classList.remove('hidden');
            this.loadSettings();
            this.triggerAppleAnimation(panel.querySelector('.settings-content'), 'slideUp');
        });
        
        panel?.querySelector('.settings-backdrop')?.addEventListener('click', () => {
            panel.classList.add('hidden');
        });
        
        document.getElementById('close-settings')?.addEventListener('click', () => {
            panel.classList.add('hidden');
        });
        
        document.getElementById('edit-username')?.addEventListener('click', () => {
            const nameSpan = document.getElementById('setting-username');
            const newName = prompt('Ingresa tu nuevo nombre:', nameSpan?.textContent);
            if (newName && newName.trim()) {
                this.auth.updateUser({ username: newName.trim() });
                nameSpan.textContent = newName.trim();
                this.updateUI();
            }
        });
        
        // Daily goal slider
        const dailyGoalSlider = document.getElementById('daily-goal');
        const dailyGoalValue = document.getElementById('daily-goal-value');
        dailyGoalSlider?.addEventListener('input', async (e) => {
            const value = e.target.value;
            dailyGoalValue.textContent = value;
            
            const settings = this.auth.currentUser.settings || {};
            settings.dailyGoal = parseInt(value);
            await this.auth.updateUser({ settings });
            this.timer?.loadTodayProgress();
        });
        
        // Settings toggles
        ['setting-sound', 'setting-vibration', 'setting-auto-break', 'setting-notifications'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', async (e) => {
                const settings = this.auth.currentUser.settings || {};
                const key = id.replace('setting-', '');
                settings[key] = e.target.checked;
                await this.auth.updateUser({ settings });
            });
        });
        
        // Video brightness
        document.getElementById('video-brightness')?.addEventListener('input', (e) => {
            const brightness = e.target.value / 100;
            const overlay = document.querySelector('.video-overlay');
            if (overlay) {
                overlay.style.background = `linear-gradient(180deg, rgba(0, 0, 0, ${0.3 + brightness * 0.5}) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, ${0.7 + brightness * 0.3}) 100%)`;
            }
        });
        
        // Reset progress
        document.getElementById('reset-progress')?.addEventListener('click', async () => {
            if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
                const user = this.auth.currentUser;
                user.totalFocusTime = 0;
                user.totalSessions = 0;
                user.currentStreak = 0;
                user.level = 1;
                user.xp = 0;
                user.achievements = [];
                await this.auth.updateUser(user);
                
                await this.db.clear('achievements');
                await this.auth.createDefaultAchievements(user.id);
                await this.db.clear('sessions');
                await this.db.clear('activity');
                await this.db.clear('analytics');
                
                this.updateUI();
                document.getElementById('settings-panel')?.classList.add('hidden');
            }
        });
        
        // Export data
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportUserData();
        });
    }

    setupModals() {
        document.getElementById('close-achievement')?.addEventListener('click', () => {
            document.getElementById('achievement-modal')?.classList.add('hidden');
        });
        
        document.getElementById('achievement-modal')?.querySelector('.modal-backdrop')?.addEventListener('click', () => {
            document.getElementById('achievement-modal')?.classList.add('hidden');
        });
    }

    loadSettings() {
        if (!this.auth.currentUser) return;
        
        const user = this.auth.currentUser;
        document.getElementById('setting-username').textContent = user.username;
        document.getElementById('setting-email').textContent = user.email;
        document.getElementById('setting-joined').textContent = new Date(user.createdAt).toLocaleDateString('es-ES');
        
        const settings = user.settings || {};
        document.getElementById('daily-goal').value = settings.dailyGoal || 8;
        document.getElementById('daily-goal-value').textContent = settings.dailyGoal || 8;
        document.getElementById('setting-sound').checked = settings.sound !== false;
        document.getElementById('setting-vibration').checked = settings.vibration !== false;
        document.getElementById('setting-auto-break').checked = settings.autoBreak || false;
        document.getElementById('setting-notifications').checked = settings.notifications || false;
    }

    updateUI() {
        if (!this.auth.currentUser) return;
        
        const user = this.auth.currentUser;
        const levelNames = ['NOVATO', 'APRENDIZ', 'GUERRERO', 'LUCHADOR', 'COMBATIENTE', 'CAMPEÓN', 'LEGENDARIO', 'MÍTICO', 'DIOS', 'MÁSTER', 'IMMORTAL', 'LEGEND'];
        
        // Update user info
        document.getElementById('user-welcome').textContent = `Hola, ${user.username}`;
        document.getElementById('user-level').textContent = `Nivel ${user.level}`;
        
        // Update level badge
        const levelBadge = document.getElementById('level-badge');
        if (levelBadge) levelBadge.querySelector('span').textContent = user.level;
        
        const levelName = document.getElementById('level-name');
        if (levelName) levelName.textContent = levelNames[Math.min(user.level - 1, levelNames.length - 1)];
        
        // Update XP bar
        const xpNeeded = user.level * 100;
        document.getElementById('current-xp').textContent = user.xp;
        document.getElementById('xp-needed').textContent = xpNeeded;
        
        const xpFill = document.getElementById('xp-fill');
        if (xpFill) {
            xpFill.style.width = `${(user.xp / xpNeeded) * 100}%`;
        }
        
        // Update progress section
        document.getElementById('display-username').textContent = user.username;
        document.getElementById('user-title').textContent = levelNames[Math.min(user.level - 1, levelNames.length - 1)];
        document.getElementById('stat-level').textContent = user.level;
        document.getElementById('stat-streak').textContent = user.currentStreak;
        
        // Update stats
        const totalHours = Math.floor(user.totalFocusTime / 3600);
        const totalMinutes = Math.floor((user.totalFocusTime % 3600) / 60);
        document.getElementById('total-focus-time').textContent = `${totalHours}h ${totalMinutes}m`;
        document.getElementById('total-sessions').textContent = user.totalSessions;
        document.getElementById('current-streak').textContent = user.currentStreak;
        
        // Update streaks
        document.getElementById('streak-current').textContent = user.currentStreak;
        document.getElementById('streak-best').textContent = user.bestStreak;
        document.getElementById('streak-longest').textContent = user.longestStreak || user.bestStreak;
        
        // Load achievements count
        this.loadAchievementsCount();
        
        // Load activity
        this.loadActivityLog();
        
        // Update challenges
        if (this.challenges) {
            this.challenges.renderDailyChallenge();
        }
    }

    async loadAchievementsCount() {
        if (!this.auth.currentUser) return;
        
        const achievements = await this.db.getAllByIndex('achievements', 'userId', this.auth.currentUser.id);
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        
        document.getElementById('total-achievements').textContent = unlockedCount;
        
        // Update recent achievements
        this.loadRecentAchievements(achievements);
    }

    loadRecentAchievements(achievements) {
        const container = document.getElementById('recent-achievements');
        if (!container) return;
        
        container.innerHTML = '';
        
        const unlocked = achievements
            .filter(a => a.unlocked)
            .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
            .slice(0, 5);
        
        unlocked.forEach(achievement => {
            const item = document.createElement('div');
            item.className = 'achievement-recent';
            item.innerHTML = `
                <span class="achievement-recent-icon">${achievement.icon}</span>
                <span class="achievement-recent-name">${achievement.name}</span>
            `;
            container.appendChild(item);
        });
        
        if (unlocked.length === 0) {
            container.innerHTML = '<p class="empty-message">Sin logros aún. ¡Sigue entrenando!</p>';
        }
    }

    async loadActivityLog() {
        if (!this.auth.currentUser) return;
        
        const activities = await this.db.getAllByIndex('activity', 'userId', this.auth.currentUser.id);
        const container = document.getElementById('activity-timeline');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        const sorted = activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
        
        const icons = {
            session_complete: '✅',
            level_up: '⬆️',
            achievement: '🏆',
            user_register: '👋',
            challenge_complete: '🎯'
        };
        
        for (const activity of sorted) {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const timeAgo = this.formatTimeAgo(activity.timestamp);
            
            item.innerHTML = `
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <span>${timeAgo}</span>
                </div>
            `;
            container.appendChild(item);
        }
    }

    formatTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    showAchievementModal(achievement) {
        const modal = document.getElementById('achievement-modal');
        const nameEl = document.getElementById('achievement-name');
        const descEl = document.getElementById('achievement-desc');
        const xpEl = document.getElementById('achievement-xp');
        
        if (modal && nameEl && descEl && xpEl) {
            nameEl.textContent = achievement.name;
            descEl.textContent = achievement.description;
            xpEl.textContent = `+${achievement.xpReward}`;
            
            modal.classList.remove('hidden');
            this.triggerAppleAnimation(modal.querySelector('.modal-content'), 'popIn');
            this.createConfetti();
        }
    }

    createConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        
        container.innerHTML = '';
        const colors = ['#ffffff', '#888888', '#cccccc'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animation = `confettiFall ${1 + Math.random()}s ease forwards`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(confetti);
        }
    }

    loadDailyQuote() {
        const quotes = [
            { text: "El boxeo es como el jazz. Cuanto mejor eres, más simple se vuelve.", author: "Willie Pep" },
            { text: "No importa cuántas veces caigas, lo que importa es cuántas veces te levantes.", author: "Vince Lombardi" },
            { text: "La única manera de demostrar que tienes razón es seguir luchando.", author: "Mike Tyson" },
            { text: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.", author: "Winston Churchill" },
            { text: "No tengo miedo a los hombres que dan 1000 golpes, tengo miedo del que da uno 1000 veces.", author: "Bruce Lee" },
            { text: "La disciplina es hacer lo que tienes que hacer, incluso cuando no quieres hacerlo.", author: "Anónimo" },
            { text: "El dolor es temporal. El orgullo es para siempre.", author: "Anónimo" },
            { text: "Cuando crees que todo está perdido, sigue adelante. Los finales felices requieren perseverancia.", author: "Anónimo" },
            { text: "El entrenamiento es la mitad de la batalla. La otra mitad es la actitud.", author: "Anónimo" },
            { text: "Cada día es una oportunidad de ser mejor que ayer.", author: "Anónimo" },
            { text: "La excelencia no es un acto, sino un hábito.", author: "Aristóteles" },
            { text: "No esperes la oportunidad, crea la oportunidad.", author: "Anónimo" },
            { text: "El límite lo pone tu mente.", author: "Anónimo" },
            { text: "Entrena tu mente como entrenas tu cuerpo.", author: "Anónimo" },
            { text: "La consistencia supera la intensidad.", author: "Anónimo" }
        ];
        
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const quote = quotes[dayOfYear % quotes.length];
        
        const quoteEl = document.getElementById('daily-quote');
        const authorEl = document.getElementById('quote-author');
        
        if (quoteEl) quoteEl.textContent = `"${quote.text}"`;
        if (authorEl) authorEl.textContent = `- ${quote.author}`;
    }

    async exportUserData() {
        if (!this.auth.currentUser) return;
        
        const user = this.auth.currentUser;
        
        const data = {
            exportDate: new Date().toISOString(),
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            stats: {
                level: user.level,
                xp: user.xp,
                totalFocusTime: user.totalFocusTime,
                totalSessions: user.totalSessions,
                currentStreak: user.currentStreak,
                bestStreak: user.bestStreak
            },
            settings: user.settings,
            sessions: await this.db.getAllByIndex('sessions', 'userId', user.id),
            achievements: await this.db.getAllByIndex('achievements', 'userId', user.id),
            activity: await this.db.getAllByIndex('activity', 'userId', user.id),
            analytics: await this.db.getAll('analytics')
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mentalidad-combate-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    showError(message) {
        alert(message);
    }

    triggerAppleAnimation(element, animationType) {
        if (!element) return;
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = '';
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

const app = new App();
app.init().catch(console.error);

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// Canvas rendering polyfill for older browsers
if (!HTMLCanvasElement.prototype.roundRect) {
    HTMLCanvasElement.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}
