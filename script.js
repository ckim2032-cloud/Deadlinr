const classSaveKey = "deadlinr_class_list";

document.addEventListener("DOMContentLoaded", () => {
  const welcome = document.getElementById("welcomeMessage");
  const messages = ["Good morning, Student! 🌅", "Let's finish those tasks. 💼", "Last push for the day. 🌟"];
  welcome.textContent = messages[Math.floor(Math.random() * messages.length)];

  document.getElementById("add-class-btn").addEventListener("click", addClassFromPrompt);
  document.getElementById("delete-class-btn").addEventListener("click", deleteClassFromPrompt);
  document.getElementById("add-task-btn").addEventListener("click", addTask);
  
  loadSavedClasses();
  setupTableEventListeners();
});

function showPage(page) {
  console.log("Navigating to:", page);
}

function addTask() {
  const tbody = document.querySelector("#assignment-table tbody");
  const newRow = tbody.insertRow();
  const optionsHtml = document.querySelector(".class-select").innerHTML;
  newRow.innerHTML = `
    <td><input class="assignment-input" type="text" placeholder="Assignment"></td>
    <td><select class="class-select">${optionsHtml}</select></td>
    <td>
      <select class="status-select">
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>
    </td>
    <td><input class="due-date-input" type="date"></td>
    <td><button class="delete-task-btn">Delete</button></td>
  `;
  setupTableEventListeners();
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

function addClassFromPrompt() {
  const name = prompt("Enter class name:");
  if (!name || name.trim() === "") return;
  const trimmed = name.trim();
  const value = trimmed.replace(/\s+/g, "-").toLowerCase();
  appendClassToAllDropdowns(value, trimmed);
  saveClassList();
}

function appendClassToAllDropdowns(value, display) {
  document.querySelectorAll(".class-select").forEach((select) => {
    if (!select.querySelector(`option[value="${value}"]`)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = display;
      select.appendChild(option);
    }
  });
}

function loadSavedClasses() {
  const saved = localStorage.getItem(classSaveKey);
  const list = saved ? JSON.parse(saved) : [];
  list.forEach(name => appendClassToAllDropdowns(name.replace(/\s+/g, "-").toLowerCase(), name));
}

function saveClassList() {
  const firstSelect = document.querySelector(".class-select");
  if (!firstSelect) return;
  const names = Array.from(firstSelect.querySelectorAll("option")).map(opt => opt.textContent);
  localStorage.setItem(classSaveKey, JSON.stringify(names));
}

function setupTableEventListeners() {
  document.querySelectorAll(".delete-task-btn").forEach(btn => {
    btn.onclick = (e) => e.target.closest("tr").remove();
  });
}
