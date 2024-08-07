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
  setCoinsPerHour(getCoinsPerHour());
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
    0: "assets/img/octopus/pure.png",
    1: "assets/img/octopus/normal.png",
    2: "assets/img/octopus/employed.png",
    3: "assets/img/octopus/rich.png",
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
    setEnergy(getEnergy() - getCoinsPerTap());
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
const $upgradeBtn = document.querySelector("#upgrade-button");
const $upgradeCost = document.querySelector("#upgrade-cost");

const $upgrades = document.querySelectorAll(
  ".boost-menu__bosters__upgrade .boost-menu__boost"
);

const $energieUpgrade = document.querySelector("#energie-upgrade");
const $tapUpgrade = document.querySelector("#tap-upgrade");

let multitapPurchases = localStorage.getItem("multitapPurchases")
  ? parseInt(localStorage.getItem("multitapPurchases"))
  : 0;
let multitapCost = localStorage.getItem("multitapCost")
  ? parseInt(localStorage.getItem("multitapCost"))
  : 1000;
let maxEnergyCost = localStorage.getItem("maxEnergyCost")
  ? parseInt(localStorage.getItem("maxEnergyCost"))
  : 1000;
document.querySelector("#multitap-cost").textContent = multitapCost;
document.querySelector("#max-energy-cost").textContent = maxEnergyCost;

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
  $cardsUpgradeMenu.classList.remove("active");
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
    startFallingCoins();
    alert("Upgrade purchased!");
  } else {
    alert("Not enough coins!");
  }
}

