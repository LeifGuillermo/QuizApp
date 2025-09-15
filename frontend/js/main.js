import { renderQuizSelection } from './quiz.js';
import { renderStatistics } from './stats.js';

// The fix is here: Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const navQuizBtn = document.getElementById('nav-quiz');
    const navStatsBtn = document.getElementById('nav-stats');

    /**
     * Initializes the application by rendering the initial screen and setting up navigation.
     */
    function initializeApp() {
        // Initial view is the quiz selection screen
        renderQuizSelection();

        // Setup navigation event listeners
        navQuizBtn.addEventListener('click', () => {
            navQuizBtn.classList.add('active');
            navStatsBtn.classList.remove('active');
            // The quiz flow now starts with selecting a quiz
            renderQuizSelection();
        });

        navStatsBtn.addEventListener('click', () => {
            navStatsBtn.classList.add('active');
            navQuizBtn.classList.remove('active');
            renderStatistics();
        });
    }

    initializeApp();
});