/**
 * MENTALIDAD DE COMBATE - GAME EDITION
 * Sistema Unificado de Gamificación
 * Almacenamiento local optimizado
 */

// ==========================================
// SISTEMA DE ALMACENAMIENTO LOCAL AVANZADO
// ==========================================

const GameStorage = {
    // Claves de almacenamiento
    KEYS: {
        USER: 'mc_user_data',
        SESSIONS: 'mc_sessions',
        ACHIEVEMENTS: 'mc_achievements',
        CHALLENGES: 'mc_challenges',
        INVENTORY: 'mc_inventory',
        STATS: 'mc_stats',
        BACKUP: 'mc_backup',
        SETTINGS: 'mc_settings',
        DAILY: 'mc_daily_data'
    },

    // Configuración de migración
    CURRENT_VERSION: 3,

    init() {
        this.migrateDataIfNeeded();
        this.createAutoBackup();
    },

    // Migración de datos desde versiones anteriores
    migrateDataIfNeeded() {
        const savedVersion = parseInt(this.get('mc_data_version', '0'));
        
        if (savedVersion < this.CURRENT_VERSION) {
            console.log(`Migrando datos de versión ${savedVersion} a ${this.CURRENT_VERSION}...`);
            this.migrateFromV1ToV2();
            this.migrateFromV2ToV3();
            this.set('mc_data_version', this.CURRENT_VERSION);
        }
    },

    migrateFromV1ToV2() {
        // Migración de estructura antigua a nueva
        const oldUser = this.get('mentalidadCombate_user');
        const oldSessions = this.get('mentalidadCombate_sessions');
        const oldActivity = this.get('mentalidadCombate_activity');
        const oldChallenges = this.get('mentalidadCombate_challenges');
        
        if (oldUser) {
            const normalizedUser = this.normalizeUserData(oldUser);
            this.set(this.KEYS.USER, normalizedUser);
        }
        if (oldSessions) {
            this.set(this.KEYS.SESSIONS, oldSessions);
        }
        if (oldActivity) {
            this.set('mc_activity', oldActivity);
        }
        if (oldChallenges) {
            this.set(this.KEYS.CHALLENGES, oldChallenges);
        }
    },

    migrateFromV2ToV3() {
        // Migración de la versión 2 a 3
        const user = this.get(this.KEYS.USER);
        if (user) {
            const normalized = this.normalizeUserData(user);
            // Preservar datos existentes
            normalized.achievements = user.achievements || [];
            normalized.achievementPoints = user.achievementPoints || 0;
            normalized.inventory = this.getDefaultInventory();
            this.set(this.KEYS.USER, normalized);
        }
    },

    normalizeUserData(data) {
        return {
            level: data.level || 1,
            xp: data.xp || 0,
            totalXp: data.totalXp || 0,
            currentXp: data.currentXp || 0,
            xpToNextLevel: data.xpToNextLevel || 100,
            title: data.title || 'Novato',
            subtitle: data.subtitle || '',
            
            // Estadísticas
            stats: {
                totalFocusTime: data.totalFocusTime || 0,
                totalSessions: data.totalSessions || 0,
                totalDays: data.totalDays || 0,
                currentStreak: data.currentStreak || 0,
                bestStreak: data.bestStreak || 0,
                longestStreak: data.longestStreak || 0,
                perfectDays: data.perfectDays || 0,
                earlyBirdSessions: data.earlyBirdSessions || 0,
                nightOwlSessions: data.nightOwlSessions || 0,
                marathonSessions: data.marathonSessions || 0
            },
            
            // Configuración
            settings: data.settings || this.getDefaultSettings(),
            
            // Fechas
            lastActiveDate: data.lastActiveDate || null,
            createdAt: data.createdAt || new Date().toISOString(),
            lastBackupDate: null
        };
    },

    getDefaultSettings() {
        return {
            theme: 'combat',
            sound: true,
            vibration: true,
            autoBreak: false,
            dailyGoal: 8,
            animations: true,
            notifications: false,
            volume: 70,
            videoBrightness: 30,
            showTips: true,
            reducedMotion: false
        };
    },

    getDefaultInventory() {
        return {
            coins: 0,
            gems: 0,
            powerups: {
                xpBoost: { count: 0, max: 5 },
                doublePoints: { count: 0, max: 3 },
                shield: { count: 0, max: 2 },
                timeExtend: { count: 0, max: 10 }
            },
            cosmetics: {
                avatarFrames: ['default'],
                timerThemes: ['default'],
                badges: []
            },
            unlockedTitles: ['Novato']
        };
    },

    // Métodos base de almacenamiento
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            
            const parsed = JSON.parse(item);
            
            // Verificar si los datos están expirados
            if (parsed._expires && Date.now() > parsed._expires) {
                localStorage.removeItem(key);
                return defaultValue;
            }
            
            return parsed._data !== undefined ? parsed._data : parsed;
        } catch {
            console.warn(`Error al leer ${key}`);
            return defaultValue;
        }
    },

    set(key, value, expiresIn = null) {
        try {
            const data = {
                _data: value,
                _timestamp: Date.now()
            };
            
            if (expiresIn) {
                data._expires = Date.now() + expiresIn;
            }
            
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error al guardar ${key}:`, error);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // Respaldo automático
    createAutoBackup() {
        setInterval(() => {
            this.createBackup();
        }, 24 * 60 * 60 * 1000);
    },

    createBackup() {
        const backup = {
            version: this.CURRENT_VERSION,
            timestamp: new Date().toISOString(),
            user: this.get(this.KEYS.USER),
            sessions: this.get(this.KEYS.SESSIONS),
            achievements: this.get(this.KEYS.ACHIEVEMENTS),
            challenges: this.get(this.KEYS.CHALLENGES),
            inventory: this.get(this.KEYS.INVENTORY)
        };
        this.set(this.KEYS.BACKUP, backup, 7 * 24 * 60 * 60 * 1000);
    },

    restoreBackup() {
        const backup = this.get(this.KEYS.BACKUP);
        if (!backup) return false;
        
        if (backup.user) this.set(this.KEYS.USER, backup.user);
        if (backup.sessions) this.set(this.KEYS.SESSIONS, backup.sessions);
        if (backup.achievements) this.set(this.KEYS.ACHIEVEMENTS, backup.achievements);
        if (backup.challenges) this.set(this.KEYS.CHALLENGES, backup.challenges);
        if (backup.inventory) this.set(this.KEYS.INVENTORY, backup.inventory);
        
        return true;
    },

    // Exportar datos
    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            version: this.CURRENT_VERSION,
            user: this.get(this.KEYS.USER),
            sessions: this.get(this.KEYS.SESSIONS),
            achievements: this.get(this.KEYS.ACHIEVEMENTS),
            challenges: this.get(this.KEYS.CHALLENGES),
            inventory: this.get(this.KEYS.INVENTORY),
            settings: this.get(this.KEYS.SETTINGS)
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mentalidad-combate-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Importar datos
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.user) this.set(this.KEYS.USER, data.user);
            if (data.sessions) this.set(this.KEYS.SESSIONS, data.sessions);
            if (data.achievements) this.set(this.KEYS.ACHIEVEMENTS, data.achievements);
            if (data.challenges) this.set(this.KEYS.CHALLENGES, data.challenges);
            if (data.inventory) this.set(this.KEYS.INVENTORY, data.inventory);
            if (data.settings) this.set(this.KEYS.SETTINGS, data.settings);
            
            return true;
        } catch {
            return false;
        }
    }
};

// ==========================================
// DATOS DEL JUGADOR
// ==========================================

let gameState = {
    player: {
        level: 1,
        xp: 0,
        totalXp: 0,
        currentXp: 0,
        xpToNextLevel: 100,
        title: 'Novato',
        subtitle: '',
        
        stats: {
            totalFocusTime: 0,
            totalSessions: 0,
            totalDays: 0,
            currentStreak: 0,
            bestStreak: 0,
            longestStreak: 0,
            perfectDays: 0,
            earlyBirdSessions: 0,
            nightOwlSessions: 0,
            marathonSessions: 0
        },
        
        achievements: [],
        achievementPoints: 0,
        
        settings: GameStorage.getDefaultSettings(),
        
        lastActiveDate: null,
        createdAt: new Date().toISOString(),
        lastBackupDate: null
    },
    
    inventory: GameStorage.getDefaultInventory(),
    
    dailyData: {
        sessionsCompleted: 0,
        focusTimeMinutes: 0,
        xpEarned: 0,
        challengesCompleted: 0,
        perfectDay: false,
        date: null
    },
    
    sessions: [],
    activityLog: [],
    
    activeEffects: []
};

// ==========================================
// SISTEMA DE NIVELES Y TÍTULOS
// ==========================================

const LevelSystem = {
    // Fórmulas de progresión
    calculateXpForLevel(level) {
        return Math.floor(100 * Math.pow(1.15, level - 1));
    },

    getTitleForLevel(level) {
        const titles = [
            { level: 1, title: 'Novato', subtitle: 'El camino comienza' },
            { level: 2, title: 'Aprendiz', subtitle: 'Buscando la excelencia' },
            { level: 3, title: 'Guerrero', subtitle: 'Listo para el combate' },
            { level: 5, title: 'Combatiente', subtitle: 'La batalla continúa' },
            { level: 8, title: 'Espadachín', subtitle: 'Destreza letal' },
            { level: 12, title: 'Caballero', subtitle: 'Honor y deber' },
            { level: 16, title: 'Héroe', subtitle: 'Leyenda viva' },
            { level: 20, title: 'Leyenda', subtitle: 'Immortalizado' },
            { level: 25, title: 'Maestro', subtitle: 'La mente es poder' },
            { level: 30, title: 'Campeón', subtitle: 'Sin rival' },
            { level: 40, title: 'Ícono', subtitle: 'Inspiración eterna' },
            { level: 50, title: 'Dios', subtitle: 'La forma perfecta' }
        ];
        
        return titles.reverse().find(t => level >= t.level) || titles[0];
    },

    addXp(amount, source = 'session') {
        let finalAmount = amount;
        
        // Multiplicador por racha
        if (gameState.player.stats.currentStreak >= 7) {
            finalAmount *= 1.5;
        } else if (gameState.player.stats.currentStreak >= 3) {
            finalAmount *= 1.25;
        }
        
        // Multiplicador por powerups
        if (gameState.activeEffects.includes('xpBoost')) {
            finalAmount *= 2;
        }
        
        finalAmount = Math.floor(finalAmount);
        
        gameState.player.xp += finalAmount;
        gameState.player.totalXp += finalAmount;
        gameState.player.currentXp += finalAmount;
        
        this.checkLevelUp();
        
        this.save();
        this.updateUI();
        
        return finalAmount;
    },

    checkLevelUp() {
        while (gameState.player.currentXp >= gameState.player.xpToNextLevel) {
            gameState.player.currentXp -= gameState.player.xpToNextLevel;
            gameState.player.level += 1;
            gameState.player.xpToNextLevel = this.calculateXpForLevel(gameState.player.level);
            
            const titleData = this.getTitleForLevel(gameState.player.level);
            gameState.player.title = titleData.title;
            gameState.player.subtitle = titleData.subtitle;
            
            if (!gameState.inventory.cosmetics.unlockedTitles.includes(titleData.title)) {
                gameState.inventory.cosmetics.unlockedTitles.push(titleData.title);
            }
            
            this.giveLevelUpRewards();
            
            GameUI.showLevelUpAnimation(gameState.player.level);
        }
    },

    giveLevelUpRewards() {
        if (gameState.player.level % 5 === 0) {
            gameState.inventory.coins += 50;
            gameState.inventory.gems += 5;
        } else {
            gameState.inventory.coins += 20;
        }
        
        if (Math.random() < 0.3) {
            gameState.inventory.powerups.xpBoost.count = Math.min(
                gameState.inventory.powerups.xpBoost.count + 1,
                gameState.inventory.powerups.xpBoost.max
            );
        }
    },

    save() {
        GameStorage.set(GameStorage.KEYS.USER, gameState.player);
        GameStorage.set(GameStorage.KEYS.INVENTORY, gameState.inventory);
        GameStorage.set(GameStorage.KEYS.DAILY, gameState.dailyData);
        GameStorage.set('mc_sessions', gameState.sessions);
        GameStorage.set('mc_activity', gameState.activityLog);
    },

    load() {
        const savedPlayer = GameStorage.get(GameStorage.KEYS.USER);
        const savedInventory = GameStorage.get(GameStorage.KEYS.INVENTORY);
        const savedDaily = GameStorage.get(GameStorage.KEYS.DAILY);
        const savedSessions = GameStorage.get('mc_sessions');
        const savedActivity = GameStorage.get('mc_activity');
        
        if (savedPlayer) {
            gameState.player = { ...gameState.player, ...savedPlayer };
        }
        if (savedInventory) {
            gameState.inventory = { ...gameState.inventory, ...savedInventory };
        }
        if (savedDaily) {
            gameState.dailyData = { ...gameState.dailyData, ...savedDaily };
        }
        if (savedSessions) {
            gameState.sessions = savedSessions;
        }
        if (savedActivity) {
            gameState.activityLog = savedActivity;
        }
        
        this.checkNewDay();
    },

    checkNewDay() {
        const today = new Date().toDateString();
        
        if (gameState.player.lastActiveDate !== today) {
            gameState.dailyData = {
                sessionsCompleted: 0,
                focusTimeMinutes: 0,
                xpEarned: 0,
                challengesCompleted: 0,
                perfectDay: false,
                date: today
            };
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (gameState.player.lastActiveDate === yesterday.toDateString()) {
                gameState.player.stats.currentStreak += 1;
                if (gameState.player.stats.currentStreak > gameState.player.stats.longestStreak) {
                    gameState.player.stats.longestStreak = gameState.player.stats.currentStreak;
                }
                if (gameState.player.stats.currentStreak > gameState.player.stats.bestStreak) {
                    gameState.player.stats.bestStreak = gameState.player.stats.currentStreak;
                }
            } else if (gameState.player.lastActiveDate !== null) {
                if (gameState.player.lastActiveDate !== today) {
                    gameState.player.stats.currentStreak = 0;
                }
            }
            
            gameState.player.lastActiveDate = today;
        }
    },

    updateUI() {
        const levelBadge = document.getElementById('level-badge');
        const levelName = document.getElementById('level-name');
        const currentXpEl = document.getElementById('current-xp');
        const xpNeededEl = document.getElementById('xp-needed');
        const xpFill = document.getElementById('xp-fill');
        const userLevelEl = document.getElementById('user-level');
        
        if (levelBadge) {
            const span = levelBadge.querySelector('span');
            if (span) span.textContent = gameState.player.level;
        }
        if (levelName) levelName.textContent = gameState.player.title.toUpperCase();
        if (userLevelEl) userLevelEl.textContent = `Nivel ${gameState.player.level}`;
        if (currentXpEl) currentXpEl.textContent = gameState.player.currentXp;
        if (xpNeededEl) xpNeededEl.textContent = gameState.player.xpToNextLevel;
        
        if (xpFill) {
            const percentage = (gameState.player.currentXp / gameState.player.xpToNextLevel) * 100;
            xpFill.style.width = `${percentage}%`;
        }
        
        const totalFocusTime = document.getElementById('total-focus-time');
        const totalSessions = document.getElementById('total-sessions');
        const currentStreak = document.getElementById('current-streak');
        const statLevel = document.getElementById('stat-level');
        const statStreak = document.getElementById('stat-streak');
        const userTitle = document.getElementById('user-title');
        const totalAchievements = document.getElementById('total-achievements');
        const streakCurrent = document.getElementById('streak-current');
        const streakBest = document.getElementById('streak-best');
        const streakLongest = document.getElementById('streak-longest');
        
        if (totalFocusTime) {
            const hours = Math.floor(gameState.player.stats.totalFocusTime / 3600);
            const minutes = Math.floor((gameState.player.stats.totalFocusTime % 3600) / 60);
            totalFocusTime.textContent = `${hours}h ${minutes}m`;
        }
        if (totalSessions) totalSessions.textContent = gameState.player.stats.totalSessions;
        if (currentStreak) currentStreak.textContent = gameState.player.stats.currentStreak;
        if (statLevel) statLevel.textContent = gameState.player.level;
        if (statStreak) statStreak.textContent = gameState.player.stats.currentStreak;
        if (userTitle) userTitle.textContent = gameState.player.title.toUpperCase();
        if (totalAchievements) totalAchievements.textContent = gameState.player.achievements.length;
        if (streakCurrent) streakCurrent.textContent = gameState.player.stats.currentStreak;
        if (streakBest) streakBest.textContent = gameState.player.stats.bestStreak;
        if (streakLongest) streakLongest.textContent = gameState.player.stats.longestStreak;
        
        // Actualizar monedas y gemas
        const coinCount = document.getElementById('coin-count');
        const gemCount = document.getElementById('gem-count');
        if (coinCount) coinCount.textContent = gameState.inventory.coins;
        if (gemCount) gemCount.textContent = gameState.inventory.gems;
    }
};

// ==========================================
// SISTEMA DE LOGROS (COMPLETO)
// ==========================================

const AchievementSystem = {
    achievements: [
        // Logros de sesión
        { id: 'first_session', name: 'Primera Sangre', description: 'Completa tu primera sesión de foco', icon: '🎯', points: 10, category: 'sessions', rarity: 'common' },
        { id: 'sessions_5', name: 'Calentamiento', description: 'Completa 5 sesiones', icon: '🔥', points: 25, category: 'sessions', rarity: 'common' },
        { id: 'sessions_10', name: 'En Progreso', description: 'Completa 10 sesiones', icon: '✅', points: 50, category: 'sessions', rarity: 'common' },
        { id: 'sessions_25', name: 'Guerrero', description: 'Completa 25 sesiones', icon: '⚔️', points: 100, category: 'sessions', rarity: 'uncommon' },
        { id: 'sessions_50', name: 'Veterano', description: 'Completa 50 sesiones', icon: '🛡️', points: 200, category: 'sessions', rarity: 'uncommon' },
        { id: 'sessions_100', name: 'Centurión', description: 'Completa 100 sesiones', icon: '🏛️', points: 400, category: 'sessions', rarity: 'rare' },
        { id: 'sessions_250', name: 'Leyenda', description: 'Completa 250 sesiones', icon: '⭐', points: 800, category: 'sessions', rarity: 'epic' },
        { id: 'sessions_500', name: 'Invencible', description: 'Completa 500 sesiones', icon: '👑', points: 1500, category: 'sessions', rarity: 'legendary' },
        { id: 'sessions_1000', name: 'Dios del Foco', description: 'Completa 1000 sesiones', icon: '🌟', points: 3000, category: 'sessions', rarity: 'mythic' },

        // Logros de racha
        { id: 'streak_3', name: 'Momentum', description: '3 días consecutivos', icon: '💨', points: 30, category: 'streaks', rarity: 'common' },
        { id: 'streak_7', name: 'Semana de Hierro', description: '7 días consecutivos', icon: '💪', points: 100, category: 'streaks', rarity: 'uncommon' },
        { id: 'streak_14', name: 'Dos Semanas', description: '14 días consecutivos', icon: '⚡', points: 200, category: 'streaks', rarity: 'rare' },
        { id: 'streak_30', name: 'Mes de Leyenda', description: '30 días consecutivos', icon: '🌟', points: 500, category: 'streaks', rarity: 'epic' },
        { id: 'streak_100', name: 'Cien Días', description: '100 días consecutivos', icon: '🏆', points: 1500, category: 'streaks', rarity: 'legendary' },
        { id: 'streak_365', name: 'Año de Gloria', description: '365 días consecutivos', icon: '💎', points: 5000, category: 'streaks', rarity: 'mythic' },

        // Logros de tiempo
        { id: 'time_1h', name: 'Primera Hora', description: '1 hora de foco total', icon: '⏱️', points: 15, category: 'time', rarity: 'common' },
        { id: 'time_5h', name: 'Cinco Horas', description: '5 horas de foco total', icon: '⏰', points: 50, category: 'time', rarity: 'common' },
        { id: 'time_10h', name: 'Década', description: '10 horas de foco total', icon: '🧘', points: 100, category: 'time', rarity: 'uncommon' },
        { id: 'time_50h', name: 'Maestro del Foco', description: '50 horas de foco total', icon: '🎯', points: 500, category: 'time', rarity: 'rare' },
        { id: 'time_100h', name: 'Leyenda del Foco', description: '100 horas de foco total', icon: '🏆', points: 1000, category: 'time', rarity: 'epic' },

        // Logros de nivel
        { id: 'level_5', name: 'Ascenso', description: 'Alcanza el nivel 5', icon: '📈', points: 50, category: 'level', rarity: 'common' },
        { id: 'level_10', name: 'Veterano', description: 'Alcanza el nivel 10', icon: '🎖️', points: 150, category: 'level', rarity: 'uncommon' },
        { id: 'level_20', name: 'Maestro', description: 'Alcanza el nivel 20', icon: '🌠', points: 400, category: 'level', rarity: 'rare' },
        { id: 'level_30', name: 'Campeón', description: 'Alcanza el nivel 30', icon: '🏅', points: 800, category: 'level', rarity: 'epic' },
        { id: 'level_50', name: 'Leyenda Viva', description: 'Alcanza el nivel 50', icon: '👑', points: 2000, category: 'level', rarity: 'legendary' },

        // Logros especiales
        { id: 'marathon', name: 'Maratón', description: '4 sesiones en un día', icon: '🏃', points: 80, category: 'special', rarity: 'uncommon' },
        { id: 'early_bird', name: 'Amanecer', description: 'Sesión antes de las 6 AM', icon: '🌅', points: 50, category: 'special', rarity: 'uncommon' },
        { id: 'night_owl', name: 'Búho', description: 'Sesión después de las 11 PM', icon: '🦉', points: 40, category: 'special', rarity: 'uncommon' },
        { id: 'perfect_week', name: 'Semana Perfecta', description: '7 días cumpliendo meta', icon: '✨', points: 300, category: 'special', rarity: 'rare' },

        // Logros secretos
        { id: 'secret_1', name: '¿Qué es esto?', description: '???', icon: '🔮', points: 100, category: 'secret', rarity: 'legendary', hidden: true },
        { id: 'secret_2', name: 'El Camino', description: '???', icon: '🛤️', points: 200, category: 'secret', rarity: 'legendary', hidden: true },
        { id: 'secret_3', name: 'El Destino', description: '???', icon: '🎯', points: 500, category: 'secret', rarity: 'mythic', hidden: true }
    ],

    checkAndUnlock(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return false;
        
        if (gameState.player.achievements.includes(achievementId)) return false;
        
        gameState.player.achievements.push(achievementId);
        gameState.player.achievementPoints += achievement.points;
        
        this.giveAchievementRewards(achievement);
        
        GameUI.showAchievementUnlock(achievement);
        
        LevelSystem.save();
        
        return true;
    },

    giveAchievementRewards(achievement) {
        const rewards = {
            common: { coins: 10 },
            uncommon: { coins: 25, gems: 1 },
            rare: { coins: 50, gems: 3 },
            epic: { coins: 100, gems: 5, powerup: 'xpBoost' },
            legendary: { coins: 200, gems: 10, powerup: 'doublePoints' },
            mythic: { coins: 500, gems: 25, powerup: 'shield' }
        };
        
        const reward = rewards[achievement.rarity];
        if (reward) {
            if (reward.coins) gameState.inventory.coins += reward.coins;
            if (reward.gems) gameState.inventory.gems += reward.gems;
            if (reward.powerup && gameState.inventory.powerups[reward.powerup]) {
                gameState.inventory.powerups[reward.powerup].count = Math.min(
                    gameState.inventory.powerups[reward.powerup].count + 1,
                    gameState.inventory.powerups[reward.powerup].max
                );
            }
        }
    },

    checkProgress() {
        const checks = [
            { id: 'first_session', condition: gameState.player.stats.totalSessions >= 1 },
            { id: 'sessions_5', condition: gameState.player.stats.totalSessions >= 5 },
            { id: 'sessions_10', condition: gameState.player.stats.totalSessions >= 10 },
            { id: 'sessions_25', condition: gameState.player.stats.totalSessions >= 25 },
            { id: 'sessions_50', condition: gameState.player.stats.totalSessions >= 50 },
            { id: 'sessions_100', condition: gameState.player.stats.totalSessions >= 100 },
            { id: 'sessions_250', condition: gameState.player.stats.totalSessions >= 250 },
            { id: 'sessions_500', condition: gameState.player.stats.totalSessions >= 500 },
            { id: 'sessions_1000', condition: gameState.player.stats.totalSessions >= 1000 },
            { id: 'streak_3', condition: gameState.player.stats.currentStreak >= 3 },
            { id: 'streak_7', condition: gameState.player.stats.currentStreak >= 7 },
            { id: 'streak_14', condition: gameState.player.stats.currentStreak >= 14 },
            { id: 'streak_30', condition: gameState.player.stats.currentStreak >= 30 },
            { id: 'streak_100', condition: gameState.player.stats.currentStreak >= 100 },
            { id: 'streak_365', condition: gameState.player.stats.currentStreak >= 365 },
            { id: 'time_1h', condition: gameState.player.stats.totalFocusTime >= 3600 },
            { id: 'time_5h', condition: gameState.player.stats.totalFocusTime >= 18000 },
            { id: 'time_10h', condition: gameState.player.stats.totalFocusTime >= 36000 },
            { id: 'time_50h', condition: gameState.player.stats.totalFocusTime >= 180000 },
            { id: 'time_100h', condition: gameState.player.stats.totalFocusTime >= 360000 },
            { id: 'level_5', condition: gameState.player.level >= 5 },
            { id: 'level_10', condition: gameState.player.level >= 10 },
            { id: 'level_20', condition: gameState.player.level >= 20 },
            { id: 'level_30', condition: gameState.player.level >= 30 },
            { id: 'level_50', condition: gameState.player.level >= 50 }
        ];
        
        checks.forEach(check => {
            if (check.condition) {
                this.checkAndUnlock(check.id);
            }
        });
    },

    updateRecentUI() {
        const container = document.getElementById('recent-achievements');
        if (!container) return;
        
        container.innerHTML = '';
        
        const unlocked = gameState.player.achievements
            .map(id => this.achievements.find(a => a.id === id))
            .filter(Boolean)
            .slice(-5)
            .reverse();
        
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
            container.innerHTML = '<p class="empty-message">Sin logros aún. ¡Entrena más!</p>';
        }
    },

    updateGridUI() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const isUnlocked = gameState.player.achievements.includes(achievement.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${achievement.rarity}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4 class="achievement-title">${isUnlocked ? achievement.name : '???'}</h4>
                    <p class="achievement-description">${isUnlocked ? achievement.description : 'Completa este desafío para desbloquear'}</p>
                    <span class="achievement-points">${achievement.points} pts</span>
                </div>
                ${isUnlocked ? '<div class="unlock-badge">✓</div>' : ''}
            `;
            grid.appendChild(card);
        });
        
        // Actualizar estadísticas
        const unlockedCount = document.getElementById('achievements-unlocked');
        const pointsEl = document.getElementById('achievement-points');
        const remainingEl = document.getElementById('achievements-remaining');
        
        if (unlockedCount) unlockedCount.textContent = gameState.player.achievements.length;
        if (pointsEl) pointsEl.textContent = gameState.player.achievementPoints;
        if (remainingEl) remainingEl.textContent = this.achievements.length - gameState.player.achievements.length;
    }
};

