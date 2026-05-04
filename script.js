let tasks = JSON.parse(localStorage.getItem('deadlinr_tasks')) || [];
let userName = localStorage.getItem('deadlinr_user') || "";
let dashboardConfig = JSON.parse(localStorage.getItem('deadlinr_config')) || {
  tasks: true,
  timer: false,
  calendar: true,
  stats: true
};

let searchTerm = "";
let currentViewDate = new Date();
let timerSeconds = 1500;
let timerInterval = null;
let isTimerRunning = false;

window.onload = function() {
  if (userName) {
    setupApp(userName);
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app-container').classList.add('visible');
    document.getElementById('app-container').style.opacity = '1';
    document.getElementById('app-container').style.transform = 'scale(1)';
  }
  document.getElementById('date-subtitle').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  renderTasks();
  renderCalendar();
  applyDashboardConfig();
  updateTimerDisplay();
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
  if (!input.value.trim()) {
    input.style.borderColor = "#ef4444";
    return;
  }
  userName = input.value.trim();
  saveToStorage();
  setupApp(userName);
  document.getElementById('onboarding').style.opacity = '0';
  document.getElementById('onboarding').style.transform = 'translateY(-100%)';
  setTimeout(() => {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app-container').classList.add('visible');
    renderTasks();
    renderCalendar();
    applyDashboardConfig();
  }, 600);
}

function setupApp(name) {
  document.getElementById('welcome-text').textContent = `What's up, ${name}? 👋`;
  document.getElementById('side-name').textContent = name;
  document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&bold=true&rounded=true&size=128`;
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
      <div style="display:flex; align-items:center; gap:12px;">
        <i data-lucide="${WIDGETS[key].icon}" size="18"></i>
        <span style="font-weight:700;">${WIDGETS[key].name}</span>
      </div>
      <div class="toggle ${dashboardConfig[key] ? 'active' : ''}" onclick="toggleWidget('${key}')"></div>
    </div>
  `).join('');
  document.getElementById('custom-overlay').style.display = 'flex';
  lucide.createIcons();
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
  container.innerHTML = "";

  if (dashboardConfig.tasks) {
    container.innerHTML += `
      <section class="content-section card-tasks">
        <div class="section-header">
          <h2><i data-lucide="sparkles" size="20"></i> Priority Focus</h2>
        </div>
        <div id="dashboard-tasks" class="task-list"></div>
      </section>
    `;
  }
  if (dashboardConfig.timer) {
    container.innerHTML += `
      <section class="content-section card-focus" style="text-align:center;">
        <div class="section-header">
          <h2><i data-lucide="timer" size="20"></i> Active Focus Session</h2>
        </div>
        <div class="timer-display" style="font-size: 4rem; margin: 20px 0;">${document.getElementById('timer-display').textContent}</div>
        <button class="timer-btn start" style="padding: 10px 24px; font-size: 0.9rem;" onclick="navigate('timer')">Open Timer</button>
      </section>
    `;
  }
  if (dashboardConfig.calendar) {
    container.innerHTML += `
      <section class="content-section card-calendar">
        <div class="section-header">
          <h2><i data-lucide="calendar-days" size="20"></i> Monthly View</h2>
        </div>
        <div class="cal-grid" id="dashboard-calendar-grid" style="font-size:0.8rem; pointer-events:none;"></div>
      </section>
    `;
    setTimeout(renderDashboardCalendar, 10);
  }
  if (dashboardConfig.stats) {
    container.innerHTML += `
      <section class="content-section" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <div style="text-align:center;">
          <h4 style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:10px;">COMPLETED</h4>
          <div id="db-stat-perc" style="font-family:'Oswald'; font-size:2.5rem; color:var(--accent-green);">0%</div>
        </div>
        <div style="text-align:center;">
          <h4 style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:10px;">STREAK</h4>
          <div id="db-stat-streak" style="font-family:'Oswald'; font-size:2.5rem; color:var(--accent-blue);">0</div>
        </div>
      </section>
    `;
  }

  renderTasks();
  lucide.createIcons();
}

function renderDashboardCalendar() {
  const grid = document.getElementById('dashboard-calendar-grid');
  if (!grid) return;
  grid.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  let startDayIdx = firstDay.getDay() - 1;
  if (startDayIdx === -1) startDayIdx = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < 35; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    const dayNum = i - startDayIdx + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) {
      cell.innerHTML = `<div class="cal-day-num" style="font-size:0.8rem;">${dayNum}</div>`;
      const dateStr = new Date(year, month, dayNum).toISOString().split('T')[0];
      if (tasks.some(t => t.date === dateStr && !t.done)) {
        cell.style.background = "rgba(59, 130, 246, 0.1)";
      }
    } else {
      cell.style.opacity = "0.1";
    }
    grid.appendChild(cell);
  }
}

function calculatePriority(dueDate) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffTime < 0) return "Overdue";
  if (diffDays <= 2) return "High";
  if (diffDays <= 5) return "Medium";
  return "Low";
}

