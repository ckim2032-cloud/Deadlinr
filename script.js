const classSaveKey = "deadlinr_class_list";
const statusColors = { todo: "status-todo", "in-progress": "status-progress", done: "status-done" };

document.addEventListener("DOMContentLoaded", () => {
  const welcome = document.getElementById("welcomeMessage");
  
  const messageData = {
    morning: [
      "Good morning. Ready to start? 🌅",
      "Let's get ahead of the day. 🕗",
      "Good day to catch up."
    ],
    afternoon: [
      "Let's keep the momentum going.",
      "Time to finish some work. 💼",
      "Keep going. Keep growing. 🌱"
    ],
    evening: [
      "Last push for the day. 🌟",
      "Almost there.",
      "Let's wrap things up. 🌌"
    ]
  };

  let currentIndex = 0;

  function updateWelcome() {
    const hour = new Date().getHours();
    let messages;

    if (hour < 12) messages = messageData.morning;
    else if (hour < 17) messages = messageData.afternoon;
    else messages = messageData.evening;

    if (welcome) {
      welcome.textContent = messages[currentIndex % messages.length];
      welcome.style.opacity = "1";
    }
    currentIndex++;
  }

  updateWelcome();
  setInterval(updateWelcome, 60000);

  document.getElementById("add-class-btn").addEventListener("click", addClassFromPrompt);
  document.getElementById("delete-class-btn").addEventListener("click", deleteClassFromPrompt);
  document.getElementById("add-row-btn").addEventListener("click", addRow);
  
  loadSavedClasses();
  setupTableEventListeners();
});

function addRow() {
  const tbody = document.querySelector("#assignment-table tbody");
  const newRow = tbody.insertRow();
  const optionsHtml = document.querySelector(".class-select").innerHTML;
  
  newRow.innerHTML = `
    <td><input class="assignment-input" type="text" placeholder="Assignment"></td>
    <td><select class="class-select">${optionsHtml}</select></td>
    <td>
      <select class="status-select status-tag">
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>
    </td>
    <td><input class="due-date-input" type="date"></td>
    <td><button class="delete-row-btn">Delete</button></td>
  `;
  setupTableEventListeners();
}

function deleteClassFromPrompt() {
  const name = prompt("Enter the exact name of the class to delete:");
  if (!name) return;
  const value = name.trim().replace(/\s+/g, "-").toLowerCase();
  document.querySelectorAll(".class-select").forEach(select => {
    const opt = select.querySelector(`option[value="${value}"]`);
    if (opt) opt.remove();
  });
  saveClassList();
}

function addClassFromPrompt() {
  const name = prompt("Enter class name");
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
  document.querySelectorAll(".delete-row-btn").forEach(btn => {
    btn.onclick = (e) => e.target.closest("tr").remove();
  });
}
