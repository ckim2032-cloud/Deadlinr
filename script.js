const STORAGE_KEY = "deadlinr_master_data";
const CLASS_KEY = "deadlinr_classes";

let masterData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let classes = JSON.parse(localStorage.getItem(CLASS_KEY)) || ["General"];
let currentWeekStart = getWeekStart(new Date());
let calendarAnimating = false;

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  document.getElementById(`nav-${viewId}`).classList.add('active');
  renderAll();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(masterData));
  localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
  updateStats();
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
  }
}

function deleteTask(index) {
  masterData.splice(index, 1);
  save();
  renderAll();
}

function calculatePriority(dueDate, status) {
  if (!dueDate) return { label: 'Low', class: 'prio-low', score: 0 };
  const today = new Date().toISOString().split('T')[0];

  if (status !== 'done' && dueDate < today) {
    return { label: 'Overdue', class: 'prio-overdue', score: 4 };
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

  document.getElementById('stat-total').textContent = masterData.length;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-progress').textContent = progress;
  document.getElementById('stat-overdue').textContent = overdue;
}

function renderAll() {
  renderMainTable();
  renderTasksBoard();
  renderCalendar();
  renderProjects();
  updateStats();
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
}

function animateWeek(direction, newStart) {
  if (calendarAnimating) return;
  const wrap = document.getElementById("calendar-viewport");
  const grid = document.getElementById("calendar-grid");
  if (!wrap || !grid) return;

  calendarAnimating = true;
  const offset = direction === "next" ? -80 : 80;

  grid.style.transition = "transform 220ms ease, opacity 220ms ease";
  grid.style.transform = `translateX(${offset}px)`;
  grid.style.opacity = "0";

  setTimeout(() => {
    currentWeekStart = newStart;
    renderCalendar(false);
    grid.style.transition = "none";
    grid.style.transform = `translateX(${-offset}px)`;
    grid.style.opacity = "0";
    requestAnimationFrame(() => {
      grid.style.transition = "transform 220ms ease, opacity 220ms ease";
      grid.style.transform = "translateX(0)";
      grid.style.opacity = "1";
    });
    setTimeout(() => {
      calendarAnimating = false;
    }, 240);
  }, 220);
}

function prevWeek() {
  const newStart = getWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  animateWeek("prev", newStart);
}

function nextWeek() {
  const newStart = getWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  animateWeek("next", newStart);
}

function todayView() {
  const newStart = getWeekStart(new Date());
  animateWeek("next", newStart);
}

function renderCalendar(skipWeekLabel = false) {
  const grid = document.getElementById("calendar-grid");
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
    const label = document.getElementById("week-range");
    if (label) {
      label.textContent = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  }
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
}

window.onload = () => {
  renderAll();
  const hour = new Date().getHours();
  const msg = hour < 12 ? "Good morning!" : hour < 17 ? "Good afternoon!" : "Good evening!";
  document.getElementById('welcomeMessage').textContent = msg;
};
