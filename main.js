"use strict";

document.getElementById('version').innerText = "0.0.7"
// (9+X) ^ 2 / 100 * log10(9+X)

let gameData;
let initialGameData = {
  population: {
    amt: 0,
    max: 0,
    workers: 0,
    nextCost: 10,
    foodUsage: 0
  },
  buildings: {
    granary: {
      level: 0,
      unlocked: false
    },
    farm: {
      level: 0,
      unlocked: false
    },
    houses: {
      level: 0,
      unlocked: false
    },
    woodShed: {
      level: 0,
      unlocked: false
    },
    lumberjacksHut: {
      level: 0,
      unlocked: false
    },
    warehouse: {
      level: 0,
      unlocked: false
    },
    stoneQuarry: {
      level: 0,
      unlocked: false
    }
  },
  resources: {
    food: {
      amt: 0,
      max: 0,
      workers: 0,
      prog: 0,
      pps: 0,
      unlocked: false
    },
    wood: {
      amt: 0,
      max: 10,
      workers: 0,
      prog: 0,
      pps: 0,
      unlocked: true
    },
    stone: {
      amt: 0,
      max: 0,
      workers: 0,
      prog: 0,
      pps: 0,
      unlocked: false
    }
  }
};

//pps = production per second
const production = {
  food: {
    buttonName: "Gather food",
    buttonId: "foodBtn",
    displayName: "Food",
    resource: "food",
    progReq: 1,
    workers: "Farmers",
    pps: "ppsFood",
    prodBuilding: "farm"
  },
  wood: {
    buttonName: "Chop wood",
    buttonId: "woodBtn",
    displayName: "Wood",
    resource: "wood",
    progReq: 3,
    workers: "Lumberjacks",
    pps: "ppsWood",
    prodBuilding: "lumberjacksHut"
  },
  stone: {
    buttonName: "Mine stone",
    buttonId: "stoneBtn",
    displayName: "Stone",
    resource: "stone",
    progReq: 5,
    workers: "Miners",
    pps: "ppsStone",
    prodBuilding: "stoneQuarry"
  }
};

const buildings = {
  houses: {
    buildingId: "houses",
    displayName: "Houses",
    type: "population",
    description: "Upgrading this building increases your maximum population."
  },
  granary: {
    buildingId: "granary",
    displayName: "Granary",
    type: "food",
    description: "Upgrading this building increases your max amount of food."
  },
  farm: {
    buildingId: "farm",
    displayName: "Farm",
    type: "food",
    description: "Upgrading this building lets your farmers produce food more effectively."
  },
  woodShed: {
    buildingId: "woodShed",
    displayName: "Wood Shed",
    type: "wood",
    description: "Upgrading this building increases your max amount of wood."
  },
  lumberjacksHut: {
    buildingId: "lumberjacksHut",
    displayName: "Lumberjack's Hut",
    type: "wood",
    description: "Upgrading this building lets your lumberjacks produce wood more effectively."
  },
  warehouse: {
    buildingId: "warehouse",
    displayName: "Warehouse",
    type: "stone",
    description: "Upgrading this building increases your max amount of stone."
  },
  stoneQuarry: {
    buildingId: "stoneQuarry",
    displayName: "Stone Quarry",
    type: "stone",
    description: "Upgrading this building lets your stone miners produce stone more effectively."
  }
}


//navigation
function topnavMenu() {
  var x = document.getElementById("topMenu");
  if (x.className === "topnav") {
    x.classList.add("responsive");
  } else {
    x.classList.remove("responsive");
  }
};

// When the user scrolls the page, execute updateNav
window.onscroll = function() {updateNav()};

// Get the navbar
var navbar = document.getElementById("topMenu");

// Get the offset position of the navbar
var sticky = navbar.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function updateNav() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}

//tabs
function tab(tab) {
  document.getElementById("hearth").style.display = "none"
  document.getElementById("population").style.display = "none"
  document.getElementById("buildings").style.display = "none"
  document.getElementById("research").style.display = "none"
  document.getElementById(tab).style.display = "flex"
}
tab("hearth");

buttonGen();
workerGen();
resourceGen();
buildingsGen();
reset(true);
checkUnlocks();

