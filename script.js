const STORAGE_KEY = "deadlinr_master_data"; const CLASS_KEY = "deadlinr_classes"; const VISITS_KEY = "deadlinr_visits_per_day";
let masterData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let classes = JSON.parse(localStorage.getItem(CLASS_KEY)) || ["General"];
let visitsPerDay = JSON.parse(localStorage.getItem(VISITS_KEY)) || {};
let dashboardVisibility = JSON.parse(localStorage.getItem('dashboard_cards')) || { card-tasks: true, card-productivity: true, card-calendar: true, card-focus: true, card-today: true };
let currentWeekStart = getWeekStart(new Date()); let calendarAnimating = false;

function getWeekStart(date) { const d = new Date(date); d.setHours(0, 0, 0, 0); const day = d.getDay(); d.setDate(d.getDate() - day); return d; }
function formatDateKey(date) { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, "0"); const d = String(date.getDate()).padStart(2, "0"); return `${y}-${m}-${d}`; }

function trackVisit() { const todayKey = formatDateKey(new Date()); visitsPerDay[todayKey] = (visitsPerDay[todayKey] || 0) + 1; localStorage.setItem(VISITS_KEY, JSON.stringify(visitsPerDay)); }

function toggleTaskModal(show) {
    document.getElementById('task-modal').style.display = show ? 'flex' : 'none';
    if(show) { const classSelect = document.getElementById('modal-task-class'); classSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join(''); }
}

function saveModalTask() {
    const name = document.getElementById('modal-task-name').value;
    const date = document.getElementById('modal-task-date').value;
    const className = document.getElementById('modal-task-class').value;
    masterData.push({ name, class: className, status: "todo", date, priority: "med" });
    save(); renderAll(); toggleTaskModal(false);
}

function toggleDashboardCard(cardId) {
    dashboardVisibility[cardId] = !dashboardVisibility[cardId];
    localStorage.setItem('dashboard_cards', JSON.stringify(dashboardVisibility));
    renderDashboardVisibility();
}

function renderDashboardVisibility() {
    Object.keys(dashboardVisibility).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = dashboardVisibility[id] ? 'block' : 'none';
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    document.getElementById(`nav-${viewId}`).classList.add('active');
    renderAll();
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(masterData)); localStorage.setItem(CLASS_KEY, JSON.stringify(classes)); }
function renderAll() { renderDashboardVisibility(); renderTasksBoard(); renderCalendar(); renderProductivityChart(); }
function addClassFromPrompt() { const name = prompt("Enter New Class Name:"); if (name) { classes.push(name.trim()); save(); renderAll(); } }
function deleteClassFromPrompt() { const name = prompt("Delete Class:"); const idx = classes.indexOf(name.trim()); if (idx > -1) { classes.splice(idx, 1); save(); renderAll(); } }
function addRow() { masterData.push({ name: "", class: classes[0], status: "todo", date: "", priority: "med" }); save(); renderAll(); }
function goToTasksAndAdd() { switchView('tasks'); addRow(); }

window.onload = () => { trackVisit(); renderAll(); };
