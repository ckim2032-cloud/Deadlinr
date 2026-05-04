let tasks = JSON.parse(localStorage.getItem('deadlinr_tasks')) || [];
let userName = localStorage.getItem('deadlinr_user') || "";
let dashboardConfig = JSON.parse(localStorage.getItem('deadlinr_config')) || {
  tasks: true, timer: false, calendar: true, stats: true
};

let searchTerm = "";
let currentViewDate = new Date();
let timerSeconds = 1500;
let timerInterval = null;
let isTimerRunning = false;

window.onload = function() {
  renderTasks();
  renderCalendar();
  applyDashboardConfig();
  updateTimerDisplay();
  if (typeof lucide !== 'undefined') lucide.createIcons();

  if (userName) {
    setupApp(userName);
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app-container').style.opacity = '1';
  }
  document.getElementById('date-subtitle').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

function saveToStorage() {
  localStorage.setItem('deadlinr_tasks', JSON.stringify(tasks));
  localStorage.setItem('deadlinr_user', userName);
  localStorage.setItem('deadlinr_config', JSON.stringify(dashboardConfig));
}

function clearStorage() {
  localStorage.clear();
  location.reload();
}

function initApp() {
  const input = document.getElementById('user-name-input');
  if (!input.value.trim()) return;
  userName = input.value.trim();
  saveToStorage();
  setupApp(userName);
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app-container').style.opacity = '1';
}

function setupApp(name) {
  document.getElementById('welcome-text').textContent = `Hey, ${name}! 👋`;
  document.getElementById('side-name').textContent = name;
  document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&rounded=true&size=128`;
}

function navigate(pageId) {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.toggle('active', link.getAttribute('onclick').includes(pageId));
  });
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === `page-${pageId}`);
  });
  if (pageId === 'calendar') renderCalendar();
}

const WIDGETS = {
  tasks: { name: 'Focus List', icon: 'layers' },
  timer: { name: 'Focus Timer', icon: 'timer' },
  calendar: { name: 'Calendar', icon: 'calendar-days' },
  stats: { name: 'Analytics', icon: 'trending-up' }
};

function openCustomizer() {
  const list = document.getElementById('customizer-list');
  list.innerHTML = Object.keys(WIDGETS).map(key => `
    <div class="custom-option">
      <span>${WIDGETS[key].name}</span>
      <button onclick="toggleWidget('${key}')">${dashboardConfig[key] ? 'On' : 'Off'}</button>
    </div>
  `).join('');
  document.getElementById('custom-overlay').style.display = 'flex';
}

function closeCustomizer() {
  document.getElementById('custom-overlay').style.display = 'none';
  applyDashboardConfig();
}

function toggleWidget(key) {
  dashboardConfig[key] = !dashboardConfig[key];
  saveToStorage();
  openCustomizer();
}

function applyDashboardConfig() {
  const container = document.getElementById('dashboard-widgets');
  if(!container) return;
  container.innerHTML = "";
  if (dashboardConfig.tasks) container.innerHTML += `<div class="content-section"><h2>Priority Focus</h2><div id="dashboard-tasks" class="task-list"></div></div>`;
  if (dashboardConfig.timer) container.innerHTML += `<div class="content-section"><h2>Timer</h2><div class="timer-display">${document.getElementById('timer-display').textContent}</div></div>`;
  if (dashboardConfig.calendar) container.innerHTML += `<div class="content-section"><h2>Calendar</h2><div class="cal-grid" id="dashboard-calendar-grid"></div></div>`;
  renderTasks();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function calculatePriority(dueDate) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dueDate);
  const diffTime = due - today;
  if (diffTime < 0) return "Overdue";
  if (diffTime < 172800000) return "High";
  return "Low";
}

function renderTasks() {
  const dbList = document.getElementById('dashboard-tasks');
  const allList = document.getElementById('all-tasks-list');
  tasks.forEach(t => t.prio = calculatePriority(t.date));
  const filtered = tasks.filter(t => (t.name || "").toLowerCase().includes(searchTerm));

  const buildItem = (t) => `
    <div class="task-item">
      <div>${t.name}</div>
      <div class="task-actions">
        <button class="action-btn" onclick="toggleTask(${t.id})">✓</button>
        <button class="action-btn" onclick="deleteTask(${t.id})">✕</button>
      </div>
    </div>
  `;

  if (dbList) dbList.innerHTML = filtered.slice(0, 4).map(buildItem).join('');
  if (allList) allList.innerHTML = filtered.map(buildItem).join('');
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? {...t, done: !t.done} : t);
  saveToStorage(); renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  saveToStorage(); renderTasks();
}

function openModal() { document.getElementById('modal-overlay').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
function addTask() {
  const name = document.getElementById('m-name').value;
  const date = document.getElementById('m-date').value;
  if (!name || !date) return;
  tasks.unshift({ id: Date.now(), name, date, done: false });
  saveToStorage(); renderTasks(); closeModal();
}

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  document.getElementById('timer-display').textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function toggleTimer() {
  if (isTimerRunning) clearInterval(timerInterval);
  else timerInterval = setInterval(() => { if(timerSeconds>0) {timerSeconds--; updateTimerDisplay();} }, 1000);
  isTimerRunning = !isTimerRunning;
}

function resetTimer() { clearInterval(timerInterval); isTimerRunning=false; timerSeconds=1500; updateTimerDisplay(); }

function setTimer(m) { timerSeconds = m * 60; updateTimerDisplay(); }

function prevMonth() { currentViewDate.setMonth(currentViewDate.getMonth() - 1); renderCalendar(); }
function nextMonth() { currentViewDate.setMonth(currentViewDate.getMonth() + 1); renderCalendar(); }

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.innerHTML = "";
  const year = currentViewDate.getFullYear(), month = currentViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    grid.innerHTML += `<div class="cal-cell">${i}</div>`;
  }
}

function handleSearch(v) { searchTerm = v.toLowerCase(); renderTasks(); }
