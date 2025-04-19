// Variables globales
let currentQuestion = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Cargar el estado inicial
    loadGameState();
    updateProjectionUI();
    
    // Comprobar cambios en localStorage cada 500ms
    setInterval(checkForUpdates, 500);
});

// Comprobar si hay actualizaciones en el estado del juego
function checkForUpdates() {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
        const newState = JSON.parse(savedState);
        
        // Comprobar si algo ha cambiado que requiera actualizar la UI
        if (
            newState.currentQuestionId !== gameState.currentQuestionId ||
            newState.team1Score !== gameState.team1Score ||
            newState.team2Score !== gameState.team2Score ||
            newState.strikes !== gameState.strikes ||
            newState.activeTeam !== gameState.activeTeam ||
            newState.revealedAnswers.length !== gameState.revealedAnswers.length ||
            newState.showWrongAnswer !== gameState.showWrongAnswer
        ) {
            // Actualizar el estado local
            gameState = {
                currentQuestionId: newState.currentQuestionId,
                team1Score: newState.team1Score,
                team2Score: newState.team2Score,
                strikes: newState.strikes,
                revealedAnswers: newState.revealedAnswers || [],
                activeTeam: newState.activeTeam,
                showWrongAnswer: newState.showWrongAnswer
            };
            
            // Actualizar la UI
            updateProjectionUI();
        }
    }
}

// Actualizar toda la UI de proyección
function updateProjectionUI() {
    // Actualizar pregunta
    currentQuestion = getCurrentQuestion();
    const questionDisplay = document.getElementById('question-display');
    
    if (currentQuestion) {
        questionDisplay.textContent = currentQuestion.question;
    } else {
        questionDisplay.textContent = 'Esperando pregunta...';
    }
    
    // Actualizar puntuaciones de equipos
    document.getElementById('proj-team1-score').textContent = gameState.team1Score;
    document.getElementById('proj-team2-score').textContent = gameState.team2Score;
    
    // Actualizar equipo activo
    document.getElementById('proj-team1').className = `projection-team ${gameState.activeTeam === 1 ? 'active' : ''}`;
    document.getElementById('proj-team2').className = `projection-team ${gameState.activeTeam === 2 ? 'active' : ''}`;
    
    // Actualizar strikes
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`proj-strike${i}`).className = `projection-strike ${i <= gameState.strikes ? 'active' : ''}`;
    }
    
    // Mostrar respuesta incorrecta si es necesario
    const wrongAnswer = document.getElementById('wrong-answer');
    if (gameState.showWrongAnswer) {
        wrongAnswer.classList.add('show');
    } else {
        wrongAnswer.classList.remove('show');
    }
    
    // Actualizar respuestas
    renderProjectionAnswers();
}

// Renderizar las respuestas en la proyección
function renderProjectionAnswers() {
    const answersDisplay = document.getElementById('answers-display');
    answersDisplay.innerHTML = '';
    
    if (!currentQuestion) return;
    
    // Ordenar respuestas por puntos (de mayor a menor)
    const sortedAnswers = [...currentQuestion.answers].sort((a, b) => b.points - a.points);
    
    // Crear elementos para cada respuesta
    sortedAnswers.forEach((answer, index) => {
        const isRevealed = gameState.revealedAnswers.includes(answer.text);
        
        const answerElement = document.createElement('div');
        answerElement.className = `projection-answer ${isRevealed ? '' : 'hidden'}`;
        
        answerElement.innerHTML = `
            <div class="projection-answer-number">${index + 1}</div>
            <div class="projection-answer-text">${isRevealed ? answer.text : '?????'}</div>
            <div class="projection-answer-points">${isRevealed ? answer.points : '??'}</div>
        `;
        
        answersDisplay.appendChild(answerElement);
    });
}