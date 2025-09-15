const API_BASE_URL = 'http://127.0.0.1:5000'; // Flask's default development port

/**
 * Fetches data from a given API endpoint.
 * @param {string} endpoint The API endpoint URL.
 * @param {object} params Optional query parameters.
 * @returns {Promise<object>} The JSON data from the response.
 */
export async function fetchData(endpoint, params = {}) {
    const url = new URL(endpoint, API_BASE_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to load data. Please check the backend server.');
        return null;
    }
}

/**
 * Sends a POST request to a given API endpoint.
 * @param {string} endpoint The API endpoint URL.
 * @param {object} data The data to send in the request body.
 * @returns {Promise<object>} The JSON response from the server.
 */
export async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Post error:', error);
        alert('Failed to submit data. Please check the backend server.');
        return null;
    }
}

/**
 * Renders a loading spinner.
 */
export function showLoading(container) {
    container.innerHTML = '<div class="card"><p>Loading...</p></div>';
}

/**
 * Clears the content of a container.
 * @param {HTMLElement} container The DOM element to clear.
 */
export function clearContainer(container) {
    container.innerHTML = '';
}