import { fetchData, postData, showLoading, clearContainer } from './utils.js';

const appContainer = document.getElementById('app-container');
let currentQuestions = [];
let userAnswers = {};
let currentQuestionIndex = 0;
let currentQuizFile = '';

export async function renderQuizSelection() {
    showLoading(appContainer);
    const quizzes = await fetchData('/quizzes');
    
    if (!quizzes || quizzes.length === 0) {
        appContainer.innerHTML = '<div class="card"><p>No quizzes found.</p></div>';
        return;
    }

    let html = `
        <div class="card">
            <h2>Select a Quiz</h2>
            <div class="options-container">
                <select id="quiz-dropdown" class="quiz-select-dropdown">
                    <option value="">-- Please choose a quiz --</option>
    `;
    quizzes.forEach(file => {
        const quizName = file.replace('.csv', '');
        html += `<option value="${file}">${quizName}</option>`;
    });

    html += `
                </select>
                <button id="select-quiz-btn" disabled>Select</button>
            </div>
        </div>
    `;
    appContainer.innerHTML = html;

    // The fix is here:
    // We get the elements and add listeners *after* they are rendered.
    const quizDropdown = document.getElementById('quiz-dropdown');
    const selectButton = document.getElementById('select-quiz-btn');

    quizDropdown.addEventListener('change', (event) => {
        const selectedFile = event.target.value;
        if (selectedFile) {
            currentQuizFile = selectedFile;
            selectButton.disabled = false;
        } else {
            selectButton.disabled = true;
        }
    });

    selectButton.addEventListener('click', () => {
        if (currentQuizFile) {
            renderCategorySelection();
        }
    });
}

/**
 * Renders the initial category selection screen.
 */
export async function renderCategorySelection() {
    showLoading(appContainer);
    
    const categories = await fetchData('/categories', { quiz_file: currentQuizFile });
    
    if (!categories) {
        appContainer.innerHTML = '<div class="card"><p>Failed to load categories. Please try again later.</p></div>';
        return;
    }
    
    // Manually add the "All" option at the beginning
    const allCategories = categories;

    let html = `
        <div class="card">
            <h2>Select Categories to Quiz On</h2>
            <div class="options-container" id="category-options">
    `;
    allCategories.forEach(cat => {
        const isAll = cat === 'All';
        const checked = isAll ? 'checked' : '';
        html += `
            <label class="option-label">
                <input type="checkbox" name="category" value="${cat}" ${checked}> ${cat}
            </label>
        `;
    });
    html += `
            </div>
            <button id="start-quiz-btn">Start Quiz</button>
        </div>
    `;
    appContainer.innerHTML = html;

    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    document.getElementById('category-options').addEventListener('change', handleCategoryCheckbox);
}

/**
 * Handles the logic for the "All" checkbox.
 */
function handleCategoryCheckbox(event) {
    const allCheckbox = document.querySelector('input[value="All"]');
    const checkboxes = document.querySelectorAll('input[name="category"]');
    if (event.target.value === 'All') {
        checkboxes.forEach(cb => cb.checked = event.target.checked);
    } else {
        allCheckbox.checked = false;
    }
}

/**
 * Starts the quiz by fetching questions based on selected categories.
 */
async function startQuiz() {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);

    if (selectedCategories.length === 0) {
        alert('Please select at least one category.');
        return;
    }


    showLoading(appContainer);
    currentQuestions = await fetchData('/questions', {
        categories: selectedCategories.join(','),
        quiz_file: currentQuizFile // Pass the selected file
    });

    if (currentQuestions && currentQuestions.length > 0) {
        currentQuestionIndex = 0;
        userAnswers = {};
        renderQuestion();
    } else {
        appContainer.innerHTML = '<div class="card"><p>No questions found for the selected categories.</p><button id="back-btn">Go Back</button></div>';
        document.getElementById('back-btn').addEventListener('click', renderCategorySelection);
    }
}