// ==========================================
// SISTEMA DE DESAFÍOS DIARIOS
// ==========================================

const ChallengeSystem = {
    dailyChallenges: [],
    completedChallenges: [],
    challengeHistory: [],
    allChallenges: [
        { id: 'focus_3', title: 'Trinidad', desc: '3 sesiones de foco', goal: 3, icon: '🎯', xpReward: 30, difficulty: 'easy', category: 'sessions' },
        { id: 'focus_5', title: 'Quinteto', desc: '5 sesiones de foco', goal: 5, icon: '🔥', xpReward: 50, difficulty: 'medium', category: 'sessions' },
        { id: 'focus_8', title: 'Ocho de Oro', desc: 'Meta diaria completa', goal: 8, icon: '💪', xpReward: 80, difficulty: 'hard', category: 'sessions' },
        { id: 'time_2h', title: 'Dos Horas', desc: '2 horas de foco', goal: 120, icon: '⏰', xpReward: 60, unit: 'min', difficulty: 'medium', category: 'time' },
        { id: 'time_90min', title: 'Hora y Media', desc: '90 minutos de foco', goal: 90, icon: '⏱️', xpReward: 45, unit: 'min', difficulty: 'easy', category: 'time' },
        { id: 'streak_1', title: 'Momentum', desc: 'Mantén tu racha', goal: 1, icon: '🌟', xpReward: 20, difficulty: 'easy', category: 'streak' },
        { id: 'streak_3', title: 'Trío de Días', desc: '3 días de racha', goal: 3, icon: '💫', xpReward: 70, difficulty: 'medium', category: 'streak' },
        { id: 'perfect_day', title: 'Día Perfecto', desc: 'Completa tu meta', goal: 1, icon: '✨', xpReward: 50, difficulty: 'medium', category: 'special' },
        { id: 'marathon', title: 'Maratón', desc: '4 sesiones hoy', goal: 4, icon: '🏃', xpReward: 80, difficulty: 'hard', category: 'special' },
        { id: 'early_session', title: 'Amanecer', desc: 'Sesión antes de las 8 AM', goal: 1, icon: '🌅', xpReward: 40, difficulty: 'medium', category: 'special' },
        { id: 'night_owl', title: 'Búho', desc: 'Sesión después de las 10 PM', goal: 1, icon: '🦉', xpReward: 35, difficulty: 'medium', category: 'special' },
        { id: 'quick_1', title: 'Golpe Rápido', desc: '1 sesión en menos de 20 min', goal: 1, icon: '⚡', xpReward: 25, difficulty: 'easy', category: 'speed' },
        { id: 'double_session', title: 'Doble Impacto', desc: '2 sesiones sin pausa', goal: 2, icon: '💥', xpReward: 45, difficulty: 'medium', category: 'speed' }
    ],

    init() {
        this.loadChallengeData();
        this.generateDailyChallenges();
        this.scheduleMidnightRefresh();
        
        document.getElementById('refresh-challenges')?.addEventListener('click', () => {
            this.refreshChallenges();
        });
    },

    loadChallengeData() {
        const saved = GameStorage.get(GameStorage.KEYS.CHALLENGES);
        if (saved) {
            this.completedChallenges = saved.completed || [];
            this.challengeHistory = saved.history || [];
        }
    },

    saveChallengeData() {
        GameStorage.set(GameStorage.KEYS.CHALLENGES, {
            completed: this.completedChallenges,
            history: this.challengeHistory
        });
    },

    scheduleMidnightRefresh() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        setTimeout(() => {
            this.generateDailyChallenges();
            this.scheduleMidnightRefresh();
        }, tomorrow - now);
    },

    generateDailyChallenges() {
        const today = new Date().toDateString();
        const lastGenerated = GameStorage.get('mc_lastChallengeGen');
        
        if (lastGenerated === today && this.dailyChallenges.length > 0) {
            return;
        }
        
        // Usar día del año como semilla para selección pseudo-aleatoria
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        
        // Barajar basado en la fecha
        const shuffled = [...this.allChallenges].sort((a, b) => {
            const seedA = (dayOfYear * a.id.charCodeAt(0) + a.id.length) % 100;
            const seedB = (dayOfYear * b.id.charCodeAt(0) + b.id.length) % 100;
            return seedA - seedB;
        });
        
        this.dailyChallenges = shuffled.slice(0, 3);
        
        GameStorage.set('mc_lastChallengeGen', today);
        this.renderDailyChallenge();
        this.renderChallengesList();
    },

    refreshChallenges() {
        this.generateDailyChallenges();
        const challengesList = document.getElementById('challenges-list');
        if (challengesList) {
            challengesList.style.opacity = '0';
            setTimeout(() => {
                this.renderChallengesList();
                challengesList.style.opacity = '1';
                challengesList.style.transition = 'opacity 0.3s ease';
            }, 200);
        }
    },

    renderDailyChallenge() {
        const challenge = this.dailyChallenges[0];
        if (!challenge) return;
        
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
        
        this.updateDailyProgress(challenge, progressTextEl);
    },

    updateDailyProgress(challenge, progressTextEl) {
        const todaySessions = gameState.sessions.filter(s => {
            const sessionDate = new Date(s.timestamp).toDateString();
            return sessionDate === new Date().toDateString() && s.completed;
        });
        
        let currentProgress = 0;
        const goal = challenge.goal;
        
        switch (challenge.id) {
            case 'focus_3':
            case 'focus_5':
            case 'focus_8':
            case 'marathon':
            case 'double_session':
                currentProgress = todaySessions.length;
                break;
            case 'streak_1':
            case 'streak_3':
                currentProgress = gameState.player.stats.currentStreak >= goal ? goal : Math.min(gameState.player.stats.currentStreak, goal);
                break;
            case 'time_2h':
            case 'time_90min':
                currentProgress = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
                break;
            case 'perfect_day':
                currentProgress = todaySessions.length >= gameState.player.settings.dailyGoal ? 1 : 0;
                break;
            case 'early_session':
                const earlySessions = todaySessions.filter(s => {
                    const hour = new Date(s.startTime).getHours();
                    return hour < 8;
                });
                currentProgress = earlySessions.length;
                break;
            case 'night_owl':
                const nightSessions = todaySessions.filter(s => {
                    const hour = new Date(s.startTime).getHours();
                    return hour >= 22 || hour < 6;
                });
                currentProgress = nightSessions.length;
                break;
            case 'quick_1':
                const quickSessions = todaySessions.filter(s => {
                    return s.duration <= 20 * 60 && s.completed;
                });
                currentProgress = quickSessions.length;
                break;
        }
        
        const isCompleted = currentProgress >= goal;
        const wasCompleted = this.completedChallenges.includes(challenge.id);
        
        if (isCompleted && !wasCompleted) {
            this.completeChallenge(challenge);
        }
        
        if (progressTextEl) {
            const unit = challenge.unit || '';
            progressTextEl.textContent = `${Math.floor(currentProgress)}/${goal}${unit}`;
        }
        
        const progressRing = document.getElementById('daily-progress-ring');
        if (progressRing) {
            const circumference = 2 * Math.PI * 45;
            const progress = Math.min((currentProgress / goal), 1) * circumference;
            progressRing.style.strokeDashoffset = circumference - progress;
            
            if (isCompleted) {
                progressRing.style.stroke = '#30d158';
            }
        }
    },

    completeChallenge(challenge) {
        this.completedChallenges.push(challenge.id);
        
        let finalReward = challenge.xpReward;
        
        if (gameState.player.stats.currentStreak >= 3) {
            finalReward = Math.floor(finalReward * (1 + Math.min(gameState.player.stats.currentStreak, 30) * 0.05));
        }
        
        LevelSystem.addXp(finalReward, 'challenge');
        
        this.challengeHistory.unshift({
            id: challenge.id,
            title: challenge.title,
            completedAt: new Date().toISOString(),
            xpEarned: finalReward
        });
        
        if (this.challengeHistory.length > 50) {
            this.challengeHistory.pop();
        }
        
        this.saveChallengeData();
        LevelSystem.save();
        
        GameUI.showMissionComplete({
            ...challenge,
            xpReward: finalReward
        });
    },

    renderChallengesList() {
        const container = document.getElementById('challenges-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.dailyChallenges.slice(1).forEach(challenge => {
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
};

// ==========================================
// SISTEMA DE UI DEL JUEGO
// ==========================================

const GameUI = {
    init() {
        this.setupAnimations();
        this.setupSoundEffects();
    },

    setupAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes levelUpPulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
                70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 215, 0, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
            }
            @keyframes achievementPop {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes missionComplete {
                0% { transform: translateY(-20px); opacity: 0; }
                50% { transform: translateY(10px); }
                100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .level-up-animation { animation: levelUpPulse 1s ease-out; }
            .achievement-unlock { animation: achievementPop 0.5s ease-out; }
            .mission-complete-animation { animation: missionComplete 0.5s ease-out; }
            .shake { animation: shake 0.3s ease-in-out; }
            .reduce-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    },

    setupSoundEffects() {
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio no disponible');
        }
    },

    playSound(type) {
        if (!gameState.player.settings.sound || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'levelUp':
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;
            case 'achievement':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.4);
                break;
            case 'complete':
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(554, this.audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
        }
    },

    showLevelUpAnimation(newLevel) {
        this.playSound('levelUp');
        
        const modal = document.getElementById('achievement-modal');
        const nameEl = document.getElementById('achievement-name');
        const descEl = document.getElementById('achievement-desc');
        const xpEl = document.getElementById('achievement-xp');
        
        if (modal && nameEl && descEl) {
            nameEl.textContent = `¡NIVEL ${newLevel}!`;
            descEl.textContent = `Has alcanzado el nivel ${newLevel}. ¡Tu poder aumenta!`;
            xpEl.textContent = '⬆️ SUBIDA DE NIVEL';
            
            modal.classList.remove('hidden');
            modal.classList.add('level-up-animation');
            
            this.createConfetti();
            
            if (gameState.player.settings.vibration && navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
            
            setTimeout(() => {
                modal.classList.remove('level-up-animation');
            }, 1000);
        }
    },

    showAchievementUnlock(achievement) {
        this.playSound('achievement');
        
        const modal = document.getElementById('achievement-modal');
        const nameEl = document.getElementById('achievement-name');
        const descEl = document.getElementById('achievement-desc');
        const xpEl = document.getElementById('achievement-xp');
        
        if (modal && nameEl && descEl) {
            nameEl.textContent = achievement.name;
            descEl.textContent = achievement.description;
            xpEl.textContent = `+${achievement.points} Puntos`;
            
            modal.classList.remove('hidden');
            modal.classList.add('achievement-unlock');
            
            this.createConfetti();
            
            if (gameState.player.settings.vibration && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            
            setTimeout(() => {
                modal.classList.remove('achievement-unlock');
            }, 500);
        }
    },

    showMissionComplete(mission) {
        this.playSound('complete');
        
        const modal = document.getElementById('achievement-modal');
        const nameEl = document.getElementById('achievement-name');
        const descEl = document.getElementById('achievement-desc');
        const xpEl = document.getElementById('achievement-xp');
        
        if (modal && nameEl && descEl) {
            nameEl.textContent = `¡${mission.title}!`;
            descEl.textContent = mission.desc;
            xpEl.textContent = `+${mission.xpReward} XP`;
            
            modal.classList.remove('hidden');
            modal.classList.add('mission-complete-animation');
            
            this.createConfetti();
            
            if (gameState.player.settings.vibration && navigator.vibrate) {
                navigator.vibrate([150, 75, 150]);
            }
            
            setTimeout(() => {
                modal.classList.remove('mission-complete-animation');
            }, 500);
        }
    },

    showNotification(message, type = 'info') {
        const container = document.createElement('div');
        container.className = `notification notification-${type}`;
        container.innerHTML = `<span>${message}</span>`;
        
        document.body.appendChild(container);
        
        requestAnimationFrame(() => {
            container.classList.add('show');
        });
        
        setTimeout(() => {
            container.classList.remove('show');
            setTimeout(() => container.remove(), 300);
        }, 3000);
    },

    createConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        
        container.innerHTML = '';
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
        
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animation = `confettiFall ${1.5 + Math.random()}s ease forwards`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(confetti);
        }
    }
};

// ==========================================
// SISTEMA DE TEMPORIZADOR (COMBAT TIMER)
// ==========================================

class CombatTimer {
    constructor() {
        this.modes = {
            focus: { duration: 25 * 60, label: 'MODO FOCO', icon: '🎯', xpMultiplier: 1 },
            short: { duration: 5 * 60, label: 'DESCANSO', icon: '☕', xpMultiplier: 0.2 },
            long: { duration: 15 * 60, label: 'DESCANSO LARGO', icon: '🌟', xpMultiplier: 0.3 },
            custom: { duration: 45 * 60, label: 'MODO LIBRE', icon: '⚡', xpMultiplier: 1 }
        };
        
        this.currentMode = 'focus';
        this.timeLeft = this.modes.focus.duration;
        this.isRunning = false;
        this.interval = null;
        this.sessionStartTime = null;
        
        this.init();
    }

    init() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.isRunning) {
                    this.setMode(btn.dataset.mode);
                }
            });
        });

        // Timer controls
        document.getElementById('start-btn')?.addEventListener('click', () => this.start());
        document.getElementById('pause-btn')?.addEventListener('click', () => this.pause());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.reset());

        // Custom time slider
        document.getElementById('custom-time')?.addEventListener('input', (e) => {
            const minutes = parseInt(e.target.value);
            this.modes.custom.duration = minutes * 60;
            
            document.getElementById('custom-time-label').textContent = `${minutes}m`;
            document.getElementById('custom-time-display').textContent = `${minutes} minutos`;
            
            if (this.currentMode === 'custom' && !this.isRunning) {
                this.timeLeft = this.modes.custom.duration;
                this.updateDisplay();
            }
        });

        this.updateDisplay();
        this.updateSessionDisplay();
        this.renderSessionDots();
    }

    setMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.modes[mode].duration;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide custom time container
        const customContainer = document.getElementById('custom-time-container');
        if (customContainer) {
            if (mode === 'custom') {
                customContainer.classList.remove('hidden');
            } else {
                customContainer.classList.add('hidden');
            }
        }

        this.updateDisplay();
        this.updateProgressRing();
        
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            const modeNames = {
                focus: 'Enfócate al máximo',
                short: 'Descanso activo',
                long: 'Recuperación profunda',
                custom: 'Tu tiempo libre'
            };
            statusEl.textContent = modeNames[mode] || 'Listo para entrenar';
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.sessionStartTime = new Date();
        
        document.getElementById('start-btn')?.classList.add('hidden');
        document.getElementById('pause-btn')?.classList.remove('hidden');
        document.getElementById('reset-btn')?.classList.remove('hidden');
        
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            statusEl.textContent = this.modes[this.currentMode].label;
            statusEl.style.animation = 'pulse 2s ease-in-out infinite';
        }
        
        this.interval = setInterval(() => this.tick(), 1000);
        
        // Add session to history
        const session = {
            mode: this.currentMode,
            duration: this.modes[this.currentMode].duration,
            startTime: this.sessionStartTime.toISOString(),
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            completed: false
        };
        gameState.sessions.push(session);
        LevelSystem.save();
        
        if (gameState.player.settings.vibration && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
        
        document.getElementById('start-btn')?.classList.remove('hidden');
        document.getElementById('pause-btn')?.classList.add('hidden');
        
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            statusEl.textContent = 'Pausado';
            statusEl.style.animation = 'none';
        }
        
        if (gameState.player.settings.vibration && navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    reset() {
        this.pause();
        this.timeLeft = this.modes[this.currentMode].duration;
        
        document.getElementById('reset-btn')?.classList.add('hidden');
        
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            statusEl.textContent = 'Listo para entrenar';
            statusEl.style.animation = 'none';
        }
        
        this.updateDisplay();
        this.updateProgressRing();
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgressRing();
            
            if (this.timeLeft <= 3 && this.timeLeft > 0) {
                this.playTickSound();
                if (gameState.player.settings.vibration && navigator.vibrate) {
                    navigator.vibrate(100);
                }
            }
        } else {
            this.complete();
        }
    }

    complete() {
        this.pause();
        this.playCompleteSound();
        
        if (gameState.player.settings.vibration && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        document.getElementById('reset-btn')?.classList.add('hidden');
        
        if (this.currentMode === 'focus') {
            this.processFocusSession();
        } else if (gameState.player.settings.autoBreak) {
            setTimeout(() => this.setMode('focus'), 1000);
        }
        
        this.updateDisplay();
    }

    processFocusSession() {
        const focusTime = this.modes.focus.duration;
        const baseXp = Math.floor(focusTime / 60);
        
        const xpEarned = LevelSystem.addXp(baseXp, 'session');
        
        // Update session
        const currentSession = gameState.sessions[gameState.sessions.length - 1];
        if (currentSession) {
            currentSession.completed = true;
            currentSession.endTime = new Date().toISOString();
            currentSession.xpEarned = xpEarned;
        }
        
        // Update stats
        gameState.player.stats.totalSessions++;
        gameState.player.stats.totalFocusTime += focusTime;
        gameState.dailyData.sessionsCompleted++;
        gameState.dailyData.focusTimeMinutes += focusTime / 60;
        gameState.dailyData.xpEarned += xpEarned;
        
        // Check special sessions
        const hour = new Date().getHours();
        if (hour < 6) {
            gameState.player.stats.earlyBirdSessions++;
            AchievementSystem.checkAndUnlock('early_bird');
        }
        if (hour >= 22 || hour < 5) {
            gameState.player.stats.nightOwlSessions++;
            AchievementSystem.checkAndUnlock('night_owl');
        }
        
        // Check marathon
        if (gameState.dailyData.sessionsCompleted >= 4) {
            gameState.player.stats.marathonSessions++;
            AchievementSystem.checkAndUnlock('marathon');
        }
        
        // Check perfect day
        const dailyGoal = gameState.player.settings.dailyGoal;
        if (gameState.dailyData.sessionsCompleted >= dailyGoal && !gameState.dailyData.perfectDay) {
            gameState.dailyData.perfectDay = true;
            gameState.player.stats.perfectDays++;
            AchievementSystem.checkAndUnlock('perfect_week');
        }
        
        // Update challenges
        ChallengeSystem.updateDailyProgress(ChallengeSystem.dailyChallenges[0], document.getElementById('daily-progress-text'));
        
        // Check achievements
        AchievementSystem.checkProgress();
        
        // Log activity
        this.logActivity(`Sesión completada (+${xpEarned} XP)`);
        
        // Save everything
        LevelSystem.save();
        ChallengeSystem.saveChallengeData();
        
        // Update UI
        this.updateSessionDisplay();
        this.renderSessionDots();
        LevelSystem.updateUI();
        AchievementSystem.updateRecentUI();
    }

    logActivity(description) {
        const activity = {
            description,
            timestamp: new Date().toISOString()
        };
        gameState.activityLog.unshift(activity);
        if (gameState.activityLog.length > 50) {
            gameState.activityLog.pop();
        }
        LevelSystem.save();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');
        
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateProgressRing() {
        const ringProgress = document.querySelector('.timer-ring-progress');
        if (ringProgress) {
            const total = this.modes[this.currentMode].duration;
            const circumference = 2 * Math.PI * 90;
            const progress = ((total - this.timeLeft) / total) * circumference;
            ringProgress.style.strokeDasharray = circumference;
            ringProgress.style.strokeDashoffset = circumference - progress;
        }
    }

    updateSessionDisplay() {
        const dailyGoal = gameState.player.settings.dailyGoal;
        
        const countEl = document.getElementById('session-count');
        const goalEl = document.getElementById('session-goal');
        const focusTimeEl = document.getElementById('today-focus-time');
        const xpEl = document.getElementById('today-xp');
        
        if (countEl) countEl.textContent = gameState.dailyData.sessionsCompleted;
        if (goalEl) goalEl.textContent = dailyGoal;
        
        if (focusTimeEl) {
            const totalMinutes = gameState.dailyData.focusTimeMinutes;
            const hours = Math.floor(totalMinutes / 60);
            const mins = Math.round(totalMinutes % 60);
            focusTimeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }
        
        if (xpEl) xpEl.textContent = `+${gameState.dailyData.xpEarned}`;
    }

    renderSessionDots() {
        const container = document.getElementById('session-dots');
        if (!container) return;
        
        container.innerHTML = '';
        const dailyGoal = gameState.player.settings.dailyGoal;
        
        for (let i = 0; i < dailyGoal; i++) {
            const dot = document.createElement('span');
            dot.className = `session-dot ${i < gameState.dailyData.sessionsCompleted ? 'completed' : ''}`;
            container.appendChild(dot);
        }
    }

    playTickSound() {
        if (!gameState.player.settings.sound) return;
        
        const audio = document.getElementById('timer-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    playCompleteSound() {
        if (!gameState.player.settings.sound) return;
        
        const audio = document.getElementById('timer-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }
}

// ==========================================
// SISTEMA DE ESTADÍSTICAS
// ==========================================

const StatisticsSystem = {
    currentPeriod: 'week',

    init() {
        this.setupPeriodSelector();
    },

    setupPeriodSelector() {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.loadStatistics();
            });
        });
    },

    loadStatistics() {
        const completedSessions = gameState.sessions.filter(s => s.completed);
        const periodData = this.getPeriodData(completedSessions);
        
        this.updatePeriodStats(periodData);
        this.updateChart(periodData.dailyData);
        this.updateAdvancedStats(completedSessions);
        this.updateProductiveDays(completedSessions);
    },

    getPeriodData(sessions) {
        const now = new Date();
        let startDate = new Date();
        
        switch (this.currentPeriod) {
            case 'week': startDate.setDate(now.getDate() - 7); break;
            case 'month': startDate.setMonth(now.getMonth() - 1); break;
            case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
            case 'all': startDate = new Date(0); break;
        }
        
        const periodSessions = sessions.filter(s => new Date(s.timestamp) >= startDate);
        
        const dailyData = {};
        periodSessions.forEach(s => {
            const date = new Date(s.timestamp).toISOString().split('T')[0];
            if (!dailyData[date]) dailyData[date] = { sessions: 0, minutes: 0 };
            dailyData[date].sessions += 1;
            dailyData[date].minutes += (s.duration || 0) / 60;
        });
        
        const totalMinutes = periodSessions.reduce((sum, s) => sum + (s.duration || 0) / 60, 0);
        const totalSessions = periodSessions.length;
        const avgSession = totalSessions > 0 ? totalMinutes / totalSessions : 0;
        
        return { totalMinutes, totalSessions, avgSession, dailyData };
    },

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
    },

    updateChart(dailyData) {
        const canvas = document.getElementById('focus-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        
        canvas.width = container.offsetWidth || 300;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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
        
        values.forEach((value, index) => {
            const x = 40 + index * (barWidth + 10);
            const barHeight = (value / maxValue) * chartHeight;
            const y = canvas.height - 20 - barHeight;
            
            // Bar
            ctx.fillStyle = value > 0 ? '#30d158' : '#3a3a4a';
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fill();
        });
        
        // X axis labels
        ctx.fillStyle = '#888';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = 40 + index * (barWidth + 10) + barWidth / 2;
            ctx.fillText(label, x, canvas.height - 5);
        });
    },

    updateAdvancedStats(sessions) {
        // Best day
        const bestDayEl = document.getElementById('best-day');
        if (bestDayEl) {
            const dayCounts = {};
            sessions.forEach(s => {
                const day = new Date(s.timestamp).toLocaleDateString('es-ES', { weekday: 'long' });
                dayCounts[day] = (dayCounts[day] || 0) + 1;
            });
            const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
            bestDayEl.textContent = bestDay ? `${bestDay[0]} (${bestDay[1]})` : '-';
        }
        
        // Peak hour
        const peakHourEl = document.getElementById('peak-hour');
        if (peakHourEl) {
            const hourCounts = {};
            sessions.forEach(s => {
                const hour = new Date(s.timestamp).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
            const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
            peakHourEl.textContent = peakHour ? `${peakHour[0]}:00` : '-';
        }
        
        // Best streak
        const bestStreakEl = document.getElementById('best-streak-stat');
        if (bestStreakEl) {
            bestStreakEl.textContent = gameState.player.stats.bestStreak + ' días';
        }
        
        // Daily average
        const dailyAvgEl = document.getElementById('daily-avg-stat');
        if (dailyAvgEl) {
            const totalDays = new Set(sessions.map(s => new Date(s.timestamp).toDateString())).size;
            const avg = totalDays > 0 ? (sessions.length / totalDays).toFixed(1) : 0;
            dailyAvgEl.textContent = avg + ' sesiones';
        }
    },

    updateProductiveDays(sessions) {
        const daysGrid = document.getElementById('days-grid');
        if (!daysGrid) return;
        
        daysGrid.innerHTML = '';
        
        const dayCounts = {};
        sessions.forEach(s => {
            const day = new Date(s.timestamp).toLocaleDateString('es-ES', { weekday: 'short' });
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        
        Object.entries(dayCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([day, count]) => {
                const dayEl = document.createElement('div');
                dayEl.className = 'day-item';
                dayEl.innerHTML = `
                    <span class="day-name">${day}</span>
                    <span class="day-count">${count} sesiones</span>
                `;
                daysGrid.appendChild(dayEl);
            });
    }
};

// ==========================================
// SISTEMA DE NAVEGACIÓN Y CONFIGURACIÓN
// ==========================================

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(`${section}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function setupSettings() {
    const panel = document.getElementById('settings-panel');
    
    document.getElementById('settings-btn')?.addEventListener('click', () => {
        panel?.classList.remove('hidden');
    });
    
    panel?.querySelector('.settings-backdrop')?.addEventListener('click', () => {
        panel.classList.add('hidden');
    });
    
    document.getElementById('close-settings')?.addEventListener('click', () => {
        panel?.classList.add('hidden');
    });
    
    // Daily goal slider
    const dailyGoalSlider = document.getElementById('daily-goal');
    const dailyGoalValue = document.getElementById('daily-goal-value');
    dailyGoalSlider?.addEventListener('input', (e) => {
        const value = e.target.value;
        dailyGoalValue.textContent = value;
        gameState.player.settings.dailyGoal = parseInt(value);
        timer.renderSessionDots();
        LevelSystem.save();
    });
    
    // Settings toggles
    document.getElementById('setting-sound')?.addEventListener('change', (e) => {
        gameState.player.settings.sound = e.target.checked;
        LevelSystem.save();
    });
    
    document.getElementById('setting-vibration')?.addEventListener('change', (e) => {
        gameState.player.settings.vibration = e.target.checked;
        LevelSystem.save();
    });
    
    document.getElementById('setting-auto-break')?.addEventListener('change', (e) => {
        gameState.player.settings.autoBreak = e.target.checked;
        LevelSystem.save();
    });
    
    document.getElementById('setting-animations')?.addEventListener('change', (e) => {
        gameState.player.settings.animations = e.target.checked;
        document.body.classList.toggle('reduce-motion', !e.target.checked);
        LevelSystem.save();
    });
    
    // Video brightness
    document.getElementById('video-brightness')?.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        gameState.player.settings.videoBrightness = value;
        const overlay = document.querySelector('.video-overlay');
        const brightness = value / 100;
        if (overlay) {
            overlay.style.background = `linear-gradient(180deg, rgba(0, 0, 0, ${0.2 + brightness * 0.4}) 0%, rgba(0, 0, 0, ${0.4 + brightness * 0.4}) 50%, rgba(0, 0, 0, ${0.6 + brightness * 0.4}) 100%)`;
        }
        LevelSystem.save();
    });
    
    // Export data
    document.getElementById('export-data')?.addEventListener('click', () => {
        GameStorage.exportData();
    });
    
    // Reset progress
    document.getElementById('reset-progress')?.addEventListener('click', () => {
        if (confirm('¿Reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
            localStorage.clear();
            location.reload();
        }
    });
}

function loadSettings() {
    const dailyGoalSlider = document.getElementById('daily-goal');
    const dailyGoalValue = document.getElementById('daily-goal-value');
    if (dailyGoalSlider) dailyGoalSlider.value = gameState.player.settings.dailyGoal || 8;
    if (dailyGoalValue) dailyGoalValue.textContent = gameState.player.settings.dailyGoal || 8;
    
    const soundToggle = document.getElementById('setting-sound');
    const vibrationToggle = document.getElementById('setting-vibration');
    const autoBreakToggle = document.getElementById('setting-auto-break');
    const animationsToggle = document.getElementById('setting-animations');
    
    if (soundToggle) soundToggle.checked = gameState.player.settings.sound !== false;
    if (vibrationToggle) vibrationToggle.checked = gameState.player.settings.vibration !== false;
    if (autoBreakToggle) autoBreakToggle.checked = gameState.player.settings.autoBreak || false;
    if (animationsToggle) animationsToggle.checked = gameState.player.settings.animations !== false;
    
    const brightnessSlider = document.getElementById('video-brightness');
    if (brightnessSlider) brightnessSlider.value = gameState.player.settings.videoBrightness || 30;
    
    // Apply brightness
    const overlay = document.querySelector('.video-overlay');
    const brightness = (gameState.player.settings.videoBrightness || 30) / 100;
    if (overlay) {
        overlay.style.background = `linear-gradient(180deg, rgba(0, 0, 0, ${0.2 + brightness * 0.4}) 0%, rgba(0, 0, 0, ${0.4 + brightness * 0.4}) 50%, rgba(0, 0, 0, ${0.6 + brightness * 0.4}) 100%)`;
    }
    
    document.body.classList.toggle('reduce-motion', !gameState.player.settings.animations);
}

function setupModals() {
    document.getElementById('close-achievement')?.addEventListener('click', () => {
        document.getElementById('achievement-modal')?.classList.add('hidden');
    });
    
    document.getElementById('achievement-modal')?.querySelector('.modal-backdrop')?.addEventListener('click', () => {
        document.getElementById('achievement-modal')?.classList.add('hidden');
    });
}

// ==========================================
// SISTEMA DE FRASES DE MOTIVACIÓN
// ==========================================

function loadDailyQuote() {
    const quotes = [
        { text: "La disciplina es hacer lo que tienes que hacer, incluso cuando no quieres hacerlo.", author: "Anónimo", category: "disciplina" },
        { text: "No importa cuántas veces caigas, lo que importa es cuántas veces te levantes.", author: "Vince Lombardi", category: "resiliencia" },
        { text: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.", author: "Winston Churchill", category: "resiliencia" },
        { text: "El límite lo pone tu mente.", author: "Anónimo", category: "mente" },
        { text: "La mente es todo. Lo que piensas, te conviertes.", author: "Buda", category: "mente" },
        { text: "La acción es la puente fundamental entre tus sueños y tu realidad.", author: "Anónimo", category: "accion" },
        { text: "El tiempo es el recurso más valioso que tienes.", author: "Anónimo", category: "tiempo" },
        { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier", category: "exito" },
        { text: "No tengo miedo a los hombres que dan 1000 golpes, tengo miedo del que da uno 1000 veces.", author: "Bruce Lee", category: "mente" },
        { text: "La motivación te inicia, la disciplina te mantiene.", author: "Anónimo", category: "disciplina" },
        { text: "Cada día que no entrenas, alguien más lo está haciendo.", author: "Anónimo", category: "disciplina" },
        { text: "El éxito pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt", category: "exito" },
        { text: "La excelencia no es un acto, sino un hábito.", author: "Aristóteles", category: "exito" },
        { text: "Flota como una mariposa, pica como una abeja.", author: "Muhammad Ali", category: "boxeo" },
        { text: "No hay excusas. Solo decisiones.", author: "Anónimo", category: "disciplina" }
    ];

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const quote = quotes[dayOfYear % quotes.length];

    const quoteEl = document.getElementById('daily-quote');
    const authorEl = document.getElementById('quote-author');

    if (quoteEl) quoteEl.textContent = `"${quote.text}"`;
    if (authorEl) authorEl.textContent = `- ${quote.author}`;
}

// ==========================================
// CONFIGURACIÓN DE FONDO Y AUDIO
// ==========================================

function setupBackgroundVideo() {
    const video = document.getElementById('bg-video');
    const overlay = document.querySelector('.video-overlay');
    
    if (!video) return;
    
    video.addEventListener('error', () => {
        if (overlay) {
            overlay.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        }
        video.style.display = 'none';
    });
    
    video.addEventListener('canplay', () => {
        video.play().catch(() => {
            if (overlay) {
                overlay.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
            }
        });
    });
}

function setupAudio() {
    const audio = document.getElementById('timer-sound');
    if (audio) {
        audio.addEventListener('error', () => {
            audio.dataset.missing = 'true';
        });
    }
}

// ==========================================
// OCULTAR LOADER
// ==========================================

function hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
    loader.style.visibility = 'hidden';
    loader.style.pointerEvents = 'none';
    
    loader.classList.add('hidden');
    
    setTimeout(() => {
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }, 600);
}

// ==========================================
// INICIALIZACIÓN PRINCIPAL
// ==========================================

let timer;

function init() {
    console.log('Inicializando Mentalidad de Combate - Game Edition...');
    
    try {
        // Inicializar almacenamiento
        GameStorage.init();
        
        // Cargar datos
        LevelSystem.load();
        
        // Inicializar sistemas
        GameUI.init();
        AchievementSystem.updateRecentUI();
        ChallengeSystem.init();
        StatisticsSystem.init();
        
        // Inicializar timer
        timer = new CombatTimer();
        
        // Configurar UI
        setupNavigation();
        setupSettings();
        loadSettings();
        setupModals();
        loadDailyQuote();
        LevelSystem.updateUI();
        AchievementSystem.updateGridUI();
        
        // Ocultar loader
        const tryHideLoader = () => {
            const loader = document.getElementById('loader');
            if (loader && !loader.classList.contains('hidden')) {
                setTimeout(hideLoader, 500);
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryHideLoader);
        } else {
            tryHideLoader();
        }
        
        // Mecanismo de respaldo
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader && !loader.classList.contains('hidden')) {
                hideLoader();
            }
        }, 2500);
        
        // Registrar service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {
                console.log('Service Worker no disponible');
            });
        }
        
        console.log('¡Listo para entrenar!');
    } catch (error) {
        console.error('Error durante inicialización:', error);
        hideLoader();
    }
}

// Canvas roundRect polyfill
if (!HTMLCanvasElement.prototype.roundRect) {
    HTMLCanvasElement.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Iniciar aplicación
init();
