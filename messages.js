<script>
const hour = new Date().getHours();
let message;

if (hour < 12) {
  message = "Good morning. Ready to start?";
} 
else if (hour < 17) {
  message = "Let's get ahead.";
} 
else {
  message = "Final push for today.";
}

document.getElementById("welcomeMessage").textContent = message;
</script>
