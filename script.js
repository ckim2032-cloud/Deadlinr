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

  function updateWelcomeMessage() {
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

  // Run once immediately
  updateWelcomeMessage();

  // Rotate every 60 seconds
  setInterval(updateWelcomeMessage, 60000);

  // Setup other functionality
  const addClassButton = document.getElementById("add-class-btn");
  if (addClassButton) addClassButton.addEventListener("click", addClassFromPrompt);
  document.getElementById("delete-class-btn").addEventListener("click", deleteClassFromPrompt);
  document.getElementById("add-row-btn").addEventListener("click", addRow);
  
  loadSavedClasses();
  setupTableEventListeners();
});
