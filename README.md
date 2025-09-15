# How to Run the Application

## Backend (Flask API)
1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    pip install flask
    ```
3. Start the Flask server:
    ```bash
    python app.py
    ```

## Frontend (Static Files)
1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2. Open `index.html` in your web browser.

**Note:** Ensure the backend server is running before using the frontend for full functionality.

# Project Structure

```
/quiz_tool
│
├── backend
│   ├── data
│   │   ├── questions.csv
│   │   └── results.json
│   └── app.py
│
├── frontend
│   ├── css
│   │   └── styles.css
│   ├── js
│   │   ├── main.js
│   │   ├── quiz.js
│   │   ├── stats.js
│   │   └── utils.js
│   └── index.html
│
└── README.md
```

- **/backend**: Contains the Python Flask server code.
    - **/data**: Stores quiz questions and results.
        - `questions.csv`: Quiz questions.
        - `results.json`: Quiz results for statistics.
    - `app.py`: Main Flask application with all endpoints.

- **/frontend**: Contains all client-side code.
    - **/css/styles.css**: Styles for the app.
    - **/js**: JavaScript logic.
        - `main.js`: Entry point, routing, and view management.
        - `quiz.js`: Quiz logic and user input handling.
        - `stats.js`: Fetching and displaying statistics.
        - `utils.js`: Reusable utility functions.
    - `index.html`: Single-page application entry.

- **README.md**: Project documentation.

---