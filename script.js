const STORAGE_KEY = "deadlinr_master_data";
const CLASS_KEY = "deadlinr_classes";
const VISITS_KEY = "deadlinr_visits_per_day";

let masterData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let classes = JSON.parse(localStorage.getItem(CLASS_KEY)) || ["General"];
let visitsPerDay = JSON.parse(localStorage.getItem(VISITS_KEY)) || {};
let currentWeekStart = getWeekStart(new Date());
let calendarAnimating = false;

let focusDuration = 25 * 60;
let focusRemaining = focusDuration;
let focusInterval = null;

trackVisit();

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}
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

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
function saveToStorage() {
  localStorage.setItem('deadlinr_tasks', JSON.stringify(tasks));
  localStorage.setItem('deadlinr_user', userName);
  localStorage.setItem('deadlinr_config', JSON.stringify(dashboardConfig));
}

function trackVisit() {
  const todayKey = formatDateKey(new Date());
  const existing = visitsPerDay[todayKey] || 0;
  visitsPerDay[todayKey] = existing + 1;
  localStorage.setItem(VISITS_KEY, JSON.stringify(visitsPerDay));
function clearStorage() {
  localStorage.clear();
  location.reload();
}

function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const targetView = document.getElementById(`view-${viewId}`);
  const targetNav = document.getElementById(`nav-${viewId}`);
  if (targetView) targetView.classList.add('active');
  if (targetNav) targetNav.classList.add('active');
  renderAll();
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

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(masterData));
  localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
  updateStats();
