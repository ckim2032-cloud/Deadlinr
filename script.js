let tasks = JSON.parse(localStorage.getItem('deadlinr_tasks')) || [];
let userName = localStorage.getItem('deadlinr_user') || "";

window.onload = () => {
  if (userName) {
    document.getElementById('onboarding').style.display = 'none';
    setupApp(userName);
  }
  renderAll();
  lucide.createIcons();
};

function initApp() {
  userName = document.getElementById('user-name-input').value;
  if (!userName) return;
  localStorage.setItem('deadlinr_user', userName);
  document.getElementById('onboarding').style.display = 'none';
  setupApp(userName);
}

function setupApp(name) {
  document.getElementById('welcome-text').textContent = `Hey, ${name}! 👋`;
}

function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  event.currentTarget.classList.add('active');
}

function renderAll() {
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('all-tasks-list');
  if(!list) return;
  list.innerHTML = tasks.map(t => `<div class="task-item">${t.name}</div>`).join('');
}

function openModal() { alert("Modal logic"); }
function handleSearch(val) { console.log(val); }
