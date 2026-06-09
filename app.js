const form = document.getElementById('tracker-form');
const dateInput = document.getElementById('date');
const subjectInput = document.getElementById('subject');
const hoursInput = document.getElementById('hours');
const logList = document.getElementById('log-list');
const totalHoursEl = document.getElementById('total-hours');
const clearBtn = document.getElementById('clear-btn');

// Set today's date as default in the form
dateInput.valueAsDate = new Date();

let sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
let myChart = null; // Variable to hold our chart instance

function updateUI() {
    logList.innerHTML = '';
    let total = 0;
    
    // Object to group hours by date for the graph
    const hoursByDate = {};

    sessions.forEach((session) => {
        const hrs = parseFloat(session.hours);
        total += hrs;
        
        // Populate List
        const li = document.createElement('li');
        li.className = 'log-item';
        li.innerHTML = `
            <span><strong>${session.date}</strong> - ${session.subject}</span>
            <span>${session.hours} hrs</span>
        `;
        logList.appendChild(li);

        // Group data for the chart
        if (hoursByDate[session.date]) {
            hoursByDate[session.date] += hrs;
        } else {
            hoursByDate[session.date] = hrs;
        }
    });

    totalHoursEl.textContent = total.toFixed(1);

    // Update the Chart
    updateChart(hoursByDate);
}

function updateChart(hoursByDate) {
    const ctx = document.getElementById('studyChart').getContext('2d');
    
    // Sort dates chronologically
    const sortedDates = Object.keys(hoursByDate).sort();
    const dataPoints = sortedDates.map(date => hoursByDate[date]);

    // If chart exists, destroy it before redrawing to prevent overlap
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Study Hours',
                data: dataPoints,
                borderColor: '#00adb5',
                backgroundColor: 'rgba(0, 173, 181, 0.2)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#00adb5',
                tension: 0.1 // Gives it that slight curve or straight line look
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#333' } // Dark theme grid lines
                },
                x: {
                    grid: { color: '#333' }
                }
            },
            plugins: {
                legend: { display: false } // Hide legend to look more like your image
            }
        }
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSession = {
        date: dateInput.value,
        subject: subjectInput.value,
        hours: hoursInput.value
    };
    sessions.push(newSession);
    localStorage.setItem('studySessions', JSON.stringify(sessions));
    form.reset();
    dateInput.valueAsDate = new Date(); // Reset date to today
    updateUI();
});

clearBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to delete all logged hours?')) {
        sessions = [];
        localStorage.removeItem('studySessions');
        updateUI();
    }
});

updateUI();
