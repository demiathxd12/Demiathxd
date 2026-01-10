/**
 * MENTALIDAD DE COMBATE 3.0
 * Versión Optimizada - Sin Registro/Login
 * Usa localStorage para persistencia local
 */

// ==========================================
// ALMACENAMIENTO LOCAL SIMPLIFICADO
// ==========================================

const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    }
};

// ==========================================
// DATOS DEL USUARIO (LOCAL)
// ==========================================

let userData = {
    level: 1,
    xp: 0,
    totalFocusTime: 0,
    totalSessions: 0,
    currentStreak: 0,
    bestStreak: 0,
    longestStreak: 0,
    achievements: [],
    settings: {
        sound: true,
        vibration: true,
        autoBreak: false,
        dailyGoal: 8
    },
    lastActiveDate: null
};

// Logros disponibles
const allAchievements = [
    { id: 'first_session', name: 'Primera Sangre', description: 'Completa tu primera sesión', icon: '🎯', xpReward: 10, category: 'sessions' },
    { id: 'streak_3', name: 'Racha de 3', description: '3 días consecutivos', icon: '🔥', xpReward: 30, category: 'streaks' },
    { id: 'streak_7', name: 'Semana de Hierro', description: '7 días consecutivos', icon: '💪', xpReward: 70, category: 'streaks' },
    { id: 'streak_30', name: 'Mes de Leyenda', description: '30 días consecutivos', icon: '👑', xpReward: 300, category: 'streaks' },
    { id: 'sessions_10', name: 'Calentamiento', description: '10 sesiones completadas', icon: '✅', xpReward: 25, category: 'sessions' },
    { id: 'sessions_50', name: 'Guerrero', description: '50 sesiones completadas', icon: '⚔️', xpReward: 100, category: 'sessions' },
    { id: 'sessions_100', name: 'Campeón', description: '100 sesiones completadas', icon: '🏅', xpReward: 200, category: 'sessions' },
    { id: 'focus_1h', name: '1 Hora de Foco', description: 'Acumula 1 hora de tiempo de foco', icon: '⏱️', xpReward: 20, category: 'time' },
    { id: 'focus_10h', name: '10 Horas de Foco', description: 'Acumula 10 horas de tiempo de foco', icon: '⏰', xpReward: 100, category: 'time' },
    { id: 'focus_100h', name: 'Maestro del Foco', description: 'Acumula 100 horas de tiempo de foco', icon: '🧘', xpReward: 500, category: 'time' },
    { id: 'level_5', name: 'Ascenso', description: 'Alcanza el nivel 5', icon: '⭐', xpReward: 50, category: 'level' },
    { id: 'level_10', name: 'Veterano', description: 'Alcanza el nivel 10', icon: '🎖️', xpReward: 150, category: 'level' },
    { id: 'level_25', name: 'Maestro', description: 'Alcanza el nivel 25', icon: '🌠', xpReward: 400, category: 'level' },
    { id: 'challenges_5', name: 'Cazador', description: 'Completa 5 desafíos', icon: '🎯', xpReward: 50, category: 'challenges' },
    { id: 'challenges_20', name: 'Conquistador', description: 'Completa 20 desafíos', icon: '🏅', xpReward: 150, category: 'challenges' },
    { id: 'marathon', name: 'Maratón', description: '4 sesiones en un solo día', icon: '🏃', xpReward: 100, category: 'special' }
];

// Historial de sesiones
let sessionHistory = [];
let activityLog = [];

// ==========================================
// SISTEMA DE TIMER - VERSION MEJORADA
// ==========================================

class CombatTimer {
    constructor() {
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
        this.sessionStartTime = null;
        this.pendingModeChange = null;
        
        this.loadTodayProgress();
        this.init();
    }

    loadTodayProgress() {
        const today = new Date().toDateString();
        const todaySessions = sessionHistory.filter(s => {
            const sessionDate = new Date(s.timestamp).toDateString();
            return sessionDate === today && s.completed;
        });
        
        this.sessionsToday = todaySessions.length;
        this.xpToday = todaySessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
    }

    init() {
        // Mode buttons with improved event handling
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.dataset.mode;
                
                // Visual feedback immediately
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 100);
                
