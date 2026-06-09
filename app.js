// --- Configuration & Elements ---
const form = document.getElementById('tracker-form');
const dateInput = document.getElementById('date');
const hoursInput = document.getElementById('hours');
const quoteContainer = document.getElementById('quote-container');
const themeToggleBtn = document.getElementById('theme-toggle');

dateInput.valueAsDate = new Date();
let myChart = null;

// --- Theme Logic ---
let isLightMode = localStorage.getItem('theme') === 'light';

function applyTheme() {
    if (isLightMode) {
        document.body.classList.add('light-mode');
        themeToggleBtn.textContent = '🌙 Dark Mode';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleBtn.textContent = '☀️ Light Mode';
    }
}

// Apply initial theme on load
applyTheme();

themeToggleBtn.addEventListener('click', () => {
    isLightMode = !isLightMode;
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    applyTheme();
    updateUI(); // Redraw chart with new colors
});

// --- Quotes Array ---
const quotes = [
    "Consistency is what transforms average into excellence.",
    "The expert in anything was once a beginner.",
    "Small disciplines repeated with consistency every day lead to great achievements.",
    "Don't stop when you're tired. Stop when you're done.",
    "Focus on being productive instead of busy.",
    "Success is the sum of small efforts, repeated day in and day out."
];

// --- Pre-loaded Historical Data ---
const historicalData = [
    { date: "2026-05-11", hours: 3 }, { date: "2026-05-12", hours: 2 },
    { date: "2026-05-13", hours: 5.5 }, { date: "2026-05-14", hours: 3 },
    { date: "2026-05-15", hours: 4.5 }, { date: "2026-05-16", hours: 4 },
    { date: "2026-05-17", hours: 4 }, { date: "2026-05-18", hours: 7.5 },
    { date: "2026-05-19", hours: 2 }, { date: "2026-05-20", hours: 5.5 },
    { date: "2026-05-21", hours: 5 }, { date: "2026-05-22", hours: 1 },
    { date: "2026-05-23", hours: 2.5 }, { date: "2026-05-24", hours: 4 },
    { date: "2026-05-25", hours: 5 }, { date: "2026-05-26", hours: 3 },
    { date: "2026-05-27", hours: 4.5 }, { date: "2026-05-28", hours: 5 },
    { date: "2026-05-29", hours: 3 }, { date: "2026-05-30", hours: 0 },
    { date: "2026-05-31", hours: 0 }, { date: "2026-06-01", hours: 0 },
    { date: "2026-06-02", hours: 6 }, { date: "2026-06-03", hours: 6.5 },
    { date: "2026-06-04", hours: 8 }, { date: "2026-06-05", hours: 7 },
    { date: "2026-06-06", hours: 7 }, { date: "2026-06-07", hours: 7 },
    { date: "2026-06-08", hours: 8 }
];

let sessions = JSON.parse(localStorage.getItem('studyDB_v2'));
if (!sessions || sessions.length === 0) {
    sessions = historicalData;
    localStorage.setItem('studyDB_v2', JSON.stringify(sessions));
}

// --- Core Logic ---
function updateUI() {
    let totalHours = 0;
    const hoursByDate = {};
    
    sessions.forEach(session => {
        const hrs = parseFloat(session.hours);
        totalHours += hrs;
        hoursByDate[session.date] = (hoursByDate[session.date] || 0) + hrs;
    });

    const sortedDates = Object.keys(hoursByDate).sort();
    const activeDaysCount = sortedDates.filter(date => hoursByDate[date] > 0).length;
    const avgHours = activeDaysCount > 0 ? (totalHours / activeDaysCount).toFixed(1) : 0;
    
    let streak = 0;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (hoursByDate[sortedDates[i]] > 0) {
            streak++;
        } else {
            break;
        }
    }

    document.getElementById('total-hours').textContent = totalHours.toFixed(1);
    document.getElementById('avg-hours').innerHTML = `${avgHours} <span>hrs</span>`;
    document.getElementById('streak-days').innerHTML = `${streak} <span>days</span>`;

    updateChart(sortedDates, hoursByDate);
}

function updateChart(sortedDates, hoursByDate) {
    const ctx = document.getElementById('studyChart').getContext('2d');
    const dataPoints = sortedDates.map(date => hoursByDate[date]);

    if (myChart) myChart.destroy();

    const formattedLabels = sortedDates.map(dateStr => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    });

    // Dynamic colors based on theme
    const lineColor = isLightMode ? '#111111' : '#ffffff';
    const bgColor = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const gridColor = isLightMode ? '#dddddd' : '#222222';
    const textColor = isLightMode ? '#555555' : '#888888';

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedLabels,
            datasets: [{
                label: 'Hours',
                data: dataPoints,
                borderColor: lineColor,
                backgroundColor: bgColor,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: lineColor,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 10 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteContainer.textContent = `"${quotes[randomIndex]}"`;
}

// --- Event Listeners ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const existingIndex = sessions.findIndex(s => s.date === dateInput.value);
    
    if (existingIndex >= 0) {
        sessions[existingIndex].hours = (parseFloat(sessions[existingIndex].hours) + parseFloat(hoursInput.value)).toString();
    } else {
        sessions.push({ date: dateInput.value, hours: hoursInput.value });
    }

    localStorage.setItem('studyDB_v2', JSON.stringify(sessions));
    hoursInput.value = '';
    updateUI();
});

displayRandomQuote();
updateUI();
