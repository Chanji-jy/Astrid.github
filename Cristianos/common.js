// Constante para acceso al localStorage
const GAME_STATE_KEY = '100CristianosGame';

// Preguntas y respuestas
const questions = [
    {
        id: "q1",
        question: "Nombre los discípulos de Jesús...",
        answers: [
            { text: "Juan", points: 25 },
            { text: "Pedro", points: 30 },
            { text: "Simón", points: 15 },
            { text: "Judas", points: 10 },
            { text: "Santiago", points: 20 }
        ]
    },
    {
        id: "q2",
        question: "Menciona un animal que asusta a mucha gente...",
        answers: [
            { text: "Serpiente", points: 30 },
            { text: "Araña", points: 25 },
            { text: "Tiburón", points: 15 },
            { text: "Rata/Ratón", points: 10 },
            { text: "Cucaracha", points: 8 },
            { text: "León", points: 7 },
            { text: "Perro bravo", points: 5 }
        ]
    },
    {
        id: "q3",
        question: "Menciona algún personaje bíblico que haya visto a Dios",
        answers: [
            { text: "Moisés", points: 30 },
            { text: "Isaías", points: 25 },
            { text: "Ezequiel", points: 20 },
            { text: "Juan (Apocalipsis)", points: 15 },
            { text: "Daniel", points: 10 }
        ]
    }
];

// Estado global del juego
let gameState = {
    currentQuestionId: null,
    team1Score: 0,
    team2Score: 0,
    strikes: 0,
    revealedAnswers: [],
    activeTeam: 1,
    showWrongAnswer: false
};

// Guardar estado del juego en localStorage
function saveGameState() {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
}

// Cargar estado del juego desde localStorage
function loadGameState() {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Actualizar el estado del juego
        gameState = {
            currentQuestionId: parsedState.currentQuestionId || null,
            team1Score: parsedState.team1Score || 0,
            team2Score: parsedState.team2Score || 0,
            strikes: parsedState.strikes || 0,
            revealedAnswers: parsedState.revealedAnswers || [],
            activeTeam: parsedState.activeTeam || 1,
            showWrongAnswer: false
        };
    }
}

// Notificar cambios en el estado del juego
function notifyStateChange() {
    // Guardar cambios en localStorage
    saveGameState();
    
    // Disparar evento personalizado para que otros scripts puedan reaccionar
    document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: gameState }));
}

// Obtener pregunta actual
function getCurrentQuestion() {
    if (!gameState.currentQuestionId) return null;
    return questions.find(q => q.id === gameState.currentQuestionId);
}

// Inicializar automáticamente
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
});