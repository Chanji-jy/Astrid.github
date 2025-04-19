// Variables del presentador
let projectionWindow = null;

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresenter();
});

// Inicializar la interfaz del presentador
function initPresenter() {
    loadGameState();
    updateQuestionSelect();
    updatePresenterUI();
    
    // Escuchar cambios en el estado del juego
    document.addEventListener('gameStateChanged', () => {
        updatePresenterUI();
        notifyProjection();
    });
    
    // Comprobar periódicamente el estado de la ventana de proyección
    setInterval(checkProjectionWindow, 1000);
}

// Comprobar estado de la ventana de proyección
function checkProjectionWindow() {
    if (projectionWindow && projectionWindow.closed) {
        projectionWindow = null;
    }
}

// Actualizar el selector de preguntas
function updateQuestionSelect() {
    const select = document.getElementById('question-select');
    select.innerHTML = '<option value="">Seleccionar pregunta...</option>';
    
    questions.forEach(q => {
        const option = document.createElement('option');
        option.value = q.id;
        option.textContent = q.question.substring(0, 50) + (q.question.length > 50 ? '...' : '');
        select.appendChild(option);
    });
    
    // Seleccionar la pregunta actual si existe
    if (gameState.currentQuestionId) {
        select.value = gameState.currentQuestionId;
    }
}

// Seleccionar una pregunta
function selectQuestion() {
    const questionId = document.getElementById('question-select').value;
    if (!questionId) return;
    
    // Actualizar el estado del juego
    gameState.currentQuestionId = questionId;
    gameState.revealedAnswers = [];
    gameState.strikes = 0;
    
    // Notificar cambios
    notifyStateChange();
}

// Actualizar la interfaz del presentador
function updatePresenterUI() {
    // Actualizar puntajes
    document.getElementById('team1-score').textContent = gameState.team1Score;
    document.getElementById('team2-score').textContent = gameState.team2Score;
    
    // Actualizar estado del equipo activo
    document.getElementById('team1').classList.toggle('active', gameState.activeTeam === 1);
    document.getElementById('team2').classList.toggle('active', gameState.activeTeam === 2);
    
    // Actualizar las X (strikes)
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`strike${i}`).classList.toggle('active', i <= gameState.strikes);
    }
    
    // Actualizar pregunta y respuestas
    const currentQuestion = getCurrentQuestion();
    const questionDisplay = document.getElementById('current-question');
    const answersList = document.getElementById('answer-list');
    
    if (currentQuestion) {
        questionDisplay.textContent = currentQuestion.question;
        
        // Actualizar lista de respuestas
        renderAnswers();
    } else {
        questionDisplay.textContent = 'Selecciona una pregunta para empezar';
        answersList.innerHTML = '<p class="empty-message">Selecciona una pregunta para ver las respuestas</p>';
    }
}

// Renderizar las respuestas de la pregunta actual
function renderAnswers() {
    const answersList = document.getElementById('answer-list');
    answersList.innerHTML = '';
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Ordenar respuestas por puntos (de mayor a menor)
    const sortedAnswers = [...currentQuestion.answers].sort((a, b) => b.points - a.points);
    
    sortedAnswers.forEach((answer, index) => {
        const isRevealed = gameState.revealedAnswers.includes(answer.text);
        
        const answerDiv = document.createElement('div');
        answerDiv.className = `admin-answer ${isRevealed ? 'revealed' : ''}`;
        
        answerDiv.innerHTML = `
            <div class="answer-number">${index + 1}</div>
            <div class="answer-text">${answer.text}</div>
            <div class="answer-points">${answer.points}</div>
            <button class="reveal-btn" onclick="revealAnswer('${answer.text}')" ${isRevealed ? 'disabled' : ''}>
                ${isRevealed ? 'Revelada' : 'Revelar'}
            </button>
        `;
        
        answersList.appendChild(answerDiv);
    });
}

// Revelar una respuesta
function revealAnswer(answerText) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Encontrar la respuesta seleccionada
    const answer = currentQuestion.answers.find(a => a.text === answerText);
    if (!answer) return;
    
    // Añadir a respuestas reveladas si no está ya
    if (!gameState.revealedAnswers.includes(answerText)) {
        gameState.revealedAnswers.push(answerText);
        
        // Añadir puntos al equipo activo
        if (gameState.activeTeam === 1) {
            gameState.team1Score += answer.points;
        } else {
            gameState.team2Score += answer.points;
        }
        
        // Reproducir sonido de revelación
        document.getElementById('reveal').play();
        
        notifyStateChange();
    }
}

// Añadir un strike (respuesta incorrecta)
function addStrike() {
    if (gameState.strikes < 3) {
        gameState.strikes++;
        
        // Reproducir sonido de error
        document.getElementById('buzzer').play();
        
        // Si hay 3 strikes, cambiar al otro equipo
        if (gameState.strikes >= 3) {
            // Cambiar al otro equipo después de 1 segundo
            setTimeout(() => {
                toggleActiveTeam();
            }, 1000);
        }
        
        // Mostrar animación de X incorrecta en la proyección
        gameState.showWrongAnswer = true;
        notifyStateChange();
        
        // Ocultar la X después de 1.5 segundos
        setTimeout(() => {
            gameState.showWrongAnswer = false;
            notifyStateChange();
        }, 1500);
    }
}

// Reiniciar los strikes
function resetStrikes() {
    gameState.strikes = 0;
    notifyStateChange();
}

// Cambiar el equipo activo
function toggleActiveTeam() {
    gameState.activeTeam = gameState.activeTeam === 1 ? 2 : 1;
    notifyStateChange();
}

// Reiniciar completamente el juego
function resetGame() {
    if (confirm('¿Estás seguro de que deseas reiniciar el juego? Se perderán todos los puntos.')) {
        gameState = {
            currentQuestionId: null,
            team1Score: 0,
            team2Score: 0,
            strikes: 0,
            revealedAnswers: [],
            activeTeam: 1,
            showWrongAnswer: false
        };
        
        // Restablecer la selección de pregunta
        document.getElementById('question-select').value = '';
        
        notifyStateChange();
    }
}

// Abrir ventana de proyección
function openProjectionWindow() {
    // Cerrar la ventana de proyección anterior si existe
    if (projectionWindow && !projectionWindow.closed) {
        projectionWindow.close();
    }
    
    // Abrir nueva ventana de proyección
    projectionWindow = window.open('projection.html', 'ProjectionWindow', 'width=1024,height=768');
    
    // Notificar a la ventana de proyección cuando esté lista
    setTimeout(() => {
        notifyProjection();
    }, 1000);
}

// Notificar cambios a la ventana de proyección
function notifyProjection() {
    if (projectionWindow && !projectionWindow.closed) {
        // La actualización de localStorage es suficiente
        // La ventana de proyección detectará los cambios
        saveGameState();
    }
}