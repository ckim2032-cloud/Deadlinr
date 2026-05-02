document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-task-btn").addEventListener("click", addTask);
  setupTableEventListeners();
});

function addTask() {
  const tbody = document.querySelector("#assignment-table tbody");
  const newRow = tbody.insertRow();
  newRow.innerHTML = `
    <td><input class="assignment-input" placeholder="Assignment"></td>
    <td><select class="class-select"></select></td>
    <td><select class="status-select"><option value="todo">To do</option></select></td>
    <td><input class="due-date-input" type="date"></td>
    <td><button class="delete-task-btn">Delete</button></td>
  `;
  setupTableEventListeners();
}

function setupTableEventListeners() {
  document.querySelectorAll(".delete-task-btn").forEach(btn => {
    btn.onclick = (e) => e.target.closest("tr").remove();
  });
}

function showPage(page) {
  console.log("Switching to", page);
}
