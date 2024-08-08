document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('signup-btn').addEventListener('click', signup);
document.getElementById('select-subject-btn').addEventListener('click', selectSubject);
document.getElementById('select-category-btn').addEventListener('click', selectCategory);
document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);

let authHeader;
let currentSubjectId = null;
let currentCategoryId = null;
let subject_id = null;
let category_id = null;
let currentQuestionId = null;
function login() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;

    fetch('http://localhost:5001/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Login failed. Invalid credentials.');
        }
    })
    .then(data => {
        authHeader = 'Basic ' + btoa(`${phone}:${password}`);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('subject-selection').style.display = 'block';
        loadSubjects();
    })
    .catch(error => {
        alert(error.message);
    });
}

function signup() {
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;

    fetch('http://localhost:5001/user/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Sign-up failed. Phone number might already exist.');
        }
    })
    .then(data => {
        alert('Sign-up successful. Please log in.');
        showLogin();
    })
    .catch(error => {
        alert(error.message);
    });
}

function loadSubjects() {
    fetch('http://localhost:5001/admin/get_subjects', {
        method: 'GET',
        headers: {
            'Authorization': authHeader
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load subjects.');
        }
    })
    .then(subjects => {
        const subjectDropdown = document.getElementById('subject-dropdown');
        subjectDropdown.innerHTML = '';
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject._id;
            option.textContent = subject.subject_name;
            subjectDropdown.appendChild(option);
        });
    })
    .catch(error => {
        alert(error.message);
    });
}

function selectSubject() {
    subjectId = document.getElementById('subject-dropdown').value;
    currentSubjectId = subjectId;
    document.getElementById('subject-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
    loadCategories(subjectId);
}

function loadCategories(subjectId) {
    fetch(`http://127.0.0.1:5001/admin/get_categories?subject_id=${subjectId}`, {
        method: 'GET',
        headers: {
            //'Authorization': authHeader
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load categories.');
        }
    })
    .then(categories => {
        const categoryDropdown = document.getElementById('category-dropdown');
        categoryDropdown.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.category_name;
            categoryDropdown.appendChild(option);
            console.log(option.value);
        });
    })
    .catch(error => {
        alert(error.message);
    });
}

function selectCategory() {
    categoryId = document.getElementById('category-dropdown').value;
    currentCategoryId = categoryId;
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('question-section').style.display = 'block';
    console.log(currentCategoryId);
    getRandomQuestion(currentSubjectId, categoryId);
}

function getRandomQuestion(categoryId) {
    fetch(`http://127.0.0.1:5001/user/categories/random_question?category_id=${currentCategoryId}`, {
        method: 'GET',
        headers: {
            //'Authorization': authHeader
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load random question.');
        }
    })
    .then(question => {
       currentQuestionId = question.id;
       console.log(currentQuestionId);
        const questionContainer = document.getElementById('question-container');
        questionContainer.innerHTML = `
            <p><strong>Question:</strong> ${question.question}</p>
            <p><strong>Answers:</strong></p>
            <ul>
                <li>A.) ${question.answers[0]}</li>
                <li>B.) ${question.answers[1]}</li>
                <li>C.) ${question.answers[2]}</li>
                <li>D.) ${question.answers[3]}</li>
            </ul>
        `;
    })
    .catch(error => {
        alert(error.message);
    });
}

function submitAnswer() {
    const userAnswer = document.getElementById('answer-input').value;

    // Make sure currentQuestionId is available
    if (!currentQuestionId) {
        alert('No question to answer.');
        return;
    }

    // Create the payload
    const payload = {
        question_id: currentQuestionId,
        selected_answer: userAnswer
    };

    // Make the API call to submit the answer
    fetch('http://127.0.0.1:5001/user/answer_question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response
        alert(data.message);
        if (data.correct) {
            // Update user stats, fetch a new question or update the UI accordingly
            getRandomQuestion(currentSubjectId, currentCategoryId);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your answer. Please try again.');
    });
}

