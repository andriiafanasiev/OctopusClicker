const $score = document.querySelector(".game__score");
const $balance = document.querySelector(".boost-menu__balance");
const $circle = document.querySelector(".game__clicker-circle");
const $mainImg = document.querySelector(".game__main-image");
const $energy = document.querySelector(".energy__value");
const $maxEnergy = document.querySelector(".energy__max");
const $toLvlUp = document.querySelector("#to-lvl-up");
const $perTap = document.querySelector("#tap");

function start() {
  setScore(getScore());
  setEnergy(getEnergy());
  setMaxEnergy(getMaxEnergy());
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

// Energy regenerator
setInterval(() => {
  if (getEnergy() < getMaxEnergy()) {
    setEnergy(getEnergy() + 1);
  }
}, 2000);

$circle.addEventListener("click", (event) => {
  if (getEnergy() > 0) {
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
    setEnergy(getEnergy() - 1);
    updateLevel();
    setMaxEnergy(getMaxEnergy());

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

const $upgradeMenu = document.querySelector("#upgrade-menu");
const $upgradeImg = document.querySelector("#upgrade-img");
const $upgradeTitle = document.querySelector("#upgrade-title");
const $upgradeDescription = document.querySelector("#upgrade-description");
const $upgradeBtn = document.querySelector(".upgrade-menu__button");
const $upgradeCost = document.querySelector("#upgrade-cost");

const $upgrades = document.querySelectorAll(
  ".boost-menu__bosters__upgrade .boost-menu__boost"
);

const $energieUpgrade = document.querySelector("#energie-upgrade");
const $tapUpgrade = document.querySelector("#tap-upgrade");

for (let upgrade of $upgrades) {
  upgrade.addEventListener("click", (e) => {
    showUpgradeMenu(e.currentTarget);
  });
}

function showUpgradeMenu(upgrade) {
  const imgSrc = upgrade.querySelector("img").src;
  const title = upgrade.querySelector("h3").textContent;
  const cost = upgrade.querySelector("span").textContent;

  $upgradeImg.src = imgSrc;
  $upgradeTitle.textContent = title;
  $upgradeDescription.textContent = `Increase your ${title.toLowerCase()}.`;
  $upgradeCost.textContent = cost;

  $upgradeBtn.removeEventListener("click", handleUpgradeClick);
  $upgradeBtn.addEventListener("click", handleUpgradeClick);

  function handleUpgradeClick() {
    buyUpgrade(upgrade);
  }

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

function buyUpgrade(upgrade) {
  const currentBalance = getScore();
  const cost = Number($upgradeCost.textContent);
  const upgradeName = $upgradeTitle.textContent.toLowerCase();

  if (currentBalance >= cost) {
    setScore(currentBalance - cost);
    if (upgradeName === "multitap") {
      upgradeMultitap();
    } else if (upgradeName === "max energy") {
      upgradeMaxEnergy();
    }
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

// Energie

function getMaxEnergy() {
  const maxEnergy = localStorage.getItem("maxEnergy");
  return maxEnergy === null ? 1000 : Number(maxEnergy);
}
function setMaxEnergy(maxEnergy) {
  localStorage.setItem("maxEnergy", maxEnergy);
  $maxEnergy.textContent = maxEnergy;
}

function getEnergy() {
  const energy = localStorage.getItem("energy");
  return energy === null ? 1000 : Number(energy);
}

function setEnergy(energy) {
  localStorage.setItem("energy", energy);
  $energy.textContent = energy;
}
function upgradeMaxEnergy() {
  setMaxEnergy(getMaxEnergy() + 500);
}

function upgradeMultitap() {
  setCoinsPerTap(getCoinsPerTap() + 1);
}

const $energyBoost = document.querySelector(".boost-menu__boost__energy");
const $energyLimit = document.querySelector("#energy-limit");
const $energyTimer = document.querySelector("#energy-timer");
let energyBoostLimit = 1;
let recoveryTime = 60 * 60 * 1000; // 60 min in milliseconds
let recoveryInterval;
let remainingTime = recoveryTime;

function startRecoveryTimer(startTime) {
  recoveryInterval = setInterval(() => {
    let elapsedTime = Date.now() - startTime;
    remainingTime = recoveryTime - elapsedTime;

    if (remainingTime <= 0) {
      energyBoostLimit = 1;
      $energyLimit.textContent = energyBoostLimit;
      $energyBoost.classList.remove("disabled");
      $energyTimer.textContent = "";
      clearInterval(recoveryInterval);
      localStorage.removeItem("recoveryEndTime");
    } else {
      let minutes = Math.floor((remainingTime / 1000 / 60) % 60);
      let seconds = Math.floor((remainingTime / 1000) % 60);
      $energyTimer.innerHTML = `${minutes} min<br> ${seconds} sec`;
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
      energyBoostLimit = 0;
      $energyLimit.textContent = energyBoostLimit;
      $energyBoost.classList.add("disabled");
      recoveryTime = timeLeft;
      startRecoveryTimer(Date.now() - (recoveryTime - timeLeft));
    } else {
      localStorage.removeItem("recoveryEndTime");
      localStorage.removeItem("remainingTime");
    }
  }
}

$energyBoost.addEventListener("click", () => {
  if (energyBoostLimit > 0) {
    setEnergy(getMaxEnergy());
    energyBoostLimit--;
    $energyLimit.textContent = energyBoostLimit;
    $energyBoost.classList.add("disabled");
    let startTime = Date.now();
    startRecoveryTimer(startTime);
  }
});

start();