window.addEventListener("click", function (event) {
  if (event.target === $upgradeMenu || event.target === $cardsUpgradeMenu) {
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
  maxEnergyCost += 1000;
  localStorage.setItem("maxEnergyCost", maxEnergyCost);
  document.querySelector("#max-energy-cost").textContent = maxEnergyCost;
}

function upgradeMultitap() {
  if (multitapPurchases < 8) {
    setCoinsPerTap(getCoinsPerTap() + 1);
    multitapPurchases++;
    multitapCost += 1000;
    localStorage.setItem("multitapPurchases", multitapPurchases);
    localStorage.setItem("multitapCost", multitapCost);
    document.querySelector("#multitap-cost").textContent = multitapCost;
  } else {
    alert("Multitap upgrade is maxed out!");
  }
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
const $coinsPerHour = document.querySelector("#perHour");

function setCoinsPerHour(coins) {
  localStorage.setItem("coinsPerHour", coins);
  $coinsPerHour.textContent = coins;
}

function getCoinsPerHour() {
  return localStorage.getItem("coinsPerHour") ?? 0;
}

if (getCoinsPerHour() > 0) {
  let accumulatedCoins = 0;
  setInterval(() => {
    accumulatedCoins += getCoinsPerHour() / 3600;
    if (accumulatedCoins >= 1) {
      addCoins(Math.floor(accumulatedCoins));
      accumulatedCoins -= Math.floor(accumulatedCoins);
    }
  }, 1000);
}

const $barItems = document.querySelectorAll(".menu-bar__item");
const $tabContents = document.querySelectorAll(".tab-content");
const $gameContent = document.querySelectorAll(
  ".game__header, .game__clicker-circle, .game__footer, .info"
);

$barItems.forEach((barItem) => {
  barItem.addEventListener("click", (e) => {
    e.preventDefault();

    $barItems.forEach((item) => {
      item.classList.remove("menu-bar__item__active");
    });

    barItem.classList.add("menu-bar__item__active");

    const targetId = barItem.getAttribute("href").substring(1);

    $tabContents.forEach((tabContent) => {
      tabContent.classList.remove("tab-content__active");
    });

    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.classList.add("tab-content__active");
    }

    if (targetId === "home") {
      $gameContent.forEach((element) => element.classList.remove("hidden"));
    } else {
      $gameContent.forEach((element) => element.classList.add("hidden"));
    }
  });
});
const $mineTabItems = document.querySelectorAll(".mine-tab__card");

$mineTabItems.forEach(($mineTabItem) => {
  $mineTabItem.addEventListener("click", (e) => {
    showCardsUpgradeMenu(e.currentTarget);
  });
});

const $cardsUpgradeMenu = document.querySelector("#cards-upgrade-menu");
const $cardsUpgradeImg = document.querySelector("#cards-upgrade-img");
const $cardsUpgradeTitle = document.querySelector("#cards-upgrade-title");
const $cardsUpgradeDescription = document.querySelector(
  "#cards-upgrade-description"
);
const $cardsUpgradeBtn = document.querySelector("#cards-upgrade-button");
const $cardsUpgradeCost = document.querySelector("#cards-upgrade-cost");
const $cardsUpgradeIncome = document.querySelector("#cards-upgrade-income");

function showCardsUpgradeMenu(card) {
  const imgSrc = card.querySelector("img").src;
  const title = card.querySelector("h3").textContent;
  const cost = card.querySelector("span").textContent.trim();
  const description = card.querySelector("p").textContent;
  const income = card.querySelector(".card-income").textContent.trim();

  $cardsUpgradeImg.src = imgSrc;
  $cardsUpgradeTitle.textContent = title;
  $cardsUpgradeDescription.textContent = description;
  $cardsUpgradeCost.textContent = cost;
  $cardsUpgradeIncome.textContent = ` +${income} `;

  $cardsUpgradeBtn.removeEventListener("click", handleUpgradeClick);
  $cardsUpgradeBtn.addEventListener("click", handleUpgradeClick);

  function handleUpgradeClick() {
    buyCardUpgrade(card);
  }

  $cardsUpgradeMenu.classList.add("active");
}

function buyCardUpgrade(card) {
  const currentBalance = getScore();
  const cost = parseNumber($cardsUpgradeCost.textContent);
  const income = parseNumber($cardsUpgradeIncome.textContent);

  if (currentBalance >= cost) {
    setScore(currentBalance - cost);
    updateCoinsPerHour(income);
    hideUpgradeMenu();
    startFallingCoins();
    alert("Upgrade purchased!");
  } else {
    alert("Not enough coins!");
  }
}

function parseNumber(value) {
  return Number(value.replace(/[^0-9.-]+/g, ""));
}

function updateCoinsPerHour(coins) {
  setCoinsPerHour(Number(getCoinsPerHour()) + coins);
}

const container = document.querySelector("body");
let intervalId;

function createCoin() {
  const coin = document.createElement("div");
  coin.classList.add("coin-fall");
  coin.style.left = Math.random() * window.innerWidth + "px";
  coin.style.animationDuration = 2 + "s";
  container.appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 2000);
}

function startFallingCoins() {
  intervalId = setInterval(createCoin, 200);

  setTimeout(() => {
    clearInterval(intervalId);
  }, 3000);
}

const $dailyRewardBtn = document.querySelector("#dailyRewardBtn");
const $dailyRewardPopup = document.querySelector("#dailyRewardPopup");
const $popupCloseBtn = document.querySelector("#popupCloseBtn");

$dailyRewardBtn.addEventListener("click", () => {
  $dailyRewardPopup.style.display = "flex";
});

$popupCloseBtn.addEventListener("click", () => {
  $dailyRewardPopup.style.display = "none";
});

const $claimDailyRewardBtn = document.querySelector("#popupClaimBtn");
const $dailyRewardDays = document.querySelectorAll(".popup__day");

const currentRewardDayNum = getPreviousDay() + 1;
const $currentRewardDay = $dailyRewardDays[currentRewardDayNum - 1];
$currentRewardDay.classList.add("popup__day__current");

console.log($dailyRewardDays);

for (let i = 0; i < getPreviousDay(); i++) {
  $dailyRewardDays[i].classList.add("popup__day__completed");
}

function getPreviousDay() {
  return parseInt(localStorage.getItem("previousDay")) || 5;
}

function setPreviousDay(day) {
  return localStorage.setItem("previousDay", day);
}

$claimDailyRewardBtn.addEventListener("click", () => {
  const reward = parseInt(
    $currentRewardDay.querySelector(".popup__day-coins").textContent
  );
  console.log(reward);
});

const todayDate = new Date();
console.log(todayDate);

start();
