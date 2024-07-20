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

function addCoins(coins) {
  setScore(getScore() + coins);
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
function getCurrentLevel() {
  return parseInt(localStorage.getItem("currentLevel")) || 0;
}

function setCurrentLevel(level) {
  localStorage.setItem("currentLevel", level);
}

let currentLevel = getCurrentLevel();

const toLvlUp = document.querySelector("#to-lvl-up");

function setNextLvl(coins) {
  if (coins >= 10000 && currentLevel < 3) {
    toLvlUp.textContent = "50k";
    currentLevel = 3;
    setCurrentLevel(currentLevel);
  } else if (coins >= 5000 && currentLevel < 2) {
    toLvlUp.textContent = "10k";
    currentLevel = 2;
    setCurrentLevel(currentLevel);
  } else if (coins >= 1000 && currentLevel < 1) {
    toLvlUp.textContent = "5000";
    currentLevel = 1;
    setCurrentLevel(currentLevel);
  } else if (currentLevel === 0) {
    toLvlUp.textContent = "1000";
  }
}

function setImage() {
  let score = getScore();
  if (score >= 10000) {
    $mainImg.setAttribute("src", "/img/octopus/rich.png");
  } else if (score >= 5000) {
    $mainImg.setAttribute("src", "/img/octopus/employed.png");
  } else if (score >= 1000) {
    $mainImg.setAttribute("src", "/img/octopus/normal.png");
  } else {
    $mainImg.setAttribute("src", "/img/octopus/basic.png");
  }
  setNextLvl(score);
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

// Coins per tap (it will be changed)

function getCoinsPerTap() {
  return parseInt(localStorage.getItem("coinsPerTap")) || 1;
}
function setCoinsPerTap(coins) {
  localStorage.setItem("coinsPerTap", coins);
}

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
    const coinsPerTap = getCoinsPerTap();
    const plusCoins = document.createElement("div");
    plusCoins.classList.add("plusCoins");
    plusCoins.textContent = "+" + coinsPerTap;
    plusCoins.style.left = `${event.clientX - rect.left}px`;
    plusCoins.style.top = `${event.clientY - rect.top}px`;

    $circle.parentElement.appendChild(plusCoins);

    addCoins(coinsPerTap);
    setEnergie(getEnergie() - 1);

    setTimeout(() => {
      plusCoins.remove();
    }, 2000);
  }
});

// Boost menu

const $boostMenu = document.querySelector(".boost-menu");

function toggleBoostMenu() {
  $boostMenu.classList.toggle("active");
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
