const $score = document.querySelector(".game__score");
const $circle = document.querySelector(".game__clicker-circle");
function getScore() {
  return parseInt($score.textContent);
}
function setScore() {
  $score.textContent = getScore() + 1;
}
$circle.addEventListener("click", () => {
  setScore();
});
