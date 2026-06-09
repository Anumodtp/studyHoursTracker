// --- Configuration & Elements ---
const form = document.getElementById('tracker-form');
const dateInput = document.getElementById('date');
const hoursInput = document.getElementById('hours');
const quoteContainer = document.getElementById('quote-container');
const themeToggleBtn = document.getElementById('theme-toggle');
const monthSelect = document.getElementById('month-select');

let myChart = null;

// --- Theme Logic ---
let isLightMode = localStorage.getItem('theme') === 'light';

function applyTheme() {
    if (isLightMode) {
        document.body.classList.add('light-mode');
        themeToggleBtn.textContent = '🌙';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleBtn.textContent = '☀️';
    }
}

applyTheme();

themeToggleBtn.addEventListener('click', () => {
    isLightMode = !isLightMode;
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    applyTheme();
    updateUI(); 
});

// --- View Change Event ---
monthSelect.addEventListener('change', () => {
    updateUI();
});

// --- Quotes Array ---
const quotes = [
    "Chase Goals instead of Holes. - Shafi",
    "Consistency is what transforms average into excellence.",
    "The expert in anything was once a beginner.",
    "Small disciplines repeated with consistency every day lead to great achievements.",
    "Don't stop when you're tired. Stop when you're done.",
    "Focus on being productive instead of busy.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "It always seems impossible until it's done.",
    "The future depends on what you do today.",
    "Strive for progress, not perfection.",
    "Do something today that your future self will thank you for.",
    "There are no shortcuts to any place worth going.",
    "Discipline is choosing between what you want now and what you want most.",
    "Motivation gets you going, but discipline keeps you growing.",
    "You don't have to be great to start, but you have to start to be great.",
    "Doubt kills more dreams than failure ever will.",
    "The secret of getting ahead is getting started."
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

function populateMonthsDropdown() {
    const months = new Set();
    sessions.forEach(s => {
        months.add(s.date.substring(0, 7)); 
    });
    
    const sortedMonths = Array.from(months).sort().reverse(); 
    const currentVal = monthSelect.value;
    
    monthSelect.innerHTML = '<option value="all">All Time</option>';
    
    sortedMonths.forEach(m => {
        const [year, month] = m.split('-');
        const dateObj = new Date(year, month - 1);
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const option = document.createElement('option');
        option.value = m;
        option.textContent = monthName;
        monthSelect.appendChild(option);
    });
    
    if (currentVal && (sortedMonths.includes(currentVal) || currentVal === 'all')) {
        monthSelect.value = currentVal;
    } else {
        monthSelect.value = 'all'; // Default
    }
}

function getNextDayStr(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const nextDate = new Date(year, month - 1, day);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextDate.getDate()).padStart(2, '0');
    
    return `${nextYear}-${nextMonth}-${nextDay}`;
}

if (sessions.length > 0) {
    const sortedDates = sessions.map(s => s.date).sort();
    const latestDate = sortedDates[sortedDates.length - 1];
    dateInput.value = getNextDayStr(latestDate);
} else {
    dateInput.valueAsDate = new Date();
}

// --- Core Logic ---
function updateUI() {
    const allHoursByDate = {};
    
    sessions.forEach(session => {
        const hrs = parseFloat(session.hours);
        allHoursByDate[session.date] = (allHoursByDate[session.date] || 0) + hrs;
    });

    const allSortedDates = Object.keys(allHoursByDate).sort();
    const selectedView = monthSelect.value;
    
    // Filter dates based on dropdown
    let displayDates = allSortedDates;
    if (selectedView !== 'all') {
        displayDates = allSortedDates.filter(date => date.startsWith(selectedView));
    }

    // Calculate Stats
    let totalHours = 0;
    displayDates.forEach(date => totalHours += allHoursByDate[date]);

    const activeDaysCount = displayDates.filter(date => allHoursByDate[date] > 0).length;
    const avgHours = activeDaysCount > 0 ? (totalHours / activeDaysCount).toFixed(1) : 0;
    
    let streak = 0;
    if (displayDates.length > 0) {
        // Start counting backwards from the most recent date on the graph
        let checkDate = new Date(displayDates[displayDates.length - 1]);
        
        while (true) {
            // Format date to match your database (YYYY-MM-DD)
            const year = checkDate.getFullYear();
            const month = String(checkDate.getMonth() + 1).padStart(2, '0');
            const day = String(checkDate.getDate()).padStart(2, '0');
            const dateStrToCheck = `${year}-${month}-${day}`;

            // If this specific calendar day has more than 0 hours, increase streak
            if (allHoursByDate[dateStrToCheck] > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1); // Move backward exactly 1 day
            } else {
                break; // Streak broken by a 0 OR a completely missing day
            }
        }
    }


    document.getElementById('total-hours').textContent = totalHours.toFixed(1);
    document.getElementById('avg-hours').innerHTML = `${avgHours} <span>hrs</span>`;
    document.getElementById('streak-days').innerHTML = `${streak} <span>days</span>`;

    updateChart(displayDates, allHoursByDate);
}

function updateChart(displayDates, allHoursByDate) {
    const ctx = document.getElementById('studyChart').getContext('2d');
    const dataPoints = displayDates.map(date => allHoursByDate[date]);

    if (myChart) myChart.destroy();

    const formattedLabels = displayDates.map(dateStr => {
        const d = new Date(dateStr);
        const day = d.toLocaleDateString('en-US', { day: '2-digit' });
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        return [day, month]; 
    });

    const lineColor = isLightMode ? '#111111' : '#ffffff';
    const bgColor = isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const gridColor = isLightMode ? '#dddddd' : '#222222';
    const textColor = isLightMode ? '#555555' : '#888888';

    // Smart Scaling: Hide dots if there are too many data points to prevent clutter
    const dynamicPointRadius = displayDates.length > 60 ? 0 : 1;

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
                pointRadius: dynamicPointRadius,
                pointHoverRadius: 5,
                pointBackgroundColor: lineColor,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: gridColor }, 
                    ticks: { color: textColor } 
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { 
                        color: textColor, 
                        maxTicksLimit: 15, // Keeps text readable no matter how much data exists
                        maxRotation: 0,
                        font: { size: 10 } 
                    } 
                }
            },
            plugins: { legend: { display: false } },
            interaction: {
                mode: 'nearest',
                intersect: false,
            }
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
    
    populateMonthsDropdown(); 
    
    dateInput.value = getNextDayStr(dateInput.value);
    hoursInput.value = '';
    
    updateUI();
});

// Initialization
populateMonthsDropdown();
displayRandomQuote();
updateUI();