/**
 * Renders the current question.
 */
function renderQuestion() {
    clearContainer(appContainer);
    if (currentQuestionIndex >= currentQuestions.length) {
        submitTest();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    let optionsHtml = '';

    if (question.type === 'mc' || question.type === 'tf') {
        // Multiple choice or true/false
        optionsHtml = question.answers.map(ans => `
            <label class="option-label">
                <input type="radio" name="answer" value="${ans}" required> ${ans}
            </label>
        `).join('');
    } else if (question.type === 'ma') {
        // Multiple answer
        optionsHtml = question.answers.map(ans => `
            <label class="option-label">
                <input type="checkbox" name="answer" value="${ans}"> ${ans}
            </label>
        `).join('');
    } else if (question.type === 'te') {
        // Text entry
        optionsHtml = `<input type="text" id="text-answer" class="text-input" placeholder="Type your answer here..." required>`;
    }

    const nextBtnText = currentQuestionIndex === currentQuestions.length - 1 ? 'Finish Test' : 'Next Question';

    const html = `
        <div class="card">
            <h2>Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</h2>
            <p class="question-text">${question.question}</p>
            <form id="question-form">
                <div class="options-container">
                    ${optionsHtml}
                </div>
                <button type="submit">${nextBtnText}</button>
            </form>
        </div>
    `;
    appContainer.innerHTML = html;

    document.getElementById('question-form').addEventListener('submit', handleNextQuestion);
}

/**
 * Handles the submission of the current question and moves to the next.
 */
function handleNextQuestion(event) {
    event.preventDefault();
    const question = currentQuestions[currentQuestionIndex];
    let answer;

    if (question.type === 'te') {
        answer = document.getElementById('text-answer').value;
    } else if (question.type === 'ma') {
        answer = Array.from(document.querySelectorAll('input[name="answer"]:checked')).map(el => el.value);
    } else {
        const selected = document.querySelector('input[name="answer"]:checked');
        answer = selected ? selected.value : null;
    }

    if (!answer) {
        alert('Please select or enter an answer.');
        return;
    }

    userAnswers[question.question] = answer;
    currentQuestionIndex++;
    renderQuestion();
}

/**
 * Submits the completed quiz to the backend and renders the results.
 */
async function submitTest() {
    showLoading(appContainer);
    const payload = {
        quiz_file: currentQuizFile,
        questions: currentQuestions.map(q => ({
            question: q.question,
            correct_answers: q.correct_answers,
            type: q.type
        })),
        user_answers: userAnswers
    };
    
    const results = await postData('/submit_test', payload);

    if (results) {
        renderResults(results);
    } else {
        renderCategorySelection();
    }
}

/**
 * Renders the test results screen.
 * @param {object} results The quiz results from the backend.
 */
function renderResults(results) {
    let html = `
        <div class="card">
            <h2>Quiz Complete!</h2>
            <h3>Your Score: ${results.score} / ${results.total_questions} (${results.percentage}%)</h3>
        </div>
        <div class="results-section">
            <h3>Review Your Answers</h3>
    `;

    results.detailed_results.forEach(item => {
        const isCorrect = item.is_correct;
        const resultClass = isCorrect ? 'correct' : 'incorrect';
        const userAnswerDisplay = Array.isArray(item.user_answer) ? item.user_answer.join(', ') : item.user_answer;
        const correctAnswerDisplay = Array.isArray(item.correct_answers) ? item.correct_answers.join(', ') : item.correct_answers;

        html += `
            <div class="result-item ${resultClass}">
                <p><strong>Question:</strong> ${item.question}</p>
                <p class="user-answer-${resultClass}"><strong>Your Answer:</strong> ${userAnswerDisplay || 'No answer'}</p>
                <p class="correct-answer"><strong>Correct Answer:</strong> ${correctAnswerDisplay}</p>
            </div>
        `;
    });

    html += `</div>`;
    appContainer.innerHTML = html;
}