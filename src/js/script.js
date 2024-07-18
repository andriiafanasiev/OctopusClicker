const $score = document.querySelector(".game__score");
const $circle = document.querySelector(".game__clicker-circle");
const $mainImg = document.querySelector(".game__main-image");
const $energie = document.querySelector(".energie__value");

start();

function start() {
  setScore(getScore());
  setEnergie(getEnergie());
  setImage();
}

function addOne() {
  setScore(getScore() + 1);
  setImage();
}

function getScore() {
  return Number(localStorage.getItem("score")) ?? 0;
}

function setScore(score) {
  localStorage.setItem("score", score);
  $score.textContent = score;
}
// Image change
function setImage() {
  if (getScore() > 600) {
    $mainImg.setAttribute("src", "/img/octopus/normal.png");
  }
}
// Energie control

function getEnergie() {
  return Number(localStorage.getItem("energie")) ?? 1000;
}
function setEnergie(energie) {
  localStorage.setItem("energie", energie);
  $energie.textContent = energie;
}

setInterval(() => {
  setEnergie(getEnergie() + 1);
}, 2000);

// Click event

$circle.addEventListener("click", (event) => {
  if (getEnergie() > 0) {
    const rect = $circle.getBoundingClientRect();

    const offfsetX = event.clientX - rect.left - rect.width / 2;
    const offfsetY = event.clientY - rect.top - rect.height / 2;

    const DEG = 40;

    const tiltX = (offfsetY / rect.height) * DEG;
    const tiltY = (offfsetX / rect.width) * -DEG;

    $circle.style.setProperty("--tiltX", `${tiltX}deg`);
    $circle.style.setProperty("--tiltY", `${tiltY}deg`);

    setTimeout(() => {
      $circle.style.setProperty("--tiltX", `0deg`);
      $circle.style.setProperty("--tiltY", `0deg`);
    }, 300);

    const plusOne = document.createElement("div");
    plusOne.classList.add("plus-one");
    plusOne.textContent = "+1";
    plusOne.style.left = `${event.clientX - rect.left}px`;
    plusOne.style.top = `${event.clientY - rect.top}px`;

    $circle.parentElement.appendChild(plusOne);

    addOne();
    setEnergie(getEnergie() - 1);

    setTimeout(() => {
      plusOne.remove();
    }, 2000);
  }
});
