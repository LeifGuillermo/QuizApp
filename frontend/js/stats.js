import { fetchData, showLoading } from './utils.js';

const appContainer = document.getElementById('app-container');

/**
 * Renders the statistics screen.
 */
export async function renderStatistics() {
    showLoading(appContainer);
    const stats = await fetchData('/statistics');
    if (!stats) return;

    let html = `
        <div class="card">
            <h2>Quiz Statistics</h2>
            <p>Overall performance on all questions and categories.</p>
        </div>
        <div class="card">
            <h3>Questions Needing Review</h3>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Category</th>
                        <th>Correct %</th>
                    </tr>
                </thead>
                <tbody>
    `;
    stats.ranked_questions.forEach(item => {
        const correctPercentage = item.correct_percentage;
        const incorrectPercentage = 100 - correctPercentage;
        html += `
            <tr>
                <td>${item.question}</td>
                <td>${item.categories.join(', ')}</td>
                <td>
                    <div class="stat-bar-container">
                        <div class="stat-bar correct-bar" style="width: ${correctPercentage}%;"></div>
                        <div class="stat-bar incorrect-bar" style="width: ${incorrectPercentage}%;"></div>
                    </div>
                    ${correctPercentage.toFixed(1)}%
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        <div class="card">
            <h3>Category Performance</h3>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Correct %</th>
                    </tr>
                </thead>
                <tbody>
    `;
    stats.category_performance.forEach(item => {
        const correctPercentage = item.correct_percentage;
        const incorrectPercentage = 100 - correctPercentage;
        html += `
            <tr>
                <td>${item.category}</td>
                <td>
                    <div class="stat-bar-container">
                        <div class="stat-bar correct-bar" style="width: ${correctPercentage}%;"></div>
                        <div class="stat-bar incorrect-bar" style="width: ${incorrectPercentage}%;"></div>
                    </div>
                    ${correctPercentage.toFixed(1)}%
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    appContainer.innerHTML = html;
}