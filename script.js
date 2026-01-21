class UnityCertSimulator {
    constructor() {
        this.currentTest = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testStartTime = null;
        this.timerInterval = null;
        this.testCompleted = false;
        this.currentCert = '';
        this.currentMode = '';
        this.testTimeLimit = 90 * 60;
        this.timeRemaining = this.testTimeLimit;
        this.questionCount = 40;
        this.questionsPerTest = 40;
        this.showImmediateFeedback = false;
        this.testHistory = this.loadTestHistory();
        this.userStats = this.loadUserStats();
        this.questionBanks = {
            programmer: [],
            artist: []
        };
        
        this.initElements();
        this.initEventListeners();
        this.initTheme();
        this.loadQuestionBanks().then(() => {
            this.showMainMenu();
        });
    }
    
    shuffleQuestions(questions) {
        return questions.map(question => {
            const optionsWithIndex = question.options.map((text, index) => ({
                text,
                originalIndex: index
            }));
            
            for (let i = optionsWithIndex.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
            }
            
            const shuffledOptions = optionsWithIndex.map(item => item.text);
            
            const newCorrectAnswer = optionsWithIndex.findIndex(
                item => item.originalIndex === question.correctAnswer
            );
            
            return {
                ...question,
                options: shuffledOptions,
                correctAnswer: newCorrectAnswer
            };
        });
    }
    
    async loadQuestionBanks() {
        try {
            const programmerResponse = await fetch('questions_programmer.json');
            if (programmerResponse.ok) {
                const programmerData = await programmerResponse.json();
                this.questionBanks.programmer = this.shuffleQuestions(programmerData);
            } else {
                console.error('Error al cargar questions_programmer.json:', programmerResponse.status);
            }
            
            const artistResponse = await fetch('questions_artist.json');
            if (artistResponse.ok) {
                const artistData = await artistResponse.json();
                this.questionBanks.artist = this.shuffleQuestions(artistData);
            } else {
                console.error('Error al cargar questions_artist.json:', artistResponse.status);
            }
            
            if (this.questionBanks.programmer.length === 0) {
                this.createFallbackQuestions('programmer');
            }
            
            if (this.questionBanks.artist.length === 0) {
                this.createFallbackQuestions('artist');
            }
            
        } catch (error) {
            console.error('Error cargando las preguntas:', error);
            this.createFallbackQuestions('programmer');
            this.createFallbackQuestions('artist');
        }
    }
    
    createFallbackQuestions(cert) {
        const questions = [];
        const questionTypes = {
            programmer: [
                "¿Cuál es el propósito del método Start() en Unity?",
                "¿Cómo se accede al componente Transform de un GameObject?",
                "¿Qué hace la instrucción 'Instantiate' en Unity?",
                "¿Cuál es la diferencia entre Update() y FixedUpdate()?",
                "¿Cómo se detecta una colisión en Unity?",
                "¿Qué es un prefab en Unity?",
                "¿Cómo se cambia la posición de un GameObject?",
                "¿Qué hace la función Vector3.Lerp()?",
                "¿Cómo se crea una corrutina en Unity?",
                "¿Qué es un ScriptableObject?"
            ],
            artist: [
                "¿Qué es el PBR (Physically Based Rendering)?",
                "¿Cómo se optimizan las texturas para móviles?",
                "¿Qué es el UV mapping?",
                "¿Cómo funciona el sistema de materiales en Unity?",
                "¿Qué es el baking de luces?",
                "¿Cómo se crea un shader personalizado?",
                "¿Qué es LOD (Level of Detail)?",
                "¿Cómo se importa un modelo 3D a Unity?",
                "¿Qué es la compresión de texturas?",
                "¿Cómo se crean partículas en el sistema VFX?"
            ]
        };
        
        questionTypes[cert].forEach((question, index) => {
            questions.push({
                id: index + 1,
                question: question,
                options: [
                    "Respuesta correcta (ejemplo)",
                    "Respuesta incorrecta (ejemplo)",
                    "Respuesta incorrecta (ejemplo)",
                    "Respuesta incorrecta (ejemplo)"
                ],
                correctAnswer: 0,
                explanation: "Explicación de ejemplo para la pregunta.",
                category: "General",
                difficulty: "Media"
            });
        });
        
        this.questionBanks[cert] = questions;
    }
    
    initElements() {
        this.elements = {
            mainMenu: document.getElementById('main-menu'),
            certSelection: document.getElementById('cert-selection'),
            modeSelection: document.getElementById('mode-selection'),
            testConfig: document.getElementById('test-config'),
            appContainer: document.getElementById('app-container'),
            resultsPanel: document.getElementById('results-panel'),
            statsPanel: document.getElementById('stats-panel'),
            startTestOption: document.getElementById('start-test-option'),
            viewStatsOption: document.getElementById('view-stats-option'),
            programmerCert: document.getElementById('programmer-cert'),
            artistCert: document.getElementById('artist-cert'),
            practiceMode: document.getElementById('practice-mode'),
            examMode: document.getElementById('exam-mode'),
            backToMainBtn: document.getElementById('back-to-main-btn'),
            backToCertBtn: document.getElementById('back-to-cert-btn'),
            backToModeBtn: document.getElementById('back-to-mode-btn'),
            backToMainFromStats: document.getElementById('back-to-main-from-stats'),
            backToMainFromResultsBtn: document.getElementById('back-to-main-from-results-btn'),
            themeToggle: document.getElementById('theme-toggle'),
            configTitle: document.getElementById('config-title'),
            practiceConfig: document.getElementById('practice-config'),
            examConfig: document.getElementById('exam-config'),
            practice20: document.getElementById('practice-20'),
            practice40: document.getElementById('practice-40'),
            startTestBtn: document.getElementById('start-test-btn'),
            questionContainer: document.getElementById('question-container'),
            currentQuestion: document.getElementById('current-question'),
            totalQuestions: document.getElementById('total-questions'),
            progressFill: document.getElementById('progress-fill'),
            progressPercent: document.getElementById('progress-percent'),
            correctCount: document.getElementById('correct-count'),
            incorrectCount: document.getElementById('incorrect-count'),
            scoreValue: document.getElementById('score-value'),
            unansweredCount: document.getElementById('unanswered-count'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            finishBtn: document.getElementById('finish-btn'),
            abandonBtn: document.getElementById('abandon-btn'),
            newTestSameBtn: document.getElementById('new-test-same-btn'),
            timerDisplay: document.getElementById('timer-display'),
            timer: document.getElementById('timer'),
            examInstructions: document.getElementById('exam-instructions'),
            practiceInstructions: document.getElementById('practice-instructions'),
            practiceStats: document.getElementById('practice-stats'),
            examStats: document.getElementById('exam-stats'),
            modeIndicator: document.getElementById('mode-indicator'),
            certType: document.getElementById('cert-type'),
            testMode: document.getElementById('test-mode'),
            modeTitle: document.getElementById('mode-title'),
            finalScore: document.getElementById('final-score'),
            finalCorrect: document.getElementById('final-correct'),
            finalTotal: document.getElementById('final-total'),
            scoreMessage: document.getElementById('score-message'),
            scoreSubmessage: document.getElementById('score-submessage'),
            timeUsed: document.getElementById('time-used'),
            finalCert: document.getElementById('final-cert'),
            finalCorrectCount: document.getElementById('final-correct-count'),
            finalIncorrectCount: document.getElementById('final-incorrect-count'),
            finalSkippedCount: document.getElementById('final-skipped-count'),
            failedQuestionsContainer: document.getElementById('failed-questions-container'),
            reviewTestBtn: document.getElementById('review-test-btn'),
            newTestAfterResultsBtn: document.getElementById('new-test-after-results-btn'),
            viewProgrammerStats: document.getElementById('view-programmer-stats'),
            viewArtistStats: document.getElementById('view-artist-stats'),
            programmerStats: document.getElementById('programmer-stats'),
            artistStats: document.getElementById('artist-stats'),
            statsExportSection: document.getElementById('stats-export-section')
        };
    }
    
    initEventListeners() {
        this.elements.startTestOption.addEventListener('click', () => this.showCertSelection());
        this.elements.viewStatsOption.addEventListener('click', () => this.showStatsPanel());
        this.elements.programmerCert.addEventListener('click', () => this.selectCert('programmer'));
        this.elements.artistCert.addEventListener('click', () => this.selectCert('artist'));
        this.elements.practiceMode.addEventListener('click', () => this.selectMode('practice'));
        this.elements.examMode.addEventListener('click', () => this.selectMode('exam'));
        this.elements.backToMainBtn.addEventListener('click', () => this.showMainMenu());
        this.elements.backToCertBtn.addEventListener('click', () => this.showCertSelection());
        this.elements.backToModeBtn.addEventListener('click', () => this.showModeSelection());
        this.elements.backToMainFromStats.addEventListener('click', () => this.showMainMenu());
        this.elements.backToMainFromResultsBtn.addEventListener('click', () => this.showMainMenu());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        [this.elements.practice20, this.elements.practice40].forEach(option => {
            option.addEventListener('click', () => {
                this.elements.practice20.classList.remove('selected');
                this.elements.practice40.classList.remove('selected');
                option.classList.add('selected');
                this.questionsPerTest = parseInt(option.dataset.questions);
            });
        });
        
        this.elements.startTestBtn.addEventListener('click', () => this.startTest());
        this.elements.prevBtn.addEventListener('click', () => this.showPreviousQuestion());
        this.elements.nextBtn.addEventListener('click', () => this.showNextQuestion());
        this.elements.finishBtn.addEventListener('click', () => this.finishTest());
        this.elements.abandonBtn.addEventListener('click', () => this.abandonTest());
        this.elements.newTestSameBtn.addEventListener('click', () => this.newTestSame());
        this.elements.reviewTestBtn.addEventListener('click', () => this.reviewTest());
        this.elements.newTestAfterResultsBtn.addEventListener('click', () => this.newTestSame());
        this.elements.viewProgrammerStats.addEventListener('click', () => this.showCertStats('programmer'));
        this.elements.viewArtistStats.addEventListener('click', () => this.showCertStats('artist'));
        
        this.setupDragAndDrop();
        this.setupKeyboardNavigation();
    }
    
    setupDragAndDrop() {
        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.currentTarget.classList.contains('file-drop-zone')) {
                e.currentTarget.classList.add('drag-over');
            }
        };
        
        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.currentTarget.classList.contains('file-drop-zone')) {
                e.currentTarget.classList.remove('drag-over');
            }
        };
        
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.file-drop-zone').forEach(zone => {
                zone.classList.remove('drag-over');
            });
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.testCompleted) return;
            
            if (this.elements.appContainer.style.display === 'flex') {
                switch(e.key) {
                    case 'ArrowLeft':
                        if (this.elements.prevBtn.style.display !== 'none') {
                            this.showPreviousQuestion();
                        }
                        break;
                    case 'ArrowRight':
                        if (this.elements.nextBtn.style.display !== 'none') {
                            this.showNextQuestion();
                        }
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                        const optionIndex = parseInt(e.key) - 1;
                        this.selectOption(optionIndex);
                        break;
                    case 'Enter':
                        if (document.activeElement === this.elements.finishBtn) {
                            this.finishTest();
                        }
                        break;
                    case 'Escape':
                        this.abandonTest();
                        break;
                }
            }
        });
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('unity-cert-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('unity-cert-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    showMainMenu() {
        this.hideAllScreens();
        this.elements.mainMenu.style.display = 'flex';
    }
    
    showCertSelection() {
        this.hideAllScreens();
        this.elements.certSelection.style.display = 'flex';
    }
    
    selectCert(cert) {
        this.currentCert = cert;
        this.elements.programmerCert.classList.remove('selected');
        this.elements.artistCert.classList.remove('selected');
        
        if (cert === 'programmer') {
            this.elements.programmerCert.classList.add('selected');
            this.elements.certType.textContent = 'Programmer';
            this.elements.finalCert.textContent = 'Programmer';
        } else {
            this.elements.artistCert.classList.add('selected');
            this.elements.certType.textContent = 'Artist';
            this.elements.finalCert.textContent = 'Artist';
        }
        
        this.showModeSelection();
    }
    
    showModeSelection() {
        this.hideAllScreens();
        this.elements.modeSelection.style.display = 'flex';
    }
    
    selectMode(mode) {
        this.currentMode = mode;
        this.elements.practiceMode.classList.remove('selected');
        this.elements.examMode.classList.remove('selected');
        
        if (mode === 'practice') {
            this.elements.practiceMode.classList.add('selected');
            this.elements.testMode.textContent = 'Entrenamiento';
            this.elements.modeTitle.textContent = `Modo entrenamiento - ${this.currentCert === 'programmer' ? 'Programmer' : 'Artist'}`;
        } else {
            this.elements.examMode.classList.add('selected');
            this.elements.testMode.textContent = 'Examen';
            this.elements.modeTitle.textContent = `Modo examen - ${this.currentCert === 'programmer' ? 'Programmer' : 'Artist'}`;
        }
        
        this.showTestConfig();
    }
    
    showTestConfig() {
        this.hideAllScreens();
        this.elements.testConfig.style.display = 'block';
        
        if (this.currentMode === 'exam') {
            this.elements.configTitle.textContent = 'Configuración del modo examen';
            this.elements.practiceConfig.style.display = 'none';
            this.elements.examConfig.style.display = 'block';
            this.questionsPerTest = 40;
        } else {
            this.elements.configTitle.textContent = 'Configuración del modo entrenamiento';
            this.elements.practiceConfig.style.display = 'block';
            this.elements.examConfig.style.display = 'none';
        }
    }
    
    showStatsPanel() {
        this.hideAllScreens();
        this.elements.statsPanel.style.display = 'block';
        this.updateStatsPanel();
    }
    
    updateStatsPanel() {
        this.showCertStats('programmer');
        this.updateExportSection();
    }
    
    showCertStats(cert) {
        this.elements.viewProgrammerStats.classList.remove('active');
        this.elements.viewArtistStats.classList.remove('active');
        
        if (cert === 'programmer') {
            this.elements.viewProgrammerStats.classList.add('active');
            this.elements.programmerStats.style.display = 'block';
            this.elements.artistStats.style.display = 'none';
            this.renderCertStats('programmer', this.elements.programmerStats);
        } else {
            this.elements.viewArtistStats.classList.add('active');
            this.elements.programmerStats.style.display = 'none';
            this.elements.artistStats.style.display = 'block';
            this.renderCertStats('artist', this.elements.artistStats);
        }
    }
    
    renderCertStats(cert, container) {
        const stats = this.userStats[cert];
        const history = this.testHistory[cert];
        const certName = cert === 'programmer' ? 'Programmer' : 'Artist';
        const icon = cert === 'programmer' ? 'fa-code' : 'fa-palette';
        
        let historyHTML = '';
        if (history.length === 0) {
            historyHTML = '<p class="no-history">No hay tests realizados todavía.</p>';
        } else {
            history.forEach(test => {
                const date = new Date(test.date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                historyHTML += `
                    <div class="history-item">
                        <div class="history-date">${date}</div>
                        <div class="history-score">${test.score}%</div>
                        <div class="history-mode">${test.mode === 'exam' ? 'Examen' : 'Entrenamiento'}</div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = `
            <h3><i class="fas ${icon}"></i> Estadísticas de ${certName.toLowerCase()}</h3>
            
            <div class="overall-stats">
                <div class="overall-stat">
                    <div class="stat-value">${stats.testsTaken}</div>
                    <div class="stat-label">Tests realizados</div>
                </div>
                <div class="overall-stat">
                    <div class="stat-value">${stats.averageScore}%</div>
                    <div class="stat-label">Puntuación media</div>
                </div>
                <div class="overall-stat">
                    <div class="stat-value">${stats.bestScore}%</div>
                    <div class="stat-label">Mejor puntuación</div>
                </div>
                <div class="overall-stat">
                    <div class="stat-value">${stats.lastScore}%</div>
                    <div class="stat-label">Última puntuación</div>
                </div>
            </div>
            
            <div class="test-history">
                <h4><i class="fas fa-history"></i> Historial reciente</h4>
                <div class="history-list">
                    ${historyHTML}
                </div>
            </div>
        `;
    }
    
    updateExportSection() {
        const totalTests = this.userStats.programmer.testsTaken + this.userStats.artist.testsTaken;
        
        if (totalTests === 0) {
            this.elements.statsExportSection.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-database"></i>
                    <p>No hay datos para exportar todavía. Realiza algún test primero.</p>
                </div>
            `;
            return;
        }
        
        this.elements.statsExportSection.innerHTML = `
            <h3><i class="fas fa-database"></i> Gestionar datos</h3>
            <div class="export-options">
                <button id="export-stats-btn" class="btn btn-primary">
                    <i class="fas fa-download"></i> Exportar estadísticas
                </button>
                <button id="import-stats-btn" class="btn btn-secondary">
                    <i class="fas fa-upload"></i> Importar estadísticas
                </button>
                <button id="reset-stats-btn" class="btn btn-warning">
                    <i class="fas fa-trash"></i> Borrar todas las estadísticas
                </button>
            </div>
            <div id="import-area" class="import-area" style="display:none;">
                <input type="file" id="stats-file-input" accept=".json" style="display:none;">
                <div class="file-drop-zone" id="file-drop-zone">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Arrastra tu archivo JSON aquí o haz clic para seleccionar</p>
                    <button id="browse-files-btn" class="btn btn-secondary">Seleccionar archivo</button>
                </div>
                <div id="import-message" class="import-message"></div>
            </div>
        `;
        
        document.getElementById('export-stats-btn')?.addEventListener('click', () => this.exportStats());
        document.getElementById('import-stats-btn')?.addEventListener('click', () => this.toggleImportArea());
        document.getElementById('reset-stats-btn')?.addEventListener('click', () => this.resetStats());
        document.getElementById('browse-files-btn')?.addEventListener('click', () => {
            document.getElementById('stats-file-input')?.click();
        });
        
        const fileInput = document.getElementById('stats-file-input');
        if (fileInput) {
            fileInput.onchange = (e) => this.importStats(e.target.files[0]);
        }
        
        const dropZone = document.getElementById('file-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            });
            
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type === 'application/json') {
                    this.importStats(files[0]);
                } else {
                    this.showImportMessage('Por favor, arrastra solo archivos JSON.', 'error');
                }
            });
        }
    }
    
    toggleImportArea() {
        const importArea = document.getElementById('import-area');
        if (importArea) {
            importArea.style.display = importArea.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    hideAllScreens() {
        const screens = [
            'mainMenu', 'certSelection', 'modeSelection', 'testConfig',
            'appContainer', 'resultsPanel', 'statsPanel'
        ];
        
        screens.forEach(screen => {
            this.elements[screen].style.display = 'none';
        });
    }
    
    startTest() {
        if (this.currentMode === 'exam') {
            this.showImmediateFeedback = false;
            this.questionCount = 40;
            this.testTimeLimit = 90 * 60;
            this.timeRemaining = this.testTimeLimit;
        } else {
            this.showImmediateFeedback = true;
            this.questionCount = this.questionsPerTest;
            this.testTimeLimit = 0;
            this.timeRemaining = 0;
        }
        
        this.generateTest();
        this.hideAllScreens();
        this.elements.appContainer.style.display = 'flex';
        
        if (this.currentMode === 'exam') {
            this.elements.modeIndicator.textContent = 'EXAMEN';
            this.elements.modeIndicator.className = 'mode-indicator exam';
            this.elements.examInstructions.style.display = 'block';
            this.elements.practiceInstructions.style.display = 'none';
            this.elements.examStats.style.display = 'block';
            this.elements.practiceStats.style.display = 'none';
            this.startCountdownTimer();
        } else {
            this.elements.modeIndicator.textContent = 'ENTRENAMIENTO';
            this.elements.modeIndicator.className = 'mode-indicator practice';
            this.elements.examInstructions.style.display = 'none';
            this.elements.practiceInstructions.style.display = 'block';
            this.elements.examStats.style.display = 'none';
            this.elements.practiceStats.style.display = 'block';
            this.startElapsedTimer();
        }
        
        this.updateStats();
        this.updateNavigationButtons();
    }
    
    generateTest() {
        this.currentTest = [];
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.testCompleted = false;
        this.testStartTime = new Date();
        
        const questionBank = this.questionBanks[this.currentCert];
        
        if (!questionBank || questionBank.length === 0) {
            alert(`Error: No hay preguntas disponibles para ${this.currentCert}. Por favor, verifica los archivos JSON.`);
            return;
        }
        
        const shuffledQuestions = this.shuffleQuestions([...questionBank]);
        
        for (let i = 0; i < Math.min(this.questionCount, shuffledQuestions.length); i++) {
            this.userAnswers.push(null);
            this.currentTest.push(shuffledQuestions[i]);
        }
        
        this.currentTest = this.shuffleQuestions(this.currentTest);
        
        if (this.currentTest.length < this.questionCount) {
            this.questionCount = this.currentTest.length;
        }
        
        this.displayQuestion(this.currentQuestionIndex);
        this.updateStats();
        
        if (this.currentMode === 'exam') {
            this.updateTimerDisplay();
        }
    }
    
    displayQuestion(index) {
        if (index >= this.currentTest.length) return;
        
        const question = this.currentTest[index];
        this.elements.currentQuestion.textContent = index + 1;
        this.elements.totalQuestions.textContent = this.questionCount;
        
        let optionsHTML = '';
        question.options.forEach((option, i) => {
            let optionClass = 'option';
            if (this.userAnswers[index] === i) {
                optionClass += ' selected';
            }
            
            if (this.showImmediateFeedback && this.userAnswers[index] !== null) {
                if (i === question.correctAnswer) {
                    optionClass += ' correct';
                } else if (this.userAnswers[index] === i && i !== question.correctAnswer) {
                    optionClass += ' incorrect';
                }
            }
            
            if (this.testCompleted) {
                if (i === question.correctAnswer) {
                    optionClass += ' correct';
                } else if (this.userAnswers[index] === i && i !== question.correctAnswer) {
                    optionClass += ' incorrect';
                }
            }
            
            optionsHTML += `
                <div class="${optionClass}" data-index="${i}">
                    <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                    <div class="option-text">${option}</div>
                </div>
            `;
        });
        
        this.elements.questionContainer.innerHTML = `
            <div class="question-number">
                <i class="fas fa-question"></i> Pregunta ${index + 1} de ${this.questionCount}
            </div>
            <div class="question-text">${question.question}</div>
            <div class="options-container">${optionsHTML}</div>
        `;
        
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', (e) => {
                if (this.testCompleted) return;
                this.selectOption(parseInt(e.currentTarget.dataset.index));
            });
        });
        
        this.updateNavigationButtons();
    }
    
    selectOption(optionIndex) {
        if (this.testCompleted) return;
        
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        if (this.showImmediateFeedback) {
            this.displayQuestion(this.currentQuestionIndex);
            setTimeout(() => {
                if (this.currentQuestionIndex < this.questionCount - 1) {
                    this.currentQuestionIndex++;
                    this.displayQuestion(this.currentQuestionIndex);
                }
            }, 800);
        } else {
            this.displayQuestion(this.currentQuestionIndex);
        }
        
        this.updateStats();
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        if (this.currentQuestionIndex === 0) {
            this.elements.prevBtn.style.display = 'none';
        } else {
            this.elements.prevBtn.style.display = 'flex';
        }
        
        if (this.currentQuestionIndex === this.questionCount - 1) {
            this.elements.nextBtn.style.display = 'none';
        } else {
            this.elements.nextBtn.style.display = 'flex';
        }
        
        if (this.currentMode === 'exam' && !this.testCompleted) {
            const answeredCount = this.userAnswers.filter(answer => answer !== null).length;
            this.elements.finishBtn.disabled = answeredCount < this.questionCount;
        }
    }
    
    showPreviousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion(this.currentQuestionIndex);
            this.updateNavigationButtons();
        }
    }
    
    showNextQuestion() {
        if (this.currentQuestionIndex < this.questionCount - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion(this.currentQuestionIndex);
            this.updateNavigationButtons();
        }
    }
    
    updateStats() {
        const answeredQuestions = this.userAnswers.filter(answer => answer !== null).length;
        const progressPercent = Math.round((answeredQuestions / this.questionCount) * 100);
        
        if (this.currentMode === 'exam' && !this.testCompleted) {
            this.elements.progressFill.style.width = `${progressPercent}%`;
            this.elements.progressPercent.textContent = `${progressPercent}%`;
            this.elements.correctCount.textContent = '--';
            this.elements.incorrectCount.textContent = '--';
            this.elements.scoreValue.textContent = '--%';
            this.elements.unansweredCount.textContent = this.questionCount - answeredQuestions;
        } else {
            let correctAnswers = 0;
            let incorrectAnswers = 0;
            
            for (let i = 0; i < this.userAnswers.length; i++) {
                if (this.userAnswers[i] !== null) {
                    if (this.userAnswers[i] === this.currentTest[i].correctAnswer) {
                        correctAnswers++;
                    } else {
                        incorrectAnswers++;
                    }
                }
            }
            
            const currentScore = this.questionCount > 0 ? 
                Math.round((correctAnswers / this.questionCount) * 100) : 0;
            
            this.elements.progressFill.style.width = `${progressPercent}%`;
            this.elements.progressPercent.textContent = `${progressPercent}%`;
            this.elements.correctCount.textContent = correctAnswers;
            this.elements.incorrectCount.textContent = incorrectAnswers;
            this.elements.scoreValue.textContent = `${currentScore}%`;
            this.elements.unansweredCount.textContent = this.questionCount - answeredQuestions;
        }
    }
    
    startCountdownTimer() {
        clearInterval(this.timerInterval);
        this.timeRemaining = this.testTimeLimit;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.finishTest();
            } else if (this.timeRemaining <= 300) {
                this.elements.timer.classList.add('warning');
            }
        }, 1000);
    }
    
    startElapsedTimer() {
        clearInterval(this.timerInterval);
        this.testStartTime = new Date();
        
        this.timerInterval = setInterval(() => {
            const now = new Date();
            const elapsedSeconds = Math.floor((now - this.testStartTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            
            this.elements.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    updateTimerDisplay() {
        if (this.currentMode === 'exam') {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            this.elements.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    finishTest() {
        if (!confirm('¿Estás seguro de que quieres finalizar el test? Esta acción no se puede deshacer.')) {
            return;
        }
        
        this.testCompleted = true;
        clearInterval(this.timerInterval);
        
        const endTime = new Date();
        const timeUsed = Math.floor((endTime - this.testStartTime) / 1000);
        const minutesUsed = Math.floor(timeUsed / 60);
        const secondsUsed = timeUsed % 60;
        
        this.elements.timeUsed.textContent = 
            `${minutesUsed.toString().padStart(2, '0')}:${secondsUsed.toString().padStart(2, '0')}`;
        
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let skippedAnswers = 0;
        
        for (let i = 0; i < this.userAnswers.length; i++) {
            if (this.userAnswers[i] === null) {
                skippedAnswers++;
            } else if (this.userAnswers[i] === this.currentTest[i].correctAnswer) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }
        }
        
        const scorePercent = Math.round((correctAnswers / this.questionCount) * 100);
        
        let message, submessage;
        if (scorePercent >= 80) {
            message = "¡Excelente trabajo!";
            submessage = "Estás listo para el examen real.";
        } else if (scorePercent >= 60) {
            message = "Buen trabajo, pero puedes mejorar.";
            submessage = "Revisa las preguntas falladas y sigue practicando.";
        } else {
            message = "Necesitas más práctica.";
            submessage = "Estudia los conceptos básicos y vuelve a intentarlo.";
        }
        
        this.elements.finalScore.textContent = `${scorePercent}%`;
        this.elements.finalCorrect.textContent = correctAnswers;
        this.elements.finalTotal.textContent = this.questionCount;
        this.elements.finalCorrectCount.textContent = correctAnswers;
        this.elements.finalIncorrectCount.textContent = incorrectAnswers;
        this.elements.finalSkippedCount.textContent = skippedAnswers;
        this.elements.scoreMessage.textContent = message;
        this.elements.scoreSubmessage.textContent = submessage;
        
        this.displayFailedQuestions(correctAnswers, incorrectAnswers, skippedAnswers);
        this.saveTestResult(scorePercent, correctAnswers, this.questionCount);
        
        this.elements.appContainer.style.display = 'none';
        this.elements.resultsPanel.style.display = 'block';
    }
    
    abandonTest() {
        if (!confirm('¿Estás seguro de que quieres abandonar el test? No se guardarán las estadísticas.')) {
            return;
        }
        
        clearInterval(this.timerInterval);
        this.showMainMenu();
    }
    
    newTestSame() {
        if (this.currentCert && this.currentMode) {
            this.startTest();
        } else {
            this.showCertSelection();
        }
    }
    
    displayFailedQuestions(correct, incorrect, skipped) {
        if (incorrect === 0 && skipped === 0) {
            this.elements.failedQuestionsContainer.innerHTML = `
                <p class="no-failed">
                    <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 10px; color: var(--correct-color);"></i><br>
                    ¡Felicidades! Has respondido correctamente todas las preguntas.
                </p>
            `;
            return;
        }
        
        let failedHTML = '';
        for (let i = 0; i < this.currentTest.length; i++) {
            if (this.userAnswers[i] === null || this.userAnswers[i] !== this.currentTest[i].correctAnswer) {
                const question = this.currentTest[i];
                failedHTML += `
                    <div class="failed-question-item">
                        <div class="question-number">Pregunta ${i + 1}</div>
                        <div class="question-text">${question.question}</div>
                        <div class="correct-answer">
                            <i class="fas fa-check-circle"></i> Respuesta correcta: 
                            ${String.fromCharCode(65 + question.correctAnswer)} - ${question.options[question.correctAnswer]}
                        </div>
                        ${this.userAnswers[i] !== null ? 
                            `<div class="user-answer">
                                <i class="fas fa-times-circle"></i> Tu respuesta: 
                                ${String.fromCharCode(65 + this.userAnswers[i])} - ${question.options[this.userAnswers[i]]}
                            </div>` : 
                            `<div class="user-answer">
                                <i class="fas fa-circle"></i> No respondiste esta pregunta
                            </div>`
                        }
                        <div class="explanation">${question.explanation}</div>
                    </div>
                `;
            }
        }
        
        this.elements.failedQuestionsContainer.innerHTML = failedHTML;
    }
    
    reviewTest() {
        this.testCompleted = true;
        this.currentQuestionIndex = 0;
        this.elements.appContainer.style.display = 'flex';
        this.elements.resultsPanel.style.display = 'none';
        this.displayQuestion(this.currentQuestionIndex);
        this.elements.finishBtn.disabled = true;
        this.updateNavigationButtons();
    }
    
    loadTestHistory() {
        const history = localStorage.getItem('unity-cert-history');
        return history ? JSON.parse(history) : {
            programmer: [],
            artist: []
        };
    }
    
    loadUserStats() {
        const stats = localStorage.getItem('unity-cert-stats');
        return stats ? JSON.parse(stats) : {
            programmer: { testsTaken: 0, averageScore: 0, bestScore: 0, lastScore: 0 },
            artist: { testsTaken: 0, averageScore: 0, bestScore: 0, lastScore: 0 }
        };
    }
    
    saveTestResult(score, correct, total) {
        const testResult = {
            date: new Date().toISOString(),
            score: score,
            correct: correct,
            total: total,
            mode: this.currentMode,
            time: this.elements.timeUsed.textContent
        };
        
        this.testHistory[this.currentCert].unshift(testResult);
        if (this.testHistory[this.currentCert].length > 10) {
            this.testHistory[this.currentCert].pop();
        }
        localStorage.setItem('unity-cert-history', JSON.stringify(this.testHistory));
        
        const certStats = this.userStats[this.currentCert];
        certStats.testsTaken++;
        certStats.lastScore = score;
        
        if (score > certStats.bestScore) {
            certStats.bestScore = score;
        }
        
        certStats.averageScore = Math.round(
            ((certStats.averageScore * (certStats.testsTaken - 1)) + score) / certStats.testsTaken
        );
        
        localStorage.setItem('unity-cert-stats', JSON.stringify(this.userStats));
    }
    
    exportStats() {
        const data = {
            stats: this.userStats,
            history: this.testHistory,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `unity-cert-stats-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showImportMessage('Estadísticas exportadas correctamente.', 'success');
    }
    
    importStats(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!importedData.stats || !importedData.history) {
                    throw new Error('Formato de archivo inválido');
                }
                
                if (importedData.stats.programmer && importedData.stats.artist &&
                    importedData.history.programmer && importedData.history.artist) {
                    
                    this.userStats = importedData.stats;
                    this.testHistory = importedData.history;
                    
                    localStorage.setItem('unity-cert-stats', JSON.stringify(this.userStats));
                    localStorage.setItem('unity-cert-history', JSON.stringify(this.testHistory));
                    
                    this.updateStatsPanel();
                    this.showImportMessage('Estadísticas importadas correctamente.', 'success');
                } else {
                    throw new Error('Estructura de datos incorrecta');
                }
            } catch (error) {
                console.error('Error al importar:', error);
                this.showImportMessage('Error al importar el archivo. Formato inválido.', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    resetStats() {
        if (!confirm('¿Estás seguro de que quieres borrar todas las estadísticas? Esta acción no se puede deshacer.')) {
            return;
        }
        
        this.userStats = {
            programmer: { testsTaken: 0, averageScore: 0, bestScore: 0, lastScore: 0 },
            artist: { testsTaken: 0, averageScore: 0, bestScore: 0, lastScore: 0 }
        };
        
        this.testHistory = {
            programmer: [],
            artist: []
        };
        
        localStorage.setItem('unity-cert-stats', JSON.stringify(this.userStats));
        localStorage.setItem('unity-cert-history', JSON.stringify(this.testHistory));
        
        this.updateStatsPanel();
        this.showImportMessage('Estadísticas borradas correctamente.', 'success');
    }
    
    showImportMessage(message, type) {
        const importMessage = document.getElementById('import-message');
        if (importMessage) {
            importMessage.textContent = message;
            importMessage.className = `import-message ${type}`;
            importMessage.style.display = 'block';
            
            setTimeout(() => {
                importMessage.style.display = 'none';
            }, 5000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UnityCertSimulator();
});