                this.setMode(mode);
            });
        });

        // Timer controls
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        
        // Custom time slider with real-time feedback
        const customTimeSlider = document.getElementById('custom-time');
        if (customTimeSlider) {
            customTimeSlider.addEventListener('input', (e) => {
                const minutes = parseInt(e.target.value);
                this.modes.custom.duration = minutes * 60;
                
                const labelEl = document.getElementById('custom-time-label');
                const displayEl = document.getElementById('custom-time-display');
                
                if (labelEl) labelEl.textContent = `${minutes}m`;
                if (displayEl) displayEl.textContent = `${minutes} minutos`;
                
                // Update timer in real-time if in custom mode and not running
                if (this.currentMode === 'custom' && !this.isRunning) {
                    this.timeLeft = this.modes.custom.duration;
                    this.updateDisplay();
                    this.updateProgressRing();
                }
            });
            
            // Add touch feedback for mobile
            customTimeSlider.addEventListener('touchstart', () => {
                customTimeSlider.style.transform = 'scale(1.05)';
            });
            customTimeSlider.addEventListener('touchend', () => {
                customTimeSlider.style.transform = '';
            });
        }

        this.updateDisplay();
        this.renderSessionDots();
        this.updateSessionDisplay();
    }

    setMode(mode) {
        // Prevent mode change while running
        if (this.isRunning) {
            this.showModeChangeBlockedFeedback();
            return;
        }
        
        // Store previous mode for animation
        const previousMode = this.currentMode;
        this.currentMode = mode;
        this.timeLeft = this.modes[mode].duration;
        
        // Update button states with smooth transition
        document.querySelectorAll('.mode-btn').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('active', isActive);
            
            if (isActive) {
                btn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            }
        });
        
        // Show/hide custom time container
        const customContainer = document.getElementById('custom-time-container');
        if (customContainer) {
            if (mode === 'custom') {
                customContainer.classList.remove('hidden');
                customContainer.style.opacity = '0';
                customContainer.style.transform = 'translateY(-10px)';
                requestAnimationFrame(() => {
                    customContainer.style.transition = 'all 0.3s ease';
                    customContainer.style.opacity = '1';
                    customContainer.style.transform = 'translateY(0)';
                });
            } else {
                customContainer.style.opacity = '0';
                customContainer.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    customContainer.classList.add('hidden');
                }, 300);
            }
        }
        
        // Update display with animation
        this.updateDisplay();
        this.updateProgressRing();
        this.triggerModeChangeAnimation(previousMode, mode);
    }

    showModeChangeBlockedFeedback() {
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            statusEl.textContent = 'Detén el timer primero';
            statusEl.style.color = '#ff3b30';
            
            // Shake animation
            const timerDisplay = document.querySelector('.timer-display');
            if (timerDisplay) {
                timerDisplay.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    timerDisplay.style.animation = '';
                    statusEl.style.color = '';
                    statusEl.textContent = 'Enfócate al máximo';
                }, 500);
            }
        }
    }

    triggerModeChangeAnimation(fromMode, toMode) {
        const timerContent = document.querySelector('.timer-content');
        if (timerContent) {
            // Reset animation
            timerContent.style.transition = 'none';
            timerContent.style.transform = 'scale(0.8)';
            timerContent.style.opacity = '0';
            
            // Trigger animation
            requestAnimationFrame(() => {
                timerContent.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                timerContent.style.transform = 'scale(1)';
                timerContent.style.opacity = '1';
            });
        }
        
        // Update status text with new mode
        const statusEl = document.getElementById('timer-status');
        if (statusEl) {
            const modeNames = {
                focus: 'Enfócate al máximo',
                short: 'Descanso activo',
                long: 'Recuperación profunda',
                custom: 'Tu tiempo libre'
            };
            statusEl.textContent = modeNames[toMode] || 'Listo para entrenar';
        }
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

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.sessionStartTime = new Date();
        
        document.getElementById('start-btn')?.classList.add('hidden');
        document.getElementById('pause-btn')?.classList.remove('hidden');
        document.getElementById('reset-btn')?.classList.remove('hidden');
        
        const statusEl = document.getElementById('timer-status');
        const modeNames = {
            focus: 'Enfócate al máximo',
            short: 'Descanso activo',
            long: 'Recuperación profunda',
            custom: 'Tu tiempo libre'
        };
        if (statusEl) {
            statusEl.textContent = modeNames[this.currentMode] || 'Entrenando';
            statusEl.style.animation = 'pulse 2s ease-in-out infinite';
        }
        
        // Start interval with better timing
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
        sessionHistory.push(session);
        saveData();
        
        const ringProgress = document.querySelector('.timer-ring-progress');
        if (ringProgress) {
            ringProgress.style.animation = 'pulse 2s ease-in-out infinite';
        }
        
        // Haptic feedback on start
        if (userData.settings.vibration && navigator.vibrate) {
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
        
        const ringProgress = document.querySelector('.timer-ring-progress');
        if (ringProgress) {
            ringProgress.style.animation = 'none';
        }
        
        // Haptic feedback on pause
        if (userData.settings.vibration && navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    reset() {
        this.pause();
        this.timeLeft = this.modes[this.currentMode].duration;
        this.updateDisplay();
        this.updateProgressRing();
        
        document.getElementById('reset-btn')?.classList.add('hidden');
        
        const statusEl = document.getElementById('timer-status');
        const modeNames = {
            focus: 'Listo para entrenar',
            short: 'Listo para descansar',
            long: 'Listo para recuperación',
            custom: 'Listo para tu sesión'
        };
        if (statusEl) {
            statusEl.textContent = modeNames[this.currentMode] || 'Listo para entrenar';
        }
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgressRing();
            
            if (this.timeLeft <= 3 && this.timeLeft > 0) {
                this.playTickSound();
                // Haptic feedback for last 3 seconds
                if (userData.settings.vibration && navigator.vibrate) {
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
        this.vibrate();
        
        document.getElementById('reset-btn')?.classList.add('hidden');
        
        if (this.currentMode === 'focus') {
            this.processFocusCompletion();
        } else if (userData.settings.autoBreak) {
            setTimeout(() => {
                this.setMode('focus');
            }, 1000);
        }
        
        this.updateDisplay();
        this.updateProgressRing();
    }

    processFocusCompletion() {
        const focusTime = this.modes.focus.duration;
        const xpEarned = Math.floor(focusTime / 60);
        this.xpToday += xpEarned;
        
        // Update session
        const currentSession = sessionHistory[sessionHistory.length - 1];
        if (currentSession) {
            currentSession.completed = true;
            currentSession.endTime = new Date().toISOString();
            currentSession.xpEarned = xpEarned;
        }
        
        this.sessionsToday++;
        
        // Update user data
        userData.totalSessions += 1;
        userData.totalFocusTime += focusTime;
        userData.xp += xpEarned;
        
        // Level up
        const xpNeeded = userData.level * 100;
        if (userData.xp >= xpNeeded) {
            userData.level += 1;
            userData.xp = userData.xp - xpNeeded;
            this.showLevelUpAnimation(userData.level);
            this.logActivity(`¡Nivel ${userData.level} alcanzado!`);
        }
        
        // Update streak
        this.updateStreak();
        
        // Check achievements
        this.checkAchievements();
        
        // Save all data
        saveData();
        
        // Update UI
        this.updateSessionDisplay();
        this.renderSessionDots();
        updateAllUI();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (userData.lastActiveDate === yesterday.toDateString()) {
            userData.currentStreak += 1;
            if (userData.currentStreak > userData.bestStreak) {
                userData.bestStreak = userData.currentStreak;
            }
            if (userData.currentStreak > userData.longestStreak) {
                userData.longestStreak = userData.currentStreak;
            }
        } else if (userData.lastActiveDate !== today) {
            userData.currentStreak = 1;
        }
        
        userData.lastActiveDate = today;
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');
        
        // Ensure elements exist and update text content
        const minutesText = String(minutes).padStart(2, '0');
        const secondsText = String(seconds).padStart(2, '0');
        
        if (minutesEl) {
            minutesEl.textContent = minutesText;
        }
        if (secondsEl) {
            secondsEl.textContent = secondsText;
        }
    }

    updateSessionDisplay() {
        const goal = userData.settings.dailyGoal;
        const countEl = document.getElementById('session-count');
        const goalEl = document.getElementById('session-goal');
        
        if (countEl) countEl.textContent = this.sessionsToday;
        if (goalEl) goalEl.textContent = goal;
        
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
        const goal = userData.settings.dailyGoal;
        
        for (let i = 0; i < goal; i++) {
            const dot = document.createElement('span');
            dot.className = `session-dot ${i < this.sessionsToday ? 'completed' : ''}`;
            container.appendChild(dot);
        }
    }

    playTickSound() {
        if (!userData.settings.sound) return;
        const audio = document.getElementById('timer-sound');
        if (audio && audio.dataset.missing !== 'true') {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    playCompleteSound() {
        if (!userData.settings.sound) return;
        const audio = document.getElementById('timer-sound');
        if (audio && audio.dataset.missing !== 'true') {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    vibrate() {
        if (!userData.settings.vibration) return;
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
            this.triggerModalAnimation(modal.querySelector('.modal-content'));
            createConfetti();
        }
    }

    triggerModalAnimation(element) {
        if (!element) return;
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        });
    }

    checkAchievements() {
        const checks = [
            { id: 'first_session', condition: userData.totalSessions >= 1 },
            { id: 'sessions_10', condition: userData.totalSessions >= 10 },
            { id: 'sessions_50', condition: userData.totalSessions >= 50 },
            { id: 'sessions_100', condition: userData.totalSessions >= 100 },
            { id: 'focus_1h', condition: userData.totalFocusTime >= 3600 },
            { id: 'focus_10h', condition: userData.totalFocusTime >= 36000 },
            { id: 'focus_100h', condition: userData.totalFocusTime >= 360000 },
            { id: 'streak_3', condition: userData.currentStreak >= 3 },
            { id: 'streak_7', condition: userData.currentStreak >= 7 },
            { id: 'streak_30', condition: userData.currentStreak >= 30 },
            { id: 'level_5', condition: userData.level >= 5 },
            { id: 'level_10', condition: userData.level >= 10 },
            { id: 'level_25', condition: userData.level >= 25 },
            { id: 'marathon', condition: this.sessionsToday >= 4 }
        ];
        
        for (const check of checks) {
            if (userData.achievements.includes(check.id)) continue;
            if (check.condition) {
                this.unlockAchievement(check.id);
            }
        }
    }

    unlockAchievement(achievementId) {
        const achievement = allAchievements.find(a => a.id === achievementId);
        if (!achievement) return;
        
        userData.achievements.push(achievementId);
        userData.xp += achievement.xpReward;
        
        this.logActivity(`Logro: ${achievement.name}`);
        
        const modal = document.getElementById('achievement-modal');
        const nameEl = document.getElementById('achievement-name');
        const descEl = document.getElementById('achievement-desc');
        
        if (modal && nameEl && descEl) {
            nameEl.textContent = achievement.name;
            descEl.textContent = achievement.description;
            document.getElementById('achievement-xp').textContent = `+${achievement.xpReward}`;
            
            modal.classList.remove('hidden');
            this.triggerModalAnimation(modal.querySelector('.modal-content'));
            createConfetti();
        }
        
        saveData();
        updateAllUI();
    }

    logActivity(description) {
        const activity = {
            description,
            timestamp: new Date().toISOString()
        };
        activityLog.unshift(activity);
        if (activityLog.length > 50) activityLog.pop();
        saveData();
    }
}

// ==========================================
// SISTEMA DE DESAFÍOS
// ==========================================

class ChallengeSystem {
    constructor() {
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
            { id: 'focus_3', title: 'Trinidad', desc: '3 sesiones de foco', goal: 3, icon: '🎯', xpReward: 30 },
            { id: 'focus_5', title: 'Quinteto', desc: '5 sesiones de foco', goal: 5, icon: '🔥', xpReward: 50 },
            { id: 'focus_8', title: 'Ocho de Oro', desc: 'Meta diaria completa', goal: 8, icon: '💪', xpReward: 80 },
            { id: 'streak_1', title: 'Momentum', desc: 'Mantén tu racha hoy', goal: 1, icon: '🌟', xpReward: 20 },
            { id: 'time_2h', title: 'Dos Horas', desc: '2 horas de foco', goal: 120, icon: '⏰', xpReward: 40, unit: 'min' },
            { id: 'perfect_day', title: 'Día Perfecto', desc: 'Completa todas las metas', goal: 1, icon: '✨', xpReward: 150 },
            { id: 'early_session', title: 'Amanecer', desc: 'Sesión antes de las 8 AM', goal: 1, icon: '🌅', xpReward: 30 },
            { id: 'marathon', title: 'Maratón', desc: '4 sesiones hoy', goal: 4, icon: '🏃', xpReward: 100 }
        ];
        
        // Shuffle based on date
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const shuffled = allChallenges.sort((a, b) => {
            const seedA = (dayOfYear * a.id.charCodeAt(0)) % 100;
            const seedB = (dayOfYear * b.id.charCodeAt(0)) % 100;
            return seedA - seedB;
        });
        
        this.dailyChallenges = shuffled.slice(0, 3);
        this.renderDailyChallenge();
        this.renderChallengesList();
    }

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
    }

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
    }

    updateDailyProgress(challenge, progressTextEl) {
        const today = new Date().toDateString();
        const todaySessions = sessionHistory.filter(s => {
            const sessionDate = new Date(s.timestamp).toDateString();
            return sessionDate === today && s.completed;
        });
        
        let currentProgress = 0;
        const goal = challenge.goal;
        
        switch (challenge.id) {
            case 'focus_3':
            case 'focus_5':
            case 'focus_8':
            case 'marathon':
                currentProgress = todaySessions.length;
                break;
            case 'streak_1':
                currentProgress = userData.currentStreak >= 1 ? 1 : 0;
                break;
            case 'time_2h':
                currentProgress = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
                break;
            case 'perfect_day':
                const dailyGoal = userData.settings.dailyGoal;
                currentProgress = todaySessions.length >= dailyGoal ? 1 : 0;
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
            const unit = challenge.unit || '';
            progressTextEl.textContent = `${Math.floor(currentProgress)}/${goal}${unit}`;
        }
        
        const progressRing = document.getElementById('daily-progress-ring');
        if (progressRing) {
            const circumference = 2 * Math.PI * 45;
            const progress = Math.min((currentProgress / goal), 1) * circumference;
            progressRing.style.strokeDashoffset = circumference - progress;
        }
    }

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
}

// ==========================================
// SISTEMA DE ESTADÍSTICAS
// ==========================================

class StatisticsSystem {
    constructor() {
        this.currentPeriod = 'week';
    }

    init() {
        this.setupPeriodSelector();
    }

    setupPeriodSelector() {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.loadStatistics();
            });
        });
    }

    loadStatistics() {
        const completedSessions = sessionHistory.filter(s => s.completed);
        const periodData = this.getPeriodData(completedSessions);
        
        this.updatePeriodStats(periodData);
        this.updateChart(periodData.dailyData);
        this.updateAdvancedStats(completedSessions);
        this.updateProductiveDays(completedSessions);
    }

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
            const y = canvas.height - 30 - barHeight;
            
            const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 30);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#888888');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect?.(x, y, barWidth, barHeight, 4) || ctx.fillRect(x, y, barWidth, barHeight);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px SF Pro Display';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(value), x + barWidth / 2, y - 5);
            
            ctx.fillStyle = '#888888';
            ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 10);
        });
    }

    updateAdvancedStats(sessions) {
        const dayStats = {};
        sessions.forEach(s => {
            const day = new Date(s.timestamp).toLocaleDateString('es-ES', { weekday: 'long' });
            if (!dayStats[day]) dayStats[day] = 0;
            dayStats[day] += (s.duration || 0) / 60;
        });
        
        const bestDay = Object.entries(dayStats).reduce((best, [day, minutes]) => {
            return minutes > (best?.minutes || 0) ? { day, minutes } : best;
        }, null);
        
        const bestDayEl = document.getElementById('best-day');
        if (bestDayEl) bestDayEl.textContent = bestDay ? bestDay.day.split(',')[0] : '-';
        
        const peakHour = {};
        sessions.forEach(s => {
            const hour = new Date(s.timestamp).getHours();
            if (!peakHour[hour]) peakHour[hour] = 0;
            peakHour[hour] += 1;
        });
        
        const peak = Object.entries(peakHour).reduce((best, [hour, count]) => {
            return count > (best?.count || 0) ? { hour: parseInt(hour), count } : best;
        }, null);
        
        const peakHourEl = document.getElementById('peak-hour');
        if (peakHourEl) peakHourEl.textContent = peak ? `${peak.hour}:00` : '-';
        
        const bestStreakEl = document.getElementById('best-streak-stat');
        if (bestStreakEl) bestStreakEl.textContent = `${userData.bestStreak} días`;
        
        const days = new Set(sessions.map(s => new Date(s.timestamp).toDateString())).size;
        const avgMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0) / 60, 0) / (days || 1);
        const dailyAvgEl = document.getElementById('daily-avg-stat');
        if (dailyAvgEl) dailyAvgEl.textContent = `${Math.round(avgMinutes)} min`;
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
// FUNCIONES GLOBALES
// ==========================================

let timer, challenges, statistics;

function loadData() {
    const savedUser = Storage.get('mentalidadCombate_user');
    const savedSessions = Storage.get('mentalidadCombate_sessions');
    const savedActivity = Storage.get('mentalidadCombate_activity');
    
    if (savedUser) userData = savedUser;
    if (savedSessions) sessionHistory = savedSessions;
    if (savedActivity) activityLog = savedActivity;
    
    // Check for new day
    const today = new Date().toDateString();
    if (userData.lastActiveDate && userData.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (userData.lastActiveDate === yesterday.toDateString()) {
            userData.currentStreak += 1;
            if (userData.currentStreak > userData.longestStreak) {
                userData.longestStreak = userData.currentStreak;
            }
        } else {
            userData.currentStreak = 0;
        }
    }
    
    userData.lastActiveDate = today;
    saveData();
}

function saveData() {
    Storage.set('mentalidadCombate_user', userData);
    Storage.set('mentalidadCombate_sessions', sessionHistory);
    Storage.set('mentalidadCombate_activity', activityLog);
}

function updateAllUI() {
    const levelNames = ['NOVATO', 'APRENDIZ', 'GUERRERO', 'LUCHADOR', 'COMBATIENTE', 'CAMPEÓN', 'LEGENDARIO', 'MÍTICO', 'DIOS', 'MÁSTER', 'IMMORTAL', 'LEGEND'];
    
    // Level
    const levelBadgeSpan = document.getElementById('level-badge')?.querySelector('span');
    if (levelBadgeSpan) levelBadgeSpan.textContent = userData.level;
    document.getElementById('level-name').textContent = levelNames[Math.min(userData.level - 1, levelNames.length - 1)];
    document.getElementById('user-level').textContent = `Nivel ${userData.level}`;
    
    // XP
    const xpNeeded = userData.level * 100;
    document.getElementById('current-xp').textContent = userData.xp;
    document.getElementById('xp-needed').textContent = xpNeeded;
    
    const xpFill = document.getElementById('xp-fill');
    if (xpFill) xpFill.style.width = `${(userData.xp / xpNeeded) * 100}%`;
    
    // Stats
    const totalHours = Math.floor(userData.totalFocusTime / 3600);
    const totalMinutes = Math.floor((userData.totalFocusTime % 3600) / 60);
    document.getElementById('total-focus-time').textContent = `${totalHours}h ${totalMinutes}m`;
    document.getElementById('total-sessions').textContent = userData.totalSessions;
    document.getElementById('current-streak').textContent = userData.currentStreak;
    
    // Streaks
    document.getElementById('streak-current').textContent = userData.currentStreak;
    document.getElementById('streak-best').textContent = userData.bestStreak;
    document.getElementById('streak-longest').textContent = userData.longestStreak;
    
    // Progress section
    document.getElementById('stat-level').textContent = userData.level;
    document.getElementById('stat-streak').textContent = userData.currentStreak;
    document.getElementById('user-title').textContent = levelNames[Math.min(userData.level - 1, levelNames.length - 1)];
    document.getElementById('total-achievements').textContent = userData.achievements.length;
    
    // Recent achievements
    updateRecentAchievements();
    
    // Activity
    updateActivityLog();
}

function updateRecentAchievements() {
    const container = document.getElementById('recent-achievements');
    if (!container) return;
    
    container.innerHTML = '';
    
    const unlocked = userData.achievements
        .map(id => allAchievements.find(a => a.id === id))
        .filter(Boolean)
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
        container.innerHTML = '<p class="empty-message">Sin logros aún. ¡Entrena más!</p>';
    }
}

function updateActivityLog() {
    const container = document.getElementById('activity-timeline');
    if (!container) return;
    
    container.innerHTML = '';
    
    activityLog.slice(0, 10).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const timeAgo = formatTimeAgo(activity.timestamp);
        
        item.innerHTML = `
            <div class="activity-dot"></div>
            <div class="activity-content">
                <p>${activity.description}</p>
                <span>${timeAgo}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function createConfetti() {
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
                targetSection.style.animation = 'none';
                targetSection.offsetHeight;
                targetSection.style.animation = 'fadeSlideIn 0.3s ease forwards';
            }
            
            if (section === 'stats' && statistics) {
                statistics.loadStatistics();
            }
        });
    });
}

function setupSettings() {
    const panel = document.getElementById('settings-panel');
    
    document.getElementById('settings-btn')?.addEventListener('click', () => {
        panel.classList.remove('hidden');
        loadSettings();
        panel.querySelector('.settings-content').style.transform = 'translateY(20px)';
        panel.querySelector('.settings-content').style.opacity = '0';
        requestAnimationFrame(() => {
            panel.querySelector('.settings-content').style.transition = 'all 0.3s ease';
            panel.querySelector('.settings-content').style.transform = 'translateY(0)';
            panel.querySelector('.settings-content').style.opacity = '1';
        });
    });
    
    panel?.querySelector('.settings-backdrop')?.addEventListener('click', () => {
        panel.classList.add('hidden');
    });
    
    document.getElementById('close-settings')?.addEventListener('click', () => {
        panel.classList.add('hidden');
    });
    
    // Daily goal slider
    const dailyGoalSlider = document.getElementById('daily-goal');
    const dailyGoalValue = document.getElementById('daily-goal-value');
    dailyGoalSlider?.addEventListener('input', (e) => {
        const value = e.target.value;
        dailyGoalValue.textContent = value;
        userData.settings.dailyGoal = parseInt(value);
        saveData();
        timer?.loadTodayProgress();
        timer?.updateSessionDisplay();
        timer?.renderSessionDots();
    });
    
    // Settings toggles
    document.getElementById('setting-sound')?.addEventListener('change', (e) => {
        userData.settings.sound = e.target.checked;
        saveData();
    });
    
    document.getElementById('setting-vibration')?.addEventListener('change', (e) => {
        userData.settings.vibration = e.target.checked;
        saveData();
    });
    
    document.getElementById('setting-auto-break')?.addEventListener('change', (e) => {
        userData.settings.autoBreak = e.target.checked;
        saveData();
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
    document.getElementById('reset-progress')?.addEventListener('click', () => {
        if (confirm('¿Reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
            userData = {
                level: 1,
                xp: 0,
                totalFocusTime: 0,
                totalSessions: 0,
                currentStreak: 0,
                bestStreak: 0,
                longestStreak: 0,
                achievements: [],
                settings: { sound: true, vibration: true, autoBreak: false, dailyGoal: 8 },
                lastActiveDate: new Date().toDateString()
            };
            sessionHistory = [];
            activityLog = [];
            saveData();
            updateAllUI();
            timer?.loadTodayProgress();
            timer?.updateSessionDisplay();
            timer?.renderSessionDots();
            panel.classList.add('hidden');
        }
    });
    
    // Export data
    document.getElementById('export-data')?.addEventListener('click', () => {
        const data = {
            exportDate: new Date().toISOString(),
            user: userData,
            sessions: sessionHistory,
            activity: activityLog
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mentalidad-combate-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function loadSettings() {
    document.getElementById('daily-goal').value = userData.settings.dailyGoal;
    document.getElementById('daily-goal-value').textContent = userData.settings.dailyGoal;
    document.getElementById('setting-sound').checked = userData.settings.sound !== false;
    document.getElementById('setting-vibration').checked = userData.settings.vibration !== false;
    document.getElementById('setting-auto-break').checked = userData.settings.autoBreak || false;
}

function setupModals() {
    document.getElementById('close-achievement')?.addEventListener('click', () => {
        document.getElementById('achievement-modal')?.classList.add('hidden');
    });
    
    document.getElementById('achievement-modal')?.querySelector('.modal-backdrop')?.addEventListener('click', () => {
        document.getElementById('achievement-modal')?.classList.add('hidden');
    });
}

function loadDailyQuote() {
    const quotes = [
        // Categoría: Disciplina y Hábito (1-20)
        { text: "La disciplina es hacer lo que tienes que hacer, incluso cuando no quieres hacerlo.", author: "Anónimo", category: "disciplina" },
        { text: "El hábito es el cable que tejen día a día, y al final no puedes romperlo.", author: "Anónimo", category: "disciplina" },
        { text: "No hay atajos hacia el lugar donde vas. Todos los caminos pasan por la disciplina.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina pesa gramos, pero las consecuencias pesan toneladas.", author: "Anónimo", category: "disciplina" },
        { text: "Disciplina es elegir entre lo que quieres ahora y lo que quieres después.", author: "Anónimo", category: "disciplina" },
        { text: "Los hábitos exitosos son la respuesta a una vida exitosa.", author: "Anónimo", category: "disciplina" },
        { text: "La motivación te inicia, la disciplina te mantiene.", author: "Anónimo", category: "disciplina" },
        { text: "Pequeños pasos, consistentes, todos los días. Eso es la disciplina.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina aplicada constantemente supera al talento natural.", author: "Anónimo", category: "disciplina" },
        { text: "No necesitas motivación, necesitas disciplina.", author: "Anónimo", category: "disciplina" },
        { text: "El éxito es 10% inspiración y 90% transpiración, es decir, disciplina.", author: "Anónimo", category: "disciplina" },
        { text: "Cada día que no entrenas, alguien más lo está haciendo.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina es桥梁 entre metas y logros.", author: "Anónimo", category: "disciplina" },
        { text: " Entrenar cuando nadie mira es lo que te hace brillar cuando todos miran.", author: "Anónimo", category: "disciplina" },
        { text: "La consistencia supera a la intensidad ocasional.", author: "Anónimo", category: "disciplina" },
        { text: "Construye hábitos tan fuertes que te costaría más romperlos que seguirlos.", author: "Anónimo", category: "disciplina" },
        { text: "La verdadera libertad viene de la disciplina, no de la falta de restricciones.", author: "Anónimo", category: "disciplina" },
        { text: "No hay excusas. Solo decisiones.", author: "Anónimo", category: "disciplina" },
        { text: "El entrenamiento duro se paga con victorias fáciles.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina es el arte de hacer lo correcto en el momento correcto.", author: "Anónimo", category: "disciplina" },

        // Categoría: Fracaso y Resiliencia (21-40)
        { text: "No importa cuántas veces caigas, lo que importa es cuántas veces te levantes.", author: "Vince Lombardi", category: "resiliencia" },
        { text: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.", author: "Winston Churchill", category: "resiliencia" },
        { text: "Cuando crees que todo está perdido, sigue adelante.", author: "Anónimo", category: "resiliencia" },
        { text: "El fracaso no es el fin, es solo el comienzo de algo mejor.", author: "Anónimo", category: "resiliencia" },
        { text: "Los golpes te hacen más fuerte, no más débil.", author: "Anónimo", category: "resiliencia" },
        { text: "Cada derrota es una lección disfrazada.", author: "Anónimo", category: "resiliencia" },
        { text: "No temas al fracaso, teme no haberlo intentado.", author: "Anónimo", category: "resiliencia" },
        { text: "El que quiereجناح debe estar dispuesto a caer primero.", author: "Anónimo", category: "resiliencia" },
        { text: "Las cicatrices son prueba de que sanaste y seguiste adelante.", author: "Anónimo", category: "resiliencia" },
        { text: "No me rendí cuando me dijeron que no podía. Me levanté cuando me derribaron.", author: "Anónimo", category: "resiliencia" },
        { text: "El suelo más bajo puede ser el mejor trampolín.", author: "Anónimo", category: "resiliencia" },
        { text: "La resiliencia es la habilidad de adaptarse a situaciones difíciles.", author: "Anónimo", category: "resiliencia" },
        { text: "Caer es humano, levantarse es legendario.", author: "Anónimo", category: "resiliencia" },
        { text: "Los giants más grandes fueron alguna vez gotas.", author: "Anónimo", category: "resiliencia" },
        { text: "Tu mayor glory no está en no caer, sino en levantarte cada vez que caes.", author: "Confucio", category: "resiliencia" },
        { text: "El fracaso es solo una oportunidad para comenzar de nuevo con más inteligencia.", author: "Henry Ford", category: "resiliencia" },
        { text: "No dejes que tus caídas te definan, deja que te refine.", author: "Anónimo", category: "resiliencia" },
        { text: "La oscuridad no dura para siempre. El amanecer siempre llega.", author: "Anónimo", category: "resiliencia" },
        { text: "Lo que no te mata, te fortalece.", author: "Friedrich Nietzsche", category: "resiliencia" },
        { text: "Los obstáculos en tu camino son los escalones hacia tu éxito.", author: "Anónimo", category: "resiliencia" },

        // Categoría: Mente y Pensamiento (41-60)
        { text: "El límite lo pone tu mente.", author: "Anónimo", category: "mente" },
        { text: "La mente es todo. Lo que piensas, te conviertes.", author: "Buda", category: "mente" },
        { text: "No tengo miedo a los hombres que dan 1000 golpes, tengo miedo del que da uno 1000 veces.", author: "Bruce Lee", category: "mente" },
        { text: "Tu mente es tu arma más poderosa. Mantenla afilada.", author: "Anónimo", category: "mente" },
        { text: "Los pensamientos positivos generan energía positiva.", author: "Anónimo", category: "mente" },
        { text: "La actitud determina la altitud.", author: "Anónimo", category: "mente" },
        { text: "Lo que la mente puede concebir, la mente puede lograr.", author: "Napoleon Hill", category: "mente" },
        { text: "Controla tu mente o ella te controlará a ti.", author: "Anónimo", category: "mente" },
        { text: "La paz viene de dentro de ti. No la busques fuera.", author: "Buda", category: "mente" },
        { text: "No permitas que el ruido de las opiniones de otros ahogue tu voz interior.", author: "Steve Jobs", category: "mente" },
        { text: "La mente que se abre a una nueva idea nunca vuelve a su tamaño original.", author: "Albert Einstein", category: "mente" },
        { text: "Tus creencias limitantes son solo pensamientos, no hechos.", author: "Anónimo", category: "mente" },
        { text: "El éxito comienza en la mente.", author: "Anónimo", category: "mente" },
        { text: "La visualización es la prerrequisición de la manifestación.", author: "Anónimo", category: "mente" },
        { text: "Tu mente es tu jardín. Cultiva pensamientos positivos.", author: "Anónimo", category: "mente" },
        { text: "Elimina las dudas de tu mente y pondrás alas a tus pies.", author: "Anónimo", category: "mente" },
        { text: "La claridad mental viene de saber qué quieres.", author: "Anónimo", category: "mente" },
        { text: "Una mente tranquila es un arma poderosa.", author: "Anónimo", category: "mente" },
        { text: "Los pensamientos de grandeza producen acciones de grandeza.", author: "Anónimo", category: "mente" },
        { text: "La fuerza mental supera a la fuerza física.", author: "Anónimo", category: "mente" },

        // Categoría: Acción y Esfuerzo (61-80)
        { text: "La acción es la puente fundamental entre tus sueños y tu realidad.", author: "Anónimo", category: "accion" },
        { text: "El que no arriesga no cruza el río.", author: "Anónimo", category: "accion" },
        { text: "No esperes el momento perfecto, crea el momento perfecto.", author: "Anónimo", category: "accion" },
        { text: "El到位 no existe. Solo la acción.", author: "Anónimo", category: "accion" },
        { text: "Un paso adelante cada día, sin importar cuán pequeño.", author: "Anónimo", category: "accion" },
        { text: "La inacción es el mayores enemigo del éxito.", author: "Anónimo", category: "accion" },
        { text: "Hazlo ahora o nunca lo harás.", author: "Anónimo", category: "accion" },
        { text: "Los sueños no se logran esperando, se logran actuando.", author: "Anónimo", category: "accion" },
        { text: "El que mueve montañas comienza quitando piedras.", author: "Anónimo", category: "accion" },
        { text: "La preparación se encuentra con la oportunidad en el momento de la acción.", author: "Anónimo", category: "accion" },
        { text: "No te quedes mirando la escalera. Empieza a subir.", author: "Anónimo", category: "accion" },
        { text: "El esfuerzo de hoy es el éxito de mañana.", author: "Anónimo", category: "accion" },
        { text: "El trabajo duro siempre supera al talento cuando el talento no trabaja duro.", author: "Anónimo", category: "accion" },
        { text: "Sin sudor no hay gloria.", author: "Anónimo", category: "accion" },
        { text: "El trabajo duro supera al talento natural.", author: "Anónimo", category: "accion" },
        { text: "La excelencia es un proceso, no un evento.", author: "Anónimo", category: "accion" },
        { text: "Haz que cada día cuente.", author: "Anónimo", category: "accion" },
        { text: "La persistencia es el camino del éxito.", author: "Anónimo", category: "accion" },
        { text: "Cada esfuerzo es un paso hacia adelante.", author: "Anónimo", category: "accion" },
        { text: "No sueñes tu vida, vive tu sueño.", author: "Anónimo", category: "accion" },

        // Categoría: Tiempo y Perspectiva (81-100)
        { text: "El tiempo es el recurso más valioso que tienes.", author: "Anónimo", category: "tiempo" },
        { text: "No postergues para mañana lo que puedes hacer hoy.", author: "Benjamin Franklin", category: "tiempo" },
        { text: "Cada día es una oportunidad de ser mejor que ayer.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo cura todas las heridas, pero también revela la verdad.", author: "Anónimo", category: "tiempo" },
        { text: "Invierte en tu futuro ahora.", author: "Anónimo", category: "tiempo" },
        { text: "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor es ahora.", author: "Anónimo", category: "tiempo" },
        { text: "Tu tiempo es limitado, no lo desperdiciés viviendo la vida de otros.", author: "Steve Jobs", category: "tiempo" },
        { text: "Ayer es historia, mañana es un misterio, hoy es un regalo.", author: "Anónimo", category: "tiempo" },
        { text: "El presente es todo lo que tenemos.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo no espera a nadie.", author: "Anónimo", category: "tiempo" },
        { text: "Cada segundo cuenta en la vida.", author: "Anónimo", category: "tiempo" },
        { text: "La puntualidad es el respeto al tiempo propio y ajeno.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo bien invertido es dinero ganado.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo pasado no se recupera.", author: "Anónimo", category: "tiempo" },
        { text: "Aprovéchalo al máximo hoy.", author: "Anónimo", category: "tiempo" },
        { text: "El mañana no está garantizado.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo vuela, aprovéchalo.", author: "Anónimo", category: "tiempo" },
        { text: "Cada momento es una oportunidad de cambiar.", author: "Anónimo", category: "tiempo" },
        { text: "La vida es demasiado corta para esperar.", author: "Anónimo", category: "tiempo" },
        { text: "Carpe Diem. Aprovecha el día.", author: "Anónimo", category: "tiempo" },

        // Categoría: Éxito y Logros (101-120)
        { text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", author: "Albert Schweitzer", category: "exito" },
        { text: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.", author: "Winston Churchill", category: "exito" },
        { text: "No tienes que ser great para empezar, pero tienes que empezar para ser great.", author: "Zig Ziglar", category: "exito" },
        { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier", category: "exito" },
        { text: "La excelencia no es un acto, sino un hábito.", author: "Aristóteles", category: "exito" },
        { text: "El éxito pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt", category: "exito" },
        { text: "No hay atajos para lugares que vale la pena visitar.", author: "Anónimo", category: "exito" },
        { text: "El éxito no se mide por lo que logras, sino por los obstáculos que superas.", author: "Anónimo", category: "exito" },
        { text: "Tu único límite es tu mente.", author: "Anónimo", category: "exito" },
        { text: "El éxito es un viaje, no un destino.", author: "Anónimo", category: "exito" },
        { text: "Cree en ti mismo y todo será posible.", author: "Anónimo", category: "exito" },
        { text: "El éxito deja pistas. Sigue las tuyas.", author: "Anónimo", category: "exito" },
        { text: "Los winners no se rinden, y los que se rinden no ganan.", author: "Anónimo", category: "exito" },
        { text: "El verdadero éxito es vivir la vida a tu manera.", author: "Anónimo", category: "exito" },
        { text: "El éxito viene de la perseverancia.", author: "Anónimo", category: "exito" },
        { text: "El éxito no es final, el fracaso no es fatal.", author: "Winston Churchill", category: "exito" },
        { text: "Lo que cuenta no es el número de veces que caes, sino las veces que te levantas.", author: "Anónimo", category: "exito" },
        { text: "El éxito es la consecuencia de la acción consistente.", author: "Anónimo", category: "exito" },
        { text: "El éxito se mide por cuánto te has superado a ti mismo.", author: "Anónimo", category: "exito" },
        { text: "El mayor éxito es ser capaz de levantarte después de cada caída.", author: "Anónimo", category: "exito" },

        // Categoría: Boxeo y Combate (121-130)
        { text: "El boxeo es como el jazz. Cuanto mejor eres, más simple se vuelve.", author: "Willie Pep", category: "boxeo" },
        { text: "La única manera de demostrar que tienes razón es seguir luchando.", author: "Mike Tyson", category: "boxeo" },
        { text: "Boxear es la poesía del movimiento.", author: "Anónimo", category: "boxeo" },
        { text: "En el ring solo estás tú y tu mente.", author: "Anónimo", category: "boxeo" },
        { text: "El boxeo te enseña que puedes ser golpeado y seguir de pie.", author: "Anónimo", category: "boxeo" },
        { text: "Cada round es una oportunidad de empezar de nuevo.", author: "Anónimo", category: "boxeo" },
        { text: "En el combate, la preparación mental supera a la física.", author: "Anónimo", category: "boxeo" },
        { text: "El boxeo es la metáfora perfecta de la vida.", author: "Anónimo", category: "boxeo" },
        { text: " duck. No puedes golpear lo que no puedes ver.", author: "Muhammad Ali", category: "boxeo" },
        { text: "Flota como una mariposa, pica como una abeja.", author: "Muhammad Ali", category: "boxeo" }
    ];

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const quote = quotes[dayOfYear % quotes.length];

    const quoteEl = document.getElementById('daily-quote');
    const authorEl = document.getElementById('quote-author');

    if (quoteEl) quoteEl.textContent = `"${quote.text}"`;
    if (authorEl) authorEl.textContent = `- ${quote.author}`;
}

// Sistema de Tarjetas de Sabiduría Interactivas
let wisdomCardIndex = 0;
let currentCategory = null;

function getFilteredQuotes(category) {
    const quotes = window.motivationalQuotes || [];
    if (!category || category === 'all') return quotes;
    return quotes.filter(q => q.category === category);
}

function displayWisdomCard(category = null) {
    const card = document.getElementById('wisdom-card');
    const cardContent = document.getElementById('wisdom-card-content');
    const cardAuthor = document.getElementById('wisdom-card-author');
    const categoryBadges = document.getElementById('wisdom-category-badges');

    if (!card || !cardContent) return;

    const filteredQuotes = getFilteredQuotes(category);
    const quotes = filteredQuotes.length > 0 ? filteredQuotes : window.motivationalQuotes || [];

    if (quotes.length === 0) return;

    const quote = quotes[wisdomCardIndex % quotes.length];

    cardContent.textContent = `"${quote.text}"`;
    cardAuthor.textContent = `- ${quote.author}`;

    // Animación de entrada
    card.style.animation = 'none';
    card.offsetHeight; // Trigger reflow
    card.style.animation = 'cardSlideIn 0.5s ease-out';

    // Actualizar badges activos
    if (categoryBadges) {
        categoryBadges.querySelectorAll('.category-badge').forEach(badge => {
            badge.classList.toggle('active', badge.dataset.category === category);
        });
    }

    wisdomCardIndex++;
}

function dismissWisdomCard(direction = 'right') {
    const card = document.getElementById('wisdom-card');
    if (!card) return;

    card.style.animation = direction === 'left' ? 'cardSwipeLeft 0.3s ease-out' : 'cardSwipeRight 0.3s ease-out';

    setTimeout(() => {
        displayWisdomCard(currentCategory);
    }, 300);
}

function setupWisdomSystem() {
    // Guardar quotes globalmente para uso del sistema
    window.motivationalQuotes = [];

    // Llenar las quotes desde la función loadDailyQuote
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const quotes = [
        { text: "El boxeo es como el jazz. Cuanto mejor eres, más simple se vuelve.", author: "Willie Pep", category: "boxeo" },
        { text: "No importa cuántas veces caigas, lo que importa es cuántas veces te levantes.", author: "Vince Lombardi", category: "resiliencia" },
        { text: "La única manera de demostrar que tienes razón es seguir luchando.", author: "Mike Tyson", category: "boxeo" },
        { text: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.", author: "Winston Churchill", category: "exito" },
        { text: "No tengo miedo a los hombres que dan 1000 golpes, tengo miedo del que da uno 1000 veces.", author: "Bruce Lee", category: "mente" },
        { text: "La disciplina es hacer lo que tienes que hacer, incluso cuando no quieres hacerlo.", author: "Anónimo", category: "disciplina" },
        { text: "El dolor es temporal. El orgullo es para siempre.", author: "Anónimo", category: "accion" },
        { text: "Cuando crees que todo está perdido, sigue adelante.", author: "Anónimo", category: "resiliencia" },
        { text: "Cada día es una oportunidad de ser mejor que ayer.", author: "Anónimo", category: "tiempo" },
        { text: "La excelencia no es un acto, sino un hábito.", author: "Aristóteles", category: "exito" },
        { text: "El límite lo pone tu mente.", author: "Anónimo", category: "mente" },
        { text: "La disciplina es hacer lo que tienes que hacer, incluso cuando no quieres hacerlo.", author: "Anónimo", category: "disciplina" },
        { text: "El hábito es el cable que tejen día a día, y al final no puedes romperlo.", author: "Anónimo", category: "disciplina" },
        { text: "No hay atajos hacia el lugar donde vas. Todos los caminos pasan por la disciplina.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina pesa gramos, pero las consecuencias pesan toneladas.", author: "Anónimo", category: "disciplina" },
        { text: "Disciplina es elegir entre lo que quieres ahora y lo que quieres después.", author: "Anónimo", category: "disciplina" },
        { text: "Los hábitos exitosos son la respuesta a una vida exitosa.", author: "Anónimo", category: "disciplina" },
        { text: "La motivación te inicia, la disciplina te mantiene.", author: "Anónimo", category: "disciplina" },
        { text: "Pequeños pasos, consistentes, todos los días. Eso es la disciplina.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina aplicada constantemente supera al talento natural.", author: "Anónimo", category: "disciplina" },
        { text: "El éxito es 10% inspiración y 90% transpiración, es decir, disciplina.", author: "Anónimo", category: "disciplina" },
        { text: "Cada día que no entrenas, alguien más lo está haciendo.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina es el bridge entre metas y logros.", author: "Anónimo", category: "disciplina" },
        { text: " Entrenar cuando nadie mira es lo que te hace brillar cuando todos miran.", author: "Anónimo", category: "disciplina" },
        { text: "La consistencia supera a la intensidad ocasional.", author: "Anónimo", category: "disciplina" },
        { text: "Construye hábitos tan fuertes que te costaría más romperlos que seguirlos.", author: "Anónimo", category: "disciplina" },
        { text: "La verdadera libertad viene de la disciplina, no de la falta de restricciones.", author: "Anónimo", category: "disciplina" },
        { text: "No hay excusas. Solo decisiones.", author: "Anónimo", category: "disciplina" },
        { text: "El entrenamiento duro se paga con victorias fáciles.", author: "Anónimo", category: "disciplina" },
        { text: "La disciplina es el arte de hacer lo correcto en el momento correcto.", author: "Anónimo", category: "disciplina" },
        { text: "El fracaso no es el fin, es solo el comienzo de algo mejor.", author: "Anónimo", category: "resiliencia" },
        { text: "Los golpes te hacen más fuerte, no más débil.", author: "Anónimo", category: "resiliencia" },
        { text: "Cada derrota es una lección disfrazada.", author: "Anónimo", category: "resiliencia" },
        { text: "No temas al fracaso, teme no haberlo intentado.", author: "Anónimo", category: "resiliencia" },
        { text: "El que quiere alas debe estar dispuesto a caer primero.", author: "Anónimo", category: "resiliencia" },
        { text: "Las cicatrices son prueba de que sanaste y seguiste adelante.", author: "Anónimo", category: "resiliencia" },
        { text: "No me rendí cuando me dijeron que no podía. Me levanté cuando me derribaron.", author: "Anónimo", category: "resiliencia" },
        { text: "El suelo más bajo puede ser el mejor trampolín.", author: "Anónimo", category: "resiliencia" },
        { text: "La resiliencia es la habilidad de adaptarse a situaciones difíciles.", author: "Anónimo", category: "resiliencia" },
        { text: "Caer es humano, levantarse es legendario.", author: "Anónimo", category: "resiliencia" },
        { text: "Los gigantes más fuertes fueron alguna vez gotas.", author: "Anónimo", category: "resiliencia" },
        { text: "Tu mayor gloria no está en no caer, sino en levantarte cada vez que caes.", author: "Confucio", category: "resiliencia" },
        { text: "El fracaso es solo una oportunidad para comenzar de nuevo con más inteligencia.", author: "Henry Ford", category: "resiliencia" },
        { text: "No dejes que tus caídas te definan, deja que te refine.", author: "Anónimo", category: "resiliencia" },
        { text: "La oscuridad no dura para siempre. El amanecer siempre llega.", author: "Anónimo", category: "resiliencia" },
        { text: "Lo que no te mata, te fortalece.", author: "Friedrich Nietzsche", category: "resiliencia" },
        { text: "Los obstáculos en tu camino son los escalones hacia tu éxito.", author: "Anónimo", category: "resiliencia" },
        { text: "La mente es todo. Lo que piensas, te conviertes.", author: "Buda", category: "mente" },
        { text: "Tu mente es tu arma más poderosa. Mantenla afilada.", author: "Anónimo", category: "mente" },
        { text: "Los pensamientos positivos generan energía positiva.", author: "Anónimo", category: "mente" },
        { text: "La actitud determina la altitud.", author: "Anónimo", category: "mente" },
        { text: "Lo que la mente puede concebir, la mente puede lograr.", author: "Napoleon Hill", category: "mente" },
        { text: "Controla tu mente o ella te controlará a ti.", author: "Anónimo", category: "mente" },
        { text: "La paz viene de dentro de ti. No la busques fuera.", author: "Buda", category: "mente" },
        { text: "No permitas que el ruido de las opiniones de otros ahogue tu voz interior.", author: "Steve Jobs", category: "mente" },
        { text: "La mente que se abre a una nueva idea nunca vuelve a su tamaño original.", author: "Albert Einstein", category: "mente" },
        { text: "Tus creencias limitantes son solo pensamientos, no hechos.", author: "Anónimo", category: "mente" },
        { text: "El éxito comienza en la mente.", author: "Anónimo", category: "mente" },
        { text: "La visualización es la prerrequisición de la manifestación.", author: "Anónimo", category: "mente" },
        { text: "Tu mente es tu jardín. Cultiva pensamientos positivos.", author: "Anónimo", category: "mente" },
        { text: "Elimina las dudas de tu mente y pondrás alas a tus pies.", author: "Anónimo", category: "mente" },
        { text: "La claridad mental viene de saber qué quieres.", author: "Anónimo", category: "mente" },
        { text: "Una mente tranquila es un arma poderosa.", author: "Anónimo", category: "mente" },
        { text: "Los pensamientos de grandeza producen acciones de grandeza.", author: "Anónimo", category: "mente" },
        { text: "La fuerza mental supera a la fuerza física.", author: "Anónimo", category: "mente" },
        { text: "La acción es la bridge fundamental entre tus sueños y tu realidad.", author: "Anónimo", category: "accion" },
        { text: "El que no arriesga no cruza el río.", author: "Anónimo", category: "accion" },
        { text: "No esperes el momento perfecto, crea el momento perfecto.", author: "Anónimo", category: "accion" },
        { text: "El到位 no existe. Solo la acción.", author: "Anónimo", category: "accion" },
        { text: "Un paso adelante cada día, sin importar cuán pequeño.", author: "Anónimo", category: "accion" },
        { text: "La inacción es el mayores enemigo del éxito.", author: "Anónimo", category: "accion" },
        { text: "Hazlo ahora o nunca lo harás.", author: "Anónimo", category: "accion" },
        { text: "Los sueños no se logran esperando, se logran actuando.", author: "Anónimo", category: "accion" },
        { text: "El que mueve montañas comienza quitando piedras.", author: "Anónimo", category: "accion" },
        { text: "La preparación se encuentra con la oportunidad en el momento de la acción.", author: "Anónimo", category: "accion" },
        { text: "No te quedes mirando la escalera. Empieza a subir.", author: "Anónimo", category: "accion" },
        { text: "El esfuerzo de hoy es el éxito de mañana.", author: "Anónimo", category: "accion" },
        { text: "El trabajo duro siempre supera al talento cuando el talento no trabaja duro.", author: "Anónimo", category: "accion" },
        { text: "Sin sudor no hay gloria.", author: "Anónimo", category: "accion" },
        { text: "El trabajo duro supera al talento natural.", author: "Anónimo", category: "accion" },
        { text: "La excelencia es un proceso, no un evento.", author: "Anónimo", category: "accion" },
        { text: "Haz que cada día cuente.", author: "Anónimo", category: "accion" },
        { text: "La persistencia es el camino del éxito.", author: "Anónimo", category: "accion" },
        { text: "Cada esfuerzo es un paso hacia adelante.", author: "Anónimo", category: "accion" },
        { text: "No sueñes tu vida, vive tu sueño.", author: "Anónimo", category: "accion" },
        { text: "El tiempo es el recurso más valioso que tienes.", author: "Anónimo", category: "tiempo" },
        { text: "No postergues para mañana lo que puedes hacer hoy.", author: "Benjamin Franklin", category: "tiempo" },
        { text: "El tiempo cura todas las heridas, pero también revela la verdad.", author: "Anónimo", category: "tiempo" },
        { text: "Invierte en tu futuro ahora.", author: "Anónimo", category: "tiempo" },
        { text: "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor es ahora.", author: "Anónimo", category: "tiempo" },
        { text: "Tu tiempo es limitado, no lo desperdicies viviendo la vida de otros.", author: "Steve Jobs", category: "tiempo" },
        { text: "Ayer es historia, mañana es un misterio, hoy es un regalo.", author: "Anónimo", category: "tiempo" },
        { text: "El presente es todo lo que tenemos.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo no espera a nadie.", author: "Anónimo", category: "tiempo" },
        { text: "Cada segundo cuenta en la vida.", author: "Anónimo", category: "tiempo" },
        { text: "La puntualidad es el respeto al tiempo propio y ajeno.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo bien invertido es dinero ganado.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo pasado no se recupera.", author: "Anónimo", category: "tiempo" },
        { text: "Aprovéchalo al máximo hoy.", author: "Anónimo", category: "tiempo" },
        { text: "El mañana no está garantizado.", author: "Anónimo", category: "tiempo" },
        { text: "El tiempo vuela, aprovéchalo.", author: "Anónimo", category: "tiempo" },
        { text: "Cada momento es una oportunidad de cambiar.", author: "Anónimo", category: "tiempo" },
        { text: "La vida es demasiado corta para esperar.", author: "Anónimo", category: "tiempo" },
        { text: "Carpe Diem. Aprovecha el día.", author: "Anónimo", category: "tiempo" },
        { text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", author: "Albert Schweitzer", category: "exito" },
        { text: "No tienes que ser great para empezar, pero tienes que empezar para ser great.", author: "Zig Ziglar", category: "exito" },
        { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier", category: "exito" },
        { text: "El éxito pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt", category: "exito" },
        { text: "No hay atajos para lugares que vale la pena visitar.", author: "Anónimo", category: "exito" },
        { text: "El éxito no se mide por lo que logras, sino por los obstáculos que superas.", author: "Anónimo", category: "exito" },
        { text: "Tu único límite es tu mente.", author: "Anónimo", category: "exito" },
        { text: "El éxito es un viaje, no un destino.", author: "Anónimo", category: "exito" },
        { text: "Cree en ti mismo y todo será posible.", author: "Anónimo", category: "exito" },
        { text: "El éxito deja pistas. Sigue las tuyas.", author: "Anónimo", category: "exito" },
        { text: "Los winners no se rinden, y los que se rinden no ganan.", author: "Anónimo", category: "exito" },
        { text: "El verdadero éxito es vivir la vida a tu manera.", author: "Anónimo", category: "exito" },
        { text: "El éxito viene de la perseverancia.", author: "Anónimo", category: "exito" },
        { text: "El éxito no es final, el fracaso no es fatal.", author: "Winston Churchill", category: "exito" },
        { text: "Lo que cuenta no es el número de veces que caes, sino las veces que te levantas.", author: "Anónimo", category: "exito" },
        { text: "El éxito es la consecuencia de la acción consistente.", author: "Anónimo", category: "exito" },
        { text: "El éxito se mide por cuánto te has superado a ti mismo.", author: "Anónimo", category: "exito" },
        { text: "El mayor éxito es ser capaz de levantarte después de cada caída.", author: "Anónimo", category: "exito" },
        { text: "Boxear es la poesía del movimiento.", author: "Anónimo", category: "boxeo" },
        { text: "En el ring solo estás tú y tu mente.", author: "Anónimo", category: "boxeo" },
        { text: "El boxeo te enseña que puedes ser golpeado y seguir de pie.", author: "Anónimo", category: "boxeo" },
        { text: "Cada round es una oportunidad de empezar de nuevo.", author: "Anónimo", category: "boxeo" },
        { text: "En el combate, la preparación mental supera a la física.", author: "Anónimo", category: "boxeo" },
        { text: "El boxeo es la metáfora perfecta de la vida.", author: "Anónimo", category: "boxeo" },
        { text: " duck. No puedes golpear lo que no puedes ver.", author: "Muhammad Ali", category: "boxeo" },
        { text: "Flota como una mariposa, pica como una abeja.", author: "Muhammad Ali", category: "boxeo" }
    ];

    window.motivationalQuotes = quotes;

    // Configurar botones de sabiduría
    document.getElementById('wisdom-next')?.addEventListener('click', () => dismissWisdomCard('right'));
    document.getElementById('wisdom-prev')?.addEventListener('click', () => dismissWisdomCard('left'));
    document.getElementById('wisdom-dismiss')?.addEventListener('click', () => {
        const card = document.getElementById('wisdom-card');
        if (card) {
            card.classList.add('hidden');
        }
    });

    // Configurar badges de categoría
    document.querySelectorAll('.category-badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            currentCategory = badge.dataset.category === 'all' ? null : badge.dataset.category;
            wisdomCardIndex = 0;
            displayWisdomCard(currentCategory);
        });
    });

    // Mostrar primera tarjeta
    displayWisdomCard();
}

// Función para mostrar la tarjeta de sabiduría desde cualquier lugar
window.openWisdomPanel = function(category = null) {
    const overlay = document.getElementById('wisdom-overlay');
    const card = document.getElementById('wisdom-card');
    if (overlay && card) {
        overlay.classList.remove('hidden');
        wisdomCardIndex = 0;
        displayWisdomCard(category);
    }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

/**
 * Oculta el loader de forma segura con múltiples mecanismos de respaldo
 * para evitar el bug del desenfoque persistente
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    // Usar solo la clase hidden directamente para compatibilidad con tests
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
    loader.style.visibility = 'hidden';
    loader.style.pointerEvents = 'none';
    
    // Marcar como oculto
    loader.classList.add('hidden');
    
    // Liberar recursos del loader después de la transición
    setTimeout(() => {
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }, 600);
}

/**
 * Configura el video de fondo con manejo de errores
 */
function setupBackgroundVideo() {
    const video = document.getElementById('bg-video');
    const overlay = document.querySelector('.video-overlay');
    
    if (!video) return;
    
    // Handle video loading errors gracefully
    video.addEventListener('error', () => {
        console.log('Video de fondo no disponible, usando gradiente de respaldo');
        // Create a beautiful gradient background instead
        if (overlay) {
            overlay.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        }
        // Hide the video element
        video.style.display = 'none';
    });
    
    // Ensure video plays when ready
    video.addEventListener('canplay', () => {
        video.play().catch(() => {
            // If autoplay fails, use gradient fallback
            if (overlay) {
                overlay.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
            }
        });
    });
    
    // If video is already loaded and playing, add subtle animation to overlay
    if (overlay) {
        let brightness = 30;
        overlay.dataset.brightness = brightness;
    }
}

/**
 * Configura el audio del temporizador silenciosamente
 */
function setupAudio() {
    const audio = document.getElementById('timer-sound');
    if (audio) {
        // Sobrescribir console.error en el contexto de la página para filtrar errores de audio
        const originalPageError = window.console.error;
        window.console.error = function(...args) {
            const message = args.join(' ');
            // Filtrar errores de recursos de audio faltantes
            if (message.includes('Failed to load resource') &&
                (message.includes('net::ERR_FILE_NOT_FOUND') || message.includes('net::ERR_REQUEST_RANGE_NOT_SATISFIABLE'))) {
                return; // Silenciar errores de recursos faltantes
            }
            return originalPageError.apply(window.console, args);
        };

        // Marcar audio como faltante cuando falla
        audio.addEventListener('error', () => {
            audio.dataset.missing = 'true';
        });
    }
}

/**
 * Inicialización principal con manejo robusto de errores
 */
function init() {
    console.log('Inicializando Mentalidad de Combate 3.0...');
    
    try {
        // Cargar datos guardados
        loadData();
        
        // Configurar video de fondo
        setupBackgroundVideo();

        // Configurar audio silenciosamente
        setupAudio();

        // Configurar sistema de sabiduría interactivo
        setupWisdomSystem();

        // Event listeners para el sistema de sabiduría
        document.getElementById('wisdom-fab')?.addEventListener('click', () => {
            document.getElementById('wisdom-overlay')?.classList.remove('hidden');
        });

        document.getElementById('wisdom-close')?.addEventListener('click', () => {
            document.getElementById('wisdom-overlay')?.classList.add('hidden');
        });

        document.getElementById('wisdom-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'wisdom-overlay') {
                document.getElementById('wisdom-overlay')?.classList.add('hidden');
            }
        });

        // Ocultar loader inmediatamente si el DOM está listo, o esperar
        const tryHideLoader = () => {
            const loader = document.getElementById('loader');
            if (loader && !loader.classList.contains('hidden')) {
                // Pequeño delay para permitir que se vea el loader
                setTimeout(hideLoader, 500);
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryHideLoader);
        } else {
            tryHideLoader();
        }
        
        // Mecanismo de respaldo: forzar ocultamiento del loader después de 2.5 segundos
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader && !loader.classList.contains('hidden')) {
                console.warn('Loader fallback activado');
                hideLoader();
            }
        }, 2500);
        
        // Inicializar sistemas
        timer = new CombatTimer();
        challenges = new ChallengeSystem();
        statistics = new StatisticsSystem();
        
        // Configurar interfaz
        setupNavigation();
        setupSettings();
        setupModals();
        loadDailyQuote();
        updateAllUI();
        
        // Registrar service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {
                console.log('Service Worker no disponible');
            });
        }
        
        console.log('¡Listo para entrenar!');
    } catch (error) {
        console.error('Error durante inicialización:', error);
        // Asegurar que el loader se oculte incluso si hay errores
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

// Start app
init();
