<script>
function openSubjectAdder() {
  document.getElementById("subject-modal").style.display = "block";
}

function closeSubjectAdder() {
  document.getElementById("subject-modal").style.display = "none";
}
</script>

function storeSubject() {
  let subject = document.getElementById("subject").value;
  console.log(subject);
}
