const $score = document.querySelector(".game__score");
const $circle = document.querySelector(".game__clicker-circle");

start();

function start() {
  setScore(getScore());
}

function addOne() {
  setScore(getScore() + 1);
}

function getScore() {
  return Number(localStorage.getItem("score")) ?? 0;
}

function setScore(score) {
  localStorage.setItem("score", score);
  $score.textContent = score;
}

$circle.addEventListener("click", () => {
  addOne();
});
