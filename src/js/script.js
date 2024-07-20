const $score = document.querySelector(".game__score");
const $balance = document.querySelector(".boost-menu__balance");
const $circle = document.querySelector(".game__clicker-circle");
const $mainImg = document.querySelector(".game__main-image");
const $energie = document.querySelector(".energie__value");
const $toLvlUp = document.querySelector("#to-lvl-up");
const $perTap = document.querySelector("#tap");

function start() {
  setScore(getScore());
  setEnergie(getEnergie());
  updateLevel();
  setCoinsPerTap(getCoinsPerTap());
  restoreRecoveryState();
}

//Coins and Score

function addCoins(coins) {
  setScore(getScore() + coins);
  updateLevel();
}

function getScore() {
  return Number(localStorage.getItem("score")) || 0;
}

function setScore(score) {
  localStorage.setItem("score", score);
  $score.textContent = score;
  $balance.textContent = score;
}

// Level

function getCurrentLevel() {
  return Number(localStorage.getItem("level")) || 0;
}

function setCurrentLevel(level) {
  localStorage.setItem("level", level);
}

function updateLevel() {
  const score = getScore();
  let level = getCurrentLevel();
  let nextLevelScore = "";

  if (score >= 10000 && level < 3) {
    level = 3;
    nextLevelScore = "Max Lvl";
  } else if (score >= 5000 && level < 2) {
    level = 2;
    nextLevelScore = "10k";
  } else if (score >= 1000 && level < 1) {
    level = 1;
    nextLevelScore = "5000";
  } else if (level === 0) {
    nextLevelScore = "1000";
  } else {
    nextLevelScore = level === 1 ? "5000" : "10k";
  }

  setCurrentLevel(level);
  $toLvlUp.textContent = nextLevelScore;
  updateImage(level);
}

function updateImage(level) {
  const octopusImages = {
    0: "/img/octopus/pure.png",
    1: "/img/octopus/normal.png",
    2: "/img/octopus/employed.png",
    3: "/img/octopus/rich.png",
  };
  $mainImg.setAttribute("src", octopusImages[level]);
}

// Energie

function getEnergie() {
  const energie = localStorage.getItem("energie");
  return energie === null ? 1000 : Number(energie);
}

function setEnergie(energie) {
  localStorage.setItem("energie", energie);
  $energie.textContent = energie;
}

// Energy regenerator
setInterval(() => {
  if (getEnergie() < 1000) {
    setEnergie(getEnergie() + 1);
  }
}, 2000);

$circle.addEventListener("click", (event) => {
  if (getEnergie() > 0) {
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
    updateLevel();

    setTimeout(() => {
      plusCoins.remove();
    }, 2000);
  }
});

// Upgrades

const $boostMenu = document.querySelector(".boost-menu");

function toggleBoostMenu() {
  $boostMenu.classList.toggle("active");
}

const $upgradeMenu = document.getElementById("upgrade-menu");
const $upgradeCost = document.getElementById("tap-cost");

function showUpgradeMenu() {
  $upgradeMenu.classList.add("active");
}

function hideUpgradeMenu() {
  $upgradeMenu.classList.remove("active");
}

function getCoinsPerTap() {
  return parseInt(localStorage.getItem("coinsPerTap")) || 1;
}

function setCoinsPerTap(coins) {
  localStorage.setItem("coinsPerTap", coins);
  $perTap.textContent = coins;
}

function buyUpgrade() {
  const currentBalance = getScore();
  const cost = Number($upgradeCost.textContent);

  if (currentBalance >= cost) {
    setScore(currentBalance - cost);
    setCoinsPerTap(getCoinsPerTap() + 1);
    hideUpgradeMenu();
    alert("Upgrade purchased!");
  } else {
    alert("Not enough coins!");
  }
}

window.addEventListener("click", function (event) {
  if (event.target === $upgradeMenu) {
    hideUpgradeMenu();
  }
});

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
