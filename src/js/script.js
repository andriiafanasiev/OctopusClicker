const $score = document.querySelector(".game__score");
const $balance = document.querySelector(".boost-menu__balance");
const $circle = document.querySelector(".game__clicker-circle");
const $mainImg = document.querySelector(".game__main-image");
const $energie = document.querySelector(".energie__value");

function start() {
  setScore(getScore());
  setEnergie(getEnergie());
  setImage();
  restoreRecoveryState();
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
  $balance.textContent = score;
}
// Image change and lvl up
const toLvlUp = document.querySelector("#to-lvl-up");
function SetnextLvl(coins) {
  if (coins >= 10000) {
    toLvlUp.textContent = "50k";
  } else if (coins >= 5000) {
    toLvlUp.textContent = "10k";
  } else if (coins >= 1000) {
    toLvlUp.textContent = 5000;
  } else {
    toLvlUp.textContent = 1000;
  }
}

function setImage() {
  let score = getScore();
  if (score >= 10000) {
    $mainImg.setAttribute("src", "/img/octopus/rich.png");
    SetnextLvl(score);
  } else if (score >= 5000) {
    $mainImg.setAttribute("src", "/img/octopus/employed.png");
    SetnextLvl(score);
  } else if (score >= 1000) {
    $mainImg.setAttribute("src", "/img/octopus/normal.png");
    SetnextLvl(score);
  }
}

// Energie control

function getEnergie() {
  const energie = localStorage.getItem("energie");
  return energie === null ? 1000 : Number(energie);
}

function setEnergie(energie) {
  localStorage.setItem("energie", energie);
  $energie.textContent = energie;
}

setInterval(() => {
  if (getEnergie() < 1000) {
    setEnergie(getEnergie() + 1);
  }
}, 2000);

// Click event

$circle.addEventListener("click", (event) => {
  if (getEnergie() > 0) {
    // click animation

    const rect = $circle.getBoundingClientRect();

    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    const DEG = 40;

    const tiltX = (offsetY / rect.height) * DEG;
    const tiltY = (offsetX / rect.width) * -DEG;

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

// Boost menu

const $boostMenu = document.querySelector(".boost-menu");

function toggleBoostMenu() {
  if ($boostMenu.style.display === "" || $boostMenu.style.display === "none") {
    $boostMenu.style.display = "block";
  } else {
    $boostMenu.style.display = "none";
  }
}

//Full energy boost

const $energieBoost = document.querySelector(".boost-menu__boost__energy");
const $energieLimit = document.querySelector("#energie-limit");
const $energieTimer = document.querySelector("#energie-timer");
let energieBoostLimit = 1;
let recoveryTime = 60 * 60 * 1000; // 60 minutes in milliseconds
let recoveryInterval;
let remainingTime = recoveryTime;

function startRecoveryTimer(startTime) {
  recoveryInterval = setInterval(() => {
    let elapsedTime = Date.now() - startTime;
    remainingTime = recoveryTime - elapsedTime;

    if (remainingTime <= 0) {
      energieBoostLimit = 1;
      $energieLimit.textContent = energieBoostLimit;
      $energieBoost.classList.remove("disabled");
      $energieTimer.textContent = "";
      clearInterval(recoveryInterval);
      localStorage.removeItem("recoveryEndTime");
    } else {
      let minutes = Math.floor((remainingTime / 1000 / 60) % 60);
      let seconds = Math.floor((remainingTime / 1000) % 60);
      $energieTimer.innerHTML = `${minutes} min<br> ${seconds} sec`;
      localStorage.setItem("remainingTime", remainingTime);
      localStorage.setItem("recoveryEndTime", startTime + recoveryTime);
    }
  }, 1000);
}

function restoreRecoveryState() {
  let recoveryEndTime = localStorage.getItem("recoveryEndTime");
  if (recoveryEndTime) {
    let timeLeft = recoveryEndTime - Date.now();
    if (timeLeft > 0) {
      energieBoostLimit = 0;
      $energieLimit.textContent = energieBoostLimit;
      $energieBoost.classList.add("disabled");
      recoveryTime = timeLeft;
      startRecoveryTimer(Date.now() - (recoveryTime - timeLeft));
    } else {
      localStorage.removeItem("recoveryEndTime");
      localStorage.removeItem("remainingTime");
    }
  }
}

$energieBoost.addEventListener("click", () => {
  if (energieBoostLimit > 0) {
    setEnergie(1000);
    energieBoostLimit--;
    $energieLimit.textContent = energieBoostLimit;
    $energieBoost.classList.add("disabled");
    let startTime = Date.now();
    startRecoveryTimer(startTime);
  }
});

start();
