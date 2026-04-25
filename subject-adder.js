<script>
function openSubjectAdder() {
  document.getElementById("modal").style.display = "block";
}

function closeSubjectAdder() {
  document.getElementById("modal").style.display = "none";
}
</script>

function addSubject() {
  let subject = document.getElementById("subject").value;
  console.log(subject);
}