function renderTasks() {
  const dbList = document.getElementById('dashboard-tasks');
  const allList = document.getElementById('all-tasks-list');
  const prioFilter = document.getElementById('filter-prio')?.value || 'all';

  tasks.forEach(t => t.prio = calculatePriority(t.date));
  const filtered = tasks.filter(t => (t.name || "").toLowerCase().includes(searchTerm) && (prioFilter === 'all' || t.prio === prioFilter));

  const buildItem = (t) => `
    <div class="task-item" style="opacity: ${t.done ? 0.5 : 1}">
      <div class="task-icon" style="background: ${t.prio === 'Overdue' ? 'rgba(239, 68, 68, 0.1)' : t.prio === 'High' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'}">
        <i data-lucide="${t.done ? 'check-circle-2' : (t.prio === 'Overdue' ? 'alert-triangle' : 'circle')}" color="${t.prio === 'Overdue' ? '#ef4444' : '#3b82f6'}"></i>
      </div>
      <div class="task-info">
        <div style="font-weight: 700; font-size: 1rem; text-decoration: ${t.done ? 'line-through' : 'none'}">${t.name}</div>
      </div>
      <div class="task-actions">
        <button class="action-btn" onclick="toggleTask(${t.id})"><i data-lucide="check"></i></button>
        <button class="action-btn" onclick="deleteTask(${t.id})"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `;

  if (dbList) dbList.innerHTML = filtered.length ? filtered.slice(0, 4).map(buildItem).join('') : "<p style='color:var(--text-muted); font-size:0.9rem;'>No active tasks.</p>";
  if (allList) allList.innerHTML = filtered.length ? filtered.map(buildItem).join('') : "<p>No tasks found.</p>";

  lucide.createIcons();
  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const perc = total > 0 ? Math.round((done / total) * 100) : 0;

  if (document.getElementById('stat-total')) document.getElementById('stat-total').textContent = total;
  if (document.getElementById('stat-done')) document.getElementById('stat-done').textContent = done;
  if (document.getElementById('stat-overdue')) document.getElementById('stat-overdue').textContent = tasks.filter(t => t.prio === 'Overdue' && !t.done).length;
  if (document.getElementById('stat-high')) document.getElementById('stat-high').textContent = tasks.filter(t => t.prio === 'High' && !t.done).length;

  if (document.getElementById('stat-perc')) document.getElementById('stat-perc').textContent = perc + "%";
  if (document.getElementById('db-stat-perc')) document.getElementById('db-stat-perc').textContent = perc + "%";
  if (document.getElementById('db-stat-streak')) document.getElementById('db-stat-streak').textContent = done > 0 ? "1" : "0";
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.done = !t.done;
    saveToStorage();
    renderTasks();
    renderCalendar();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  saveToStorage();
  renderTasks();
  renderCalendar();
}

function openModal() {
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function addTask() {
  const name = document.getElementById('m-name').value;
  const date = document.getElementById('m-date').value;
  if (!name || !date) return;
  tasks.unshift({ id: Date.now(), name, date, done: false });
  saveToStorage();
  renderTasks();
  closeModal();
}

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  document.getElementById('timer-display').textContent = str;
  const widgetTimer = document.querySelector('#page-dashboard .timer-display');
  if (widgetTimer) widgetTimer.textContent = str;
}

function toggleTimer() {
  if (isTimerRunning) {
    clearInterval(timerInterval);
  } else {
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      }
    }, 1000);
  }
  isTimerRunning = !isTimerRunning;
  document.getElementById('timer-toggle').textContent = isTimerRunning ? "Pause Session" : "Resume Session";
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerSeconds = 1500;
  updateTimerDisplay();
  document.getElementById('timer-toggle').textContent = "Start Session";
}

function setTimer(m) {
  resetTimer();
  timerSeconds = m * 60;
  updateTimerDisplay();
}

function prevMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() + 1);
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const title = document.getElementById('cal-month-title');
  if (!grid || !title) return;
  grid.innerHTML = "";
  title.textContent = currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const year = currentViewDate.getFullYear(), month = currentViewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  let startDayIdx = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < 42; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    const d = i - startDayIdx + 1;
    if (d > 0 && d <= daysInMonth) {
      cell.innerHTML = `<div class="cal-day-num">${d}</div>`;
      const dateStr = new Date(year, month, d).toISOString().split('T')[0];
      if (tasks.some(t => t.date === dateStr && !t.done)) {
        cell.innerHTML += `<div class="cal-dots"><div class="dot" style="background:var(--accent-blue)"></div></div>`;
      }
    } else {
      cell.style.opacity = "0.2";
    }
    grid.appendChild(cell);
  }
}

function handleSearch(value) {
  searchTerm = value.toLowerCase();
  renderTasks();
}

window.onload = function() {
  if (userName) {
    setupApp(userName);
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app-container').classList.add('visible');
    document.getElementById('app-container').style.opacity = '1';
    document.getElementById('app-container').style.transform = 'scale(1)';
  }
  document.getElementById('date-subtitle').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  renderTasks();
  renderCalendar();
  applyDashboardConfig();
  updateTimerDisplay();
  lucide.createIcons();
};