//saving and loading
function reset(confirmReset) {
  confirmReset = confirmReset ?? confirm("Are you sure you want to reset your progress?");
  if (!confirmReset) {
    return;
  }
  gameData = JSON.parse(JSON.stringify(initialGameData));
  Object.values(production).forEach(p =>{
    document.getElementById(p.resource).style.display = "none";
    document.getElementById(p.resource + "Btn").style.display = "none";
  })
  Object.values(buildings).forEach(b =>{
    document.getElementById(b.buildingId + "Building").style.display = "none";
  })

  document.getElementById('tabBuildings').style.display = "none";
  document.getElementById('tabPopulation').style.display = "none";
  document.getElementById('tabResearch').style.display = "none";

  document.getElementById('gameLogContent').innerHTML = "<div></div>";

  document.getElementById('woodBtn').style.display = "flex";
  document.getElementById('wood').style.display = "block";
  updateAll();
  tab("hearth");
}
  
let saveGameLoop = window.setInterval(function() {
  localStorage.setItem("idleEmpireSave", JSON.stringify(gameData))
}, 5000)
  
let savegame = JSON.parse(localStorage.getItem("idleEmpireSave"))
  if (savegame !== null) {
    gameData = savegame
    updateAll();
  }
  
//updates
  
function updateAll() {
  document.getElementById("pop").innerHTML = "Population: " + gameData.population.amt + "/" + gameData.population.max;
  document.getElementById("popCost").innerHTML = "Cost: " + gameData.population.nextCost + " food";
  let foodUsage = gameData.population.amt * Math.log10(9 + gameData.population.amt);
  foodUsage.toFixed(2);
  gameData.population.foodUsage = foodUsage;
  document.getElementById("foodUsage").innerHTML = "Food usage: " + foodUsage + "/s";

  Object.values(production).forEach(p =>{
    //resource count
    let amt = gameData.resources[p.resource].amt;
    let max = gameData.resources[p.resource].max;
    if (amt > max){amt = max}
    amt = amt.toFixed(0);
    document.getElementById(p.resource).innerHTML = `${p.displayName}: <span style="float: right">${amt}/${gameData.resources[p.resource].max}</span>`;
    //gathering progress
    //document.getElementById(p.progId).innerHTML = percentify(gameData.resources[p.resource].prog, production[p.resource].progReq);
    //workers
    document.getElementById(p.workers).innerHTML = production[p.resource].workers + ": " + gameData.resources[p.resource].workers;
    //production per second
    let n = gameData.resources[p.resource].pps;
    n = parseFloat(n.toFixed(2));
    document.getElementById(p.pps).innerHTML = "Production: " + n + "/s";
  })

  Object.values(buildings).forEach(b =>{
    document.getElementById(b.buildingId + "Name").innerHTML = `<h3>${b.displayName} - level ${gameData.buildings[b.buildingId].level}</h3>`;
    document.getElementById(b.buildingId + "Costs").innerHTML = "";
    Object.values(getUpgradeCost(b.buildingId, gameData.buildings[b.buildingId].level + 1)).forEach(r =>{
      let element = document.createElement("span");
      element.innerHTML = production[r.resource].displayName + ": "+ r.amount + "<br>";
      document.getElementById(b.buildingId + "Costs").appendChild(element);
    })
  })
 
  checkUnlocks();
}

