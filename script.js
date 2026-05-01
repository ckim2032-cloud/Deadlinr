const classSaveKey = "deadlinr_class_list";
const statusColors = { todo: "status-todo", "in-progress": "status-progress", done: "status-done" };

document.addEventListener("DOMContentLoaded", () => {
  const hour = new Date().getHours();
  const morning = ["Good morning. Ready to start? 🌅", "Let's get ahead of the day. 🕗", "Good day to catch up."];
  const afternoon = ["Let's keep the momentum going.", "Time to finish some work. 💼", "Keep going. Keep growing. 🌱"];
  const evening = ["Last push for the day. 🌟", "Almost there.", "Let's wrap things up. 🌌"];

  const choices = hour < 12 ? morning : hour < 17 ? afternoon : evening;
  const welcome = document.getElementById("welcomeMessage");
  if (welcome) {
    welcome.textContent = choices[Math.floor(Math.random() * choices.length)];
    welcome.style.opacity = "1";
  }

  const addClassButton = document.getElementById("add-class-btn");
  if (addClassButton) addClassButton.addEventListener("click", addClassFromPrompt);

  loadSavedClasses();
  setupRows();
  setupClassDropdowns();
});

function addClassFromPrompt() {
  const name = prompt("Enter class name");
  if (!name || name.trim() === "") return;
  const trimmed = name.trim();
  const value = trimmed.replace(/\s+/g, "-").toLowerCase();
  appendClassToAllDropdowns(value, trimmed);
  saveClassList();
}

function appendClassToAllDropdowns(value, display) {
  const selects = document.querySelectorAll(".class-select");
  selects.forEach((select) => {
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
  list.forEach((name) => appendClassToAllDropdowns(name.replace(/\s+/g, "-").toLowerCase(), name));
}

function saveClassList() {
  const firstSelect = document.querySelector(".class-select");
  if (!firstSelect) return;
  const names = Array.from(firstSelect.querySelectorAll("option")).map((opt) => opt.textContent);
  localStorage.setItem(classSaveKey, JSON.stringify(names));
}

function setupClassDropdowns() {
  document.querySelectorAll(".class-select").forEach((select) => {
    select.addEventListener("change", () => select.closest("tr").dataset.className = select.value);
  });
}

function setupRows() {
  document.querySelectorAll(".deadlinr-table tbody tr").forEach((row) => {
    const statusSelect = row.querySelector(".status-select");
    if (statusSelect) {
      statusSelect.addEventListener("change", () => updateRowStatus(row, statusSelect.value));
      updateRowStatus(row, statusSelect.value);
    }
  });
}

function updateRowStatus(row, value) {
  row.classList.remove("status-todo", "status-progress", "status-done");
  row.classList.add(statusColors[value] || "status-todo");
}

function openSubjectAdder() { document.getElementById("modal").style.display = "block"; }
function closeSubjectAdder() { document.getElementById("modal").style.display = "none"; }
function storeSubject() {
  console.log(document.getElementById("subject").value);
  document.getElementById("subject").value = "";
  closeSubjectAdder();
}
