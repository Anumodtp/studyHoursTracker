// DOM Elements
const form = document.getElementById('tracker-form');
const subjectInput = document.getElementById('subject');
const hoursInput = document.getElementById('hours');
const logList = document.getElementById('log-list');
const totalHoursEl = document.getElementById('total-hours');
const clearBtn = document.getElementById('clear-btn');

// Load initial data from localStorage
let sessions = JSON.parse(localStorage.getItem('studySessions')) || [];

// Function to update the UI
function updateUI() {
    // Clear current list
    logList.innerHTML = '';
    
    let total = 0;

    // Populate list and calculate total
    sessions.forEach((session, index) => {
        total += parseFloat(session.hours);
        
        const li = document.createElement('li');
        li.className = 'log-item';
        li.innerHTML = `
            <span><strong>${session.subject}</strong></span>
            <span>${session.hours} hrs</span>
        `;
        logList.appendChild(li);
    });

    // Update total display
    totalHoursEl.textContent = total.toFixed(1);
}

// Handle Form Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newSession = {
        subject: subjectInput.value,
        hours: hoursInput.value
    };

    sessions.push(newSession);
    localStorage.setItem('studySessions', JSON.stringify(sessions));
    
    // Reset form and update view
    form.reset();
    updateUI();
});

// Handle Clear Data
clearBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to delete all logged hours?')) {
        sessions = [];
        localStorage.removeItem('studySessions');
        updateUI();
    }
});

// Run UI update on initial load
updateUI();
