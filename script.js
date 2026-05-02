const classSaveKey = "deadlinr_class_list";

document.addEventListener("DOMContentLoaded", () => {
  const welcome = document.getElementById("welcomeMessage");
  const messages = ["Good morning, Student! 🌅", "Let's finish those tasks. 💼", "Last push for the day. 🌟"];
  if (welcome) welcome.textContent = messages[Math.floor(Math.random() * messages.length)];

  document.getElementById("add-class-btn").addEventListener("click", addClassFromPrompt);
  document.getElementById("delete-class-btn").addEventListener("click", deleteClassFromPrompt);
  document.getElementById("add-task-btn").addEventListener("click", addTask);

  loadSavedClasses();
  updateStats();
});

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function addTask() {
  const tbody = document.querySelector("#assignment-table tbody");
  const row = tbody.insertRow();
  const options = document.querySelector(".class-select").innerHTML;
  row.innerHTML = `
    <td><input class="assignment-input" placeholder="Assignment"></td>
    <td><select class="class-select">${options}</select></td>
    <td>
      <select class="status-select" onchange="updateStats()">
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>
    </td>
    <td><input class="due-date-input" type="date"></td>
    <td><button class="delete-task-btn" onclick="this.closest('tr').remove(); updateStats()">Delete</button></td>
  `;
  updateStats();
}

function updateStats() {
  const rows = document.querySelectorAll("#assignment-table tbody tr");
  document.getElementById("stat-total").textContent = rows.length;
  
  const completed = Array.from(document.querySelectorAll(".status-select")).filter(s => s.value === 'done').length;
  const progress = Array.from(document.querySelectorAll(".status-select")).filter(s => s.value === 'in-progress').length;
  const todo = Array.from(document.querySelectorAll(".status-select")).filter(s => s.value === 'todo').length;

  document.getElementById("stat-completed").textContent = completed;
  document.getElementById("stat-progress").textContent = progress;
  document.getElementById("stat-overdue").textContent = todo;
}

function addClassFromPrompt() {
  const name = prompt("Enter class name:");
  if (!name || name.trim() === "") return;
  const trimmed = name.trim();
  const value = trimmed.replace(/\s+/g, "-").toLowerCase();
  
  document.querySelectorAll(".class-select").forEach(select => {
    if (!select.querySelector(`option[value="${value}"]`)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = trimmed;
      select.appendChild(option);
    }
  });
  saveClassList();
}

function deleteClassFromPrompt() {
  const name = prompt("Enter class name to delete:");
  if (!name) return;
  const value = name.trim().replace(/\s+/g, "-").toLowerCase();
  document.querySelectorAll(".class-select").forEach(select => {
    const opt = select.querySelector(`option[value="${value}"]`);
    if (opt) opt.remove();
  });
  saveClassList();
}

function saveClassList() {
  const firstSelect = document.querySelector(".class-select");
  if (!firstSelect) return;
  const names = Array.from(firstSelect.querySelectorAll("option")).map(opt => opt.textContent);
  localStorage.setItem(classSaveKey, JSON.stringify(names));
}

function loadSavedClasses() {
  const saved = localStorage.getItem(classSaveKey);
  const list = saved ? JSON.parse(saved) : [];
  list.forEach(name => {
    const value = name.replace(/\s+/g, "-").toLowerCase();
    document.querySelectorAll(".class-select").forEach(select => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = name;
      select.appendChild(option);
    });
  });
}