function setupApp(name) {
  document.getElementById('welcome-text').textContent = `What's up, ${name}? 👋`;
  document.getElementById('side-name').textContent = name;
  document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&bold=true&rounded=true&size=128`;
}

function addClassFromPrompt() {
  const name = prompt("Enter New Class Name:");
  if (name && name.trim()) {
    const cleanName = name.trim();
    if (!classes.includes(cleanName)) {
      classes.push(cleanName);
      save();
      renderAll();
    }
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

function deleteClassFromPrompt() {
  const name = prompt("Type the name of the class to DELETE exactly:");
  if (name) {
    const cleanName = name.trim();
    const index = classes.indexOf(cleanName);
    if (index > -1) {
      classes.splice(index, 1);
      if (classes.length === 0) classes.push("General");
      masterData.forEach(t => {
        if (t.class === cleanName) t.class = classes[0];
      });
      save();
      renderAll();
    }
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

function addRow() {
  masterData.push({
    name: "",
    class: classes[0],
    status: "todo",
    date: "",
    priority: "med"
  });
  save();
  renderAll();
function closeCustomizer() {
  document.getElementById('custom-overlay').style.display = 'none';
  applyDashboardConfig();
}

function goToTasksAndAdd() {
  addRow();
  switchView('tasks');
function toggleWidget(key) {
  dashboardConfig[key] = !dashboardConfig[key];
  saveToStorage();
  openCustomizer();
}

function updateTask(index, key, val) {
  if (masterData[index]) {
    masterData[index][key] = val;
    save();
    if (key === 'date' || key === 'status') {
      renderAll();
    } else {
      renderTasksBoard();
      updateStats();
    }
    if (key === 'name' || key === 'date' || key === 'status') {
      pickTodaysThree();
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
}

function deleteTask(index) {
  masterData.splice(index, 1);
  save();
  renderAll();
  pickTodaysThree();
  renderTasks();
  lucide.createIcons();
}

function calculatePriority(dueDate, status) {
  if (!dueDate) return { label: 'Low', class: 'prio-low', score: 0 };
  const today = new Date().toISOString().split('T')[0];
  if (status !== 'done' && dueDate < today) {
    return { label: 'Overdue', class: 'prio-overdue', score: 4 };
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
  const todayObj = new Date();
  const dueObj = new Date(dueDate);
  const diffDays = Math.ceil((dueObj - todayObj) / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return { label: 'High', class: 'prio-high', score: 3 };
  if (diffDays <= 7) return { label: 'Med', class: 'prio-med', score: 2 };
  return { label: 'Low', class: 'prio-low', score: 1 };
}

function updateStats() {
  const today = new Date().toISOString().split('T')[0];
  const done = masterData.filter(t => t.status === 'done').length;
  const progress = masterData.filter(t => t.status === 'in-progress').length;
  const overdue = masterData.filter(t => t.status !== 'done' && t.date && t.date < today).length;
  const totalEl = document.getElementById('stat-total');
  const doneEl = document.getElementById('stat-done');
  const progEl = document.getElementById('stat-progress');
  const overdueEl = document.getElementById('stat-overdue');
  if (totalEl) totalEl.textContent = masterData.length;
  if (doneEl) doneEl.textContent = done;
  if (progEl) progEl.textContent = progress;
  if (overdueEl) overdueEl.textContent = overdue;
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

function renderAll() {
  renderMainTable();
  renderTasksBoard();
  renderCalendar();
  renderProjects();
  renderProductivityChart();
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
  pickTodaysThree();
}

function renderMainTable() {
  const tbody = document.querySelector("#main-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  masterData.forEach((task, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="assignment-input" value="${task.name}" oninput="updateTask(${index}, 'name', this.value)"></td>
      <td><select class="class-select" onchange="updateTask(${index}, 'class', this.value)">
        ${classes.map(c => `<option value="${c}" ${task.class === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select></td>
      <td><select class="status-select" onchange="updateTask(${index}, 'status', this.value)">
        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
      </select></td>
      <td><input type="date" class="due-date-input" value="${task.date}" onchange="updateTask(${index}, 'date', this.value)"></td>
      <td><button class="delete-row-btn" onclick="deleteTask(${index})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
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

function renderTasksBoard() {
  const today = new Date().toISOString().split('T')[0];
  const lists = {
    todo: document.querySelector("#col-todo .task-list"),
    progress: document.querySelector("#col-progress .task-list"),
    done: document.querySelector("#col-done .task-list"),
    overdue: document.querySelector("#col-overdue .task-list")
  };
  if (!lists.todo) return;
  Object.values(lists).forEach(l => l.innerHTML = "");
  masterData.forEach(t => {
    let key = t.status === 'in-progress' ? 'progress' : t.status;
    if (t.status !== 'done' && t.date && t.date < today) key = 'overdue';
    const card = document.createElement("div");
    card.className = "mini-task-card";
    card.innerHTML = `<span class="tag">${t.class}</span><div><strong>${t.name || '...'}</strong></div><small>${t.date || 'No date'}</small>`;
    if (lists[key]) lists[key].appendChild(card);
  });
function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.done = !t.done;
    saveToStorage();
    renderTasks();
    renderCalendar();
  }
}

function animateWeek(direction, newStart) {
  if (calendarAnimating) return;
  const gridMain = document.getElementById("calendar-grid");
  const gridSecondary = document.getElementById("calendar-grid-secondary");
  const grids = [gridMain, gridSecondary].filter(Boolean);
  if (grids.length === 0) return;
  calendarAnimating = true;
  const offset = direction === "next" ? -80 : 80;
  grids.forEach(g => {
    g.style.transition = "transform 220ms ease, opacity 220ms ease";
    g.style.transform = `translateX(${offset}px)`;
    g.style.opacity = "0";
  });
  setTimeout(() => {
    currentWeekStart = newStart;
    renderCalendar(true);
    grids.forEach(g => {
      g.style.transition = "none";
      g.style.transform = `translateX(${-offset}px)`;
      g.style.opacity = "0";
      requestAnimationFrame(() => {
        g.style.transition = "transform 220ms ease, opacity 220ms ease";
        g.style.transform = "translateX(0)";
        g.style.opacity = "1";
      });
    });
    setTimeout(() => {
      calendarAnimating = false;
    }, 240);
  }, 220);
function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  saveToStorage();
  renderTasks();
  renderCalendar();
}

function prevWeek() {
  const newStart = getWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  animateWeek("prev", newStart);
function openModal() {
  document.getElementById('modal-overlay').style.display = 'flex';
}

function nextWeek() {
  const newStart = getWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  animateWeek("next", newStart);
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function todayView() {
  const newStart = getWeekStart(new Date());
  animateWeek("next", newStart);
function addTask() {
  const name = document.getElementById('m-name').value;
  const date = document.getElementById('m-date').value;
  if (!name || !date) return;
  tasks.unshift({ id: Date.now(), name, date, done: false });
  saveToStorage();
  renderTasks();
  closeModal();
}

function renderCalendar(skipWeekLabel) {
  const gridMain = document.getElementById("calendar-grid");
  const gridSecondary = document.getElementById("calendar-grid-secondary");
  const grids = [
    { grid: gridMain, labelId: "week-range" },
    { grid: gridSecondary, labelId: "week-range-secondary" }
  ];
  grids.forEach(({ grid, labelId }) => {
    if (!grid) return;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDates = [];
    grid.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      weekDates.push(date);
      const header = document.createElement("div");
      header.className = "calendar-header";
      header.innerHTML = `
        <div class="calendar-header-day">${days[i]}</div>
        <div class="calendar-header-date">${date.getDate()}</div>
      `;
      grid.appendChild(header);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    weekDates.forEach(date => {
      const dayCell = document.createElement("div");
      dayCell.className = "calendar-day";
      const dateCopy = new Date(date);
      dateCopy.setHours(0, 0, 0, 0);
      if (dateCopy.toDateString() === today.toDateString()) {
        dayCell.classList.add("today");
      }
      const dateStr = formatDateKey(date);
      const dayTasks = masterData.filter(task => task.date === dateStr);
      dayCell.innerHTML = `
        <div class="calendar-day-top">
          <span class="calendar-day-number">${date.getDate()}</span>
          <span class="calendar-day-month">${date.toLocaleDateString('en-US', { month: 'short' })}</span>
        </div>
        <div class="calendar-day-events">
          ${dayTasks.map(task => `
            <div class="calendar-task-widget status-${task.status}">
              <div class="calendar-task-name">${task.name || 'Untitled'}</div>
              <div class="calendar-task-class">${task.class || 'General'}</div>
              <div class="calendar-task-status">${task.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
            </div>
          `).join('')}
        </div>
      `;
      grid.appendChild(dayCell);
    });
    if (!skipWeekLabel) {
      const endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 6);
      const label = document.getElementById(labelId);
      if (label) {
        label.textContent = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
    }
  });
function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  document.getElementById('timer-display').textContent = str;
  const widgetTimer = document.querySelector('#page-dashboard .timer-display');
  if (widgetTimer) widgetTimer.textContent = str;
}

function getLastNDaysVisits(n) {
  const labels = [];
  const values = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    values.push(visitsPerDay[key] || 0);
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
  return { labels, values };
  isTimerRunning = !isTimerRunning;
  document.getElementById('timer-toggle').textContent = isTimerRunning ? "Pause Session" : "Resume Session";
}

function renderProductivityChart() {
  const canvas = document.getElementById("productivity-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const { labels, values } = getLastNDaysVisits(14);
  const maxVal = Math.max(1, ...values);
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 26;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, paddingTop + chartHeight);
  ctx.lineTo(paddingLeft + chartWidth, paddingTop + chartHeight);
  ctx.stroke();
  ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
  ctx.font = "10px Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const val = Math.round((maxVal / ticks) * i);
    const y = paddingTop + chartHeight - (chartHeight * (val / maxVal));
    ctx.fillText(String(val), paddingLeft - 6, y);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const stepX = chartWidth / Math.max(1, labels.length - 1);
  labels.forEach((label, i) => {
    const x = paddingLeft + i * stepX;
    const y = paddingTop + chartHeight + 4;
    ctx.fillText(label, x, y);
  });
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
  ctx.beginPath();
  values.forEach((val, i) => {
    const x = paddingLeft + i * stepX;
    const y = paddingTop + chartHeight - (chartHeight * (val / maxVal));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  values.forEach((val, i) => {
    const x = paddingLeft + i * stepX;
    const y = paddingTop + chartHeight - (chartHeight * (val / maxVal));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(paddingLeft + chartWidth, paddingTop + chartHeight);
  ctx.lineTo(paddingLeft, paddingTop + chartHeight);
  ctx.closePath();
  ctx.fill();
function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerSeconds = 1500;
  updateTimerDisplay();
  document.getElementById('timer-toggle').textContent = "Start Session";
}

function renderProjects() {
  const body = document.getElementById("projects-body");
  if (!body) return;
  body.innerHTML = "";
  const sorted = [...masterData]
    .map(t => ({ ...t, prio: calculatePriority(t.date, t.status) }))
    .sort((a, b) => {
      if (b.prio.score !== a.prio.score) return b.prio.score - a.prio.score;
      return (a.date || '9999').localeCompare(b.date || '9999');
    });
  sorted.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="priority-badge ${t.prio.class}">${t.prio.label}</span></td>
      <td><strong>${t.name || 'Untitled'}</strong></td>
      <td>${t.class}</td>
      <td>${t.date || 'No Date'}</td>
    `;
    body.appendChild(tr);
  });
function setTimer(m) {
  resetTimer();
  timerSeconds = m * 60;
  updateTimerDisplay();
}

function setTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('light-btn').classList.add('active');
    document.getElementById('dark-btn').classList.remove('active');
  } else {
    document.body.classList.remove('light-theme');
    document.getElementById('dark-btn').classList.add('active');
    document.getElementById('light-btn').classList.remove('active');
  }
function prevMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() - 1);
  renderCalendar();
}

function updateFocusDisplay() {
  const el = document.getElementById("focus-time-display");
  if (!el) return;
  const minutes = Math.floor(focusRemaining / 60).toString().padStart(2, "0");
  const seconds = (focusRemaining % 60).toString().padStart(2, "0");
  el.textContent = `${minutes}:${seconds}`;
function nextMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() + 1);
  renderCalendar();
}

function startFocusTimer() {
  if (focusInterval || focusRemaining <= 0) return;
  focusInterval = setInterval(() => {
    focusRemaining--;
    if (focusRemaining <= 0) {
      focusRemaining = 0;
      clearInterval(focusInterval);
      focusInterval = null;
      alert("Focus session complete!");
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
    updateFocusDisplay();
  }, 1000);
}

function pauseFocusTimer() {
  if (focusInterval) {
    clearInterval(focusInterval);
    focusInterval = null;
    grid.appendChild(cell);
}
}

function resetFocusTimer() {
  pauseFocusTimer();
  focusRemaining = focusDuration;
  updateFocusDisplay();
function handleSearch(value) {
  searchTerm = value.toLowerCase();
  renderTasks();
}

function pickTodaysThree() {
  const inputs = [
    document.getElementById("today-1"),
    document.getElementById("today-2"),
    document.getElementById("today-3")
  ];
  if (!inputs[0]) return;
  inputs.forEach(i => i.value = "");
  const candidates = masterData.filter(t => t.status !== "done" && t.name && t.name.trim());
  if (candidates.length === 0) {
    inputs.forEach(i => i.placeholder = "No tasks yet");
    return;
  }
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  const picks = shuffled.slice(0, 3);
  picks.forEach((t, idx) => {
    if (inputs[idx]) {
      inputs[idx].value = t.name;
      inputs[idx].placeholder = "";
    }
  });
  for (let i = picks.length; i < 3; i++) {
    if (inputs[i]) {
      inputs[i].value = "";
      inputs[i].placeholder = "No more tasks";
    }
window.onload = function() {
  if (userName) {
    setupApp(userName);
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app-container').classList.add('visible');
    document.getElementById('app-container').style.opacity = '1';
    document.getElementById('app-container').style.transform = 'scale(1)';
}
}

window.onload = () => {
  renderAll();
  const hour = new Date().getHours();
  const msg = hour < 12 ? "Good morning!" : hour < 17 ? "Good afternoon!" : "Good evening!";
  const el = document.getElementById('welcomeMessage');
  if (el) el.textContent = msg;
  updateFocusDisplay();
  window.addEventListener("resize", () => {
    renderProductivityChart();
  });
  document.getElementById('date-subtitle').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  renderTasks();
  renderCalendar();
  applyDashboardConfig();
  updateTimerDisplay();
  lucide.createIcons();
};
