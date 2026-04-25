<script>
const hour = new Date().getHours();
let message;

const morning = [
  "Good morning. Ready to start?🌅",
  "Let's get ahead of the day.🕗",
  "Good day to catch up."
];

const afternoon = [
  "Let's keep the momentum going.",
  "Time to finish some work.💼",
  "Keep going. Keep growing.🌱"
];

const evening = [
  "Last push for the day.🌟",
  "Almost there.",
  "Let's wrap things up.🌌"
];

let messages;

if (hour < 12) messages = morning;
else if (hour < 17) messages = afternoon;
else messages = evening;

const random = Math.floor(Math.random() * messages.length);

document.getElementById("welcomeMessage").textContent = messages[random];

</script>
