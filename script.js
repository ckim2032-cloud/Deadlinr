const STORAGE_KEY = "deadlinr_master_data";
const CLASS_KEY = "deadlinr_classes";

let masterData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let classes = JSON.parse(localStorage.getItem(CLASS_KEY)) || ["General"];

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

function renderCalendar() {
  const body = document.getElementById("calendar-body");
  if (!body) return;
  body.innerHTML = "";
  [...masterData]
    .sort((a,b) => (a.date || '9999') > (b.date || '9999') ? 1 : -1)
    .forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${t.date || '---'}</td><td>${t.class}</td><td>${t.name || 'Untitled'}</td><td>${t.status}</td>`;
      body.appendChild(tr);
    });
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