function percentify(val1, val2){
  return Intl.NumberFormat("en-GB", { style: "percent", 
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(val1 / val2);
}

// --- DYNAMIC GENERATION ---

//button gen
function buttonGen() {
  Object.values(production).forEach(p => {
    let element = document.createElement("div");
    element.classList.add("btn");
    element.classList.add("actionBtn");
    element.resource = p.resource;
    element.innerHTML = `<h3>${p.buttonName}</h3>`;
    //<p id="${p.progId}">0/${p.progReq}</p>`;
    document.getElementById("resourcePage").appendChild(element);
    element.id = p.buttonId;
    document.getElementById(p.buttonId).style.display = "none";
  });
  document.addEventListener("click", event => {
    let target = event.target.closest(".actionBtn");
    if (target) {
      gameData.resources[target.resource].amt++;
      if (gameData.resources[target.resource].amt > 0) {
      document.getElementById(target.resource).style.display = "";
        if (gameData.resources[target.resource].unlocked === false){
          gameData.resources[target.resource].unlocked = true;
          gameLog("New resource unlocked!");
        }
      }
      updateAll();
    }
  });
}

//worker buttons gen
function workerGen() {
  Object.values(production).forEach(p =>{
    let element = document.createElement("div");
    element.style.margin = "10px";
    element.style.width = "240px";
    element.style.display = "none";
    element.classList.add = "worker";
    element.resource = p.resource;
    element.id = p.resource + "Worker"
    element.innerHTML = `<h3 id="${p.workers}"></h3>
    <div class="btn" onclick="hire('${p.resource}', 1)" style="background-color: green; height: 40px; width:40%; float:left;">Hire</div>
    <div class="btn" onclick="hire('${p.resource}', -1)" style="background-color: crimson; height: 40px; width:40%; float:right;">Fire</div>
    <p id="${p.pps}"></p>`;
    document.getElementById("workerList").appendChild(element);
  });
}

//buildings gen
function buildingsGen() {
  Object.values(buildings).forEach(b =>{
    let element = document.createElement("div");
    element.classList.add("building", "box", "flow-column");
    element.id = b.buildingId + "Building";
    element.buildingType = b.buildingId;
    element.innerHTML = `<div class="row header">
    <h3 id="${b.buildingId}Name">${b.name} - level 0</h3>
    <div class="btn buildingBtn" id="${b.buildingId}Btn">Upgrade</div>
    </div>
    <p id="${b.buildingId}Costs"></p>`;
    document.getElementById("buildingsList").appendChild(element);

    document.getElementById(b.buildingId + "Building").style.display = "none";
  })
  document.addEventListener("click", event => {
    let target = event.target.closest(".buildingBtn");
    if (target) {
      upgradeBuilding(target.parentNode.parentNode.buildingType);
    }
  })
}


//resource bar gen
function resourceGen() {
  Object.values(production).forEach(p =>{
    let element = document.createElement("div");
      element.id = p.resource;
      element.classList.add("res");
      document.getElementById("resourceBarContents").appendChild(element);
      document.getElementById(p.resource).style.display = "none";
  })
}

//game log alerts
function gameLog(message) {
  let element = document.createElement("div");
  element.classList.add("message");
  element.innerHTML = `<p>${message}</p>`;
  document.getElementById("gameLogContent").firstChild.prepend(element);
}

// --- POPULATION ---
//population management
function increasePopulation() {
  if (gameData.resources.food.amt >= gameData.population.nextCost && gameData.population.amt < gameData.population.max){
    gameData.resources.food.amt = gameData.resources.food.amt - gameData.population.nextCost;
    gameData.population.nextCost = Math.ceil(gameData.population.nextCost*1.73);
    gameData.population.amt ++;
    updateAll();
  }
}

function hire(type, amt){
  if (amt > 0 && gameData.population.workers < gameData.population.amt){
    gameData.resources[type].workers++;
    gameData.population.workers++;
  }
  else if(amt < 0 && gameData.resources[type].workers > 0){
    gameData.resources[type].workers--;
    gameData.population.workers--;
  }
  updateAll();
}

//production loop
let productionLoop = window.setInterval(function() {
  Object.values(production).forEach(p =>{
    let res = gameData.resources[p.resource];
    res.pps = res.workers / p.progReq * Math.log10(9 + gameData.buildings[p.prodBuilding].level);
    res.amt += res.pps;
    updateAll();
  }
)}, 1000)

// --- UNLOCKING STUFF ---
function unlockResource(resource){
  if (gameData.resources[resource].unlocked === false){
    gameLog("Unlocked new resource: " + production[resource].displayName + "!");
  }
  gameData.resources[resource].unlocked = true;
  document.getElementById(resource).style.display = "block";
}

function unlockBuilding(building){
  if (gameData.buildings[building].unlocked === false){
    gameLog("Unlocked new building: " + buildings[building].displayName + "!");
  }
  gameData.buildings[building].unlocked = true;
  document.getElementById(building + "Building").style.display = "flex";
}

function unlockTab(tabName){
  document.getElementById(tabName).style.display = "";
}

function unlockBtn(btnName){
  document.getElementById(btnName).style.display = "";
}

function unlockWorker(workerName){
  document.getElementById(workerName + "Worker").style.display = "";
}

function checkUnlocks(){
  if (gameData.resources.wood.amt >=5 || gameData.buildings.granary.unlocked === true){
    unlockBuilding("granary");
    unlockTab("tabBuildings");
  }
  if (gameData.buildings.granary.level >= 1){
    unlockBtn("foodBtn");
    unlockResource("food");
  }
  if (gameData.resources.wood.amt >=10 || gameData.buildings.woodShed.unlocked === true){
    unlockBuilding("woodShed");
  }
  if (gameData.resources.wood.amt >= 15 || gameData.buildings.houses.unlocked === true){
    unlockBuilding("houses");
  }
  if (gameData.buildings.houses.level >= 1){
    unlockTab("tabPopulation");
  }
  if (gameData.population.amt >= 1 || gameData.buildings.farm.unlocked === true){
    unlockBuilding("farm");
  }
  if(gameData.buildings.farm.level >= 1){
    unlockWorker("food");
    unlockBuilding("lumberjacksHut");
  }
}

// --- BUILDINGS & UPGRADES ---

function upgradeBuilding(building){
  if (payIfPossible (getUpgradeCost(building))){
    gameData.buildings[building].level ++;
    let level = gameData.buildings[building].level;
    switch (building) {
      case 'granary':
        gameData.resources.food.max += 10 * level;
        if (level == 1){unlockResource("food"); unlockBtn("foodBtn")}
      break;
      case 'woodShed':
        gameData.resources.wood.max += 10 * level;
      break;
      case 'houses':
        gameData.population.max += 5;
      break;
      case 'farm':
        if (level == 1){unlockWorker("food")}
      break;
      case 'lumberjacksHut':
        if (level == 1){unlockWorker("wood")}
      break;
      case '':

      break;
  }
  updateAll();
  }
}

function getUpgradeCost(building){
  let level = gameData.buildings[building].level + 1;
  const resources = [];
    switch (building) {
      case 'granary':
        resources.push({'resource': 'wood', 'amount': Math.ceil(5 * Math.pow(level, 1.73))});
        if (level >= 3) {resources.push({'resource': 'stone', 'amount': Math.ceil(5 * Math.pow(level - 2, 1.73))});}
      break;
      case 'woodShed':
        resources.push({'resource': 'wood', 'amount': Math.round(gameData.resources.wood.max * 0.945) + 1});
        if (level >= 3) {resources.push({'resource': 'stone', 'amount': Math.ceil(6 * Math.pow(level - 2, 1.73))});}
      break;
      case 'houses':
        resources.push({'resource': 'wood', 'amount': Math.ceil(15 * Math.pow(level, 1.73))});
        if (level >= 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(7 * Math.pow(level - 1, 1.73))});}
      break;
      case 'farm':
        resources.push({'resource': 'wood', 'amount': Math.ceil(20 * Math.pow(level, 1.73))});
        if (level >= 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(8 * Math.pow(level - 1, 1.73))});}
      break;
      case 'lumberjacksHut':
        resources.push({'resource': 'wood', 'amount': Math.ceil(25 * Math.pow(level, 1.73))});
        if (level >= 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(9 * Math.pow(level - 1, 1.73))});}
      break;
      case 'warehouse':
        resources.push({'resource': 'wood', 'amount': Math.ceil(30 * Math.pow(level, 1.73))});
        if (level >= 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(10 * Math.pow(level - 1, 1.73))});}
      break;
      case 'stoneQuarry':
        resources.push({'resource': 'wood', 'amount': Math.ceil(35 * Math.pow(level, 1.73))});
        if (level >= 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(11 * Math.pow(level - 1, 1.73))});}
      break;
    }
  return resources;
  }

function hasResource(resource) {
  return gameData.resources[resource.resource].amt >= resource.amount;
}

function payResource(resource) {
  return gameData.resources[resource.resource].amt -= resource.amount;
}

function payResources(resources) {
  for (const resource of resources){
    payResource(resource);
  }
}

function hasResources(resources){
  for (const resource of resources){
    if (!hasResource(resource)){
      return false;
    }
  }
  return true;
}

function payIfPossible(resources){
  if (hasResources(resources)){
    payResources(resources);
    return true;
  }
  return false;
}