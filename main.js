"use strict";

document.getElementById('version').innerText = "0.0.9"
// (9+X) ^ 2 / 100 * log10(9+X)

let gameData;
let initialGameData = {
  time: {
    day: 0,
    month: 0,
    year: 0,
    season: "spring"
  },
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
    stoneyard: {
      level: 0,
      unlocked: false
    },
    quarry: {
      level: 0,
      unlocked: false
    },
    library: {
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
    progReq: 5,
    workers: "Farmers",
    pps: "ppsFood",
    prodBuilding: "farm"
  },
  wood: {
    buttonName: "Chop wood",
    buttonId: "woodBtn",
    displayName: "Wood",
    resource: "wood",
    progReq: 7,
    workers: "Lumberjacks",
    pps: "ppsWood",
    prodBuilding: "lumberjacksHut"
  },
  stone: {
    buttonName: "Mine stone",
    buttonId: "stoneBtn",
    displayName: "Stone",
    resource: "stone",
    progReq: 9,
    workers: "Miners",
    pps: "ppsStone",
    prodBuilding: "quarry"
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
  stoneyard: {
    buildingId: "stoneyard",
    displayName: "Stoneyard",
    type: "stone",
    description: "Upgrading this building increases your max amount of stone."
  },
  quarry: {
    buildingId: "quarry",
    displayName: "Stone Quarry",
    type: "stone",
    description: "Upgrading this building lets your stone miners produce stone more effectively."
  },
  library: {
    buildingId: "library",
    displayName: "Library",
    type: "research",
    description: "Upgrading this building lets your researchers do research more effectively."
  }
}

const research = {

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
  if (!confirmReset) {return;}
  gameData = JSON.parse(JSON.stringify(initialGameData));
  Object.values(production).forEach(p =>{
    document.getElementById(p.resource).style.display = "none";
    document.getElementById(p.resource + "Btn").style.display = "none";
    document.getElementById(p.resource + "Worker").style.display = "none";
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
  tab("hearth");
}

let savegame = JSON.parse(localStorage.getItem("idleEmpireSave"))
if (savegame !== null) {
  gameData = savegame
  updateAll();
}

//TIME LOOP

let dayLoop = window.setInterval(function() {
  let time = gameData.time;

  //production 
  Object.values(production).forEach(p =>{
    let res = gameData.resources[p.resource];
    if (p.name ="food" && time.season == "winter"){
      res.amt += res.pps * 0.5;
    }
    else {
      res.amt += res.pps;
    }
  })
  //calendar tick
  time.day++;
  if (time.day > 29){
    time.day = 0;
    time.month++;
  }
  if (time.month > 11){
    time.month = 0;
    time.year++;
  }
  //seasons
  if (time.month < 4){time.season = "spring"}
  else if (time.month < 7){time.season = "summer"}
  else if (time.month < 10){time.season = "autumn"}
  else {time.season = "winter"}

  //food usage
  gameData.resources.food.amt -= gameData.population.foodUsage;

  localStorage.setItem("idleEmpireSave", JSON.stringify(gameData))
  updateAll();
}, 5000)

let updateLoop = window.setInterval(function(){
  updateAll();
}, 500)
  
//updates
  
function updateAll() {
  document.getElementById("time").innerHTML = gameData.time.day + " days, " + gameData.time.month + " months, " + gameData.time.year + " years"
  let season = gameData.time.season;
  document.getElementById("season").innerHTML = season.charAt(0).toUpperCase() + season.slice(1);

  document.getElementById("pop").innerHTML = "Population: " + gameData.population.amt + "/" + gameData.population.max;
  document.getElementById("popCost").innerHTML = "Cost: " + gameData.population.nextCost + " food";
  let foodUsage = gameData.population.amt * Math.log10(9 + gameData.population.amt);
  gameData.population.foodUsage = foodUsage;
  foodUsage = parseFloat(foodUsage.toFixed(2));
  document.getElementById("foodUsage").innerHTML = "Food usage: " + foodUsage + "/day";

  Object.values(production).forEach(p =>{
    //resource count
    let res = gameData.resources[p.resource];
    res.pps = Math.pow(1 + (10 / p.progReq), 0.95 + 0.05*gameData.buildings[p.prodBuilding].level) * res.workers;

    let amt = gameData.resources[p.resource].amt;
    let max = gameData.resources[p.resource].max;
    if (gameData.resources[p.resource].amt > gameData.resources[p.resource].max){gameData.resources[p.resource].amt = gameData.resources[p.resource].max}
    amt = amt.toFixed(0);
    document.getElementById(p.resource).innerHTML = `${p.displayName}: <span style="float: right">${amt}/${gameData.resources[p.resource].max}</span>`;
    //gathering progress
    //document.getElementById(p.progId).innerHTML = percentify(gameData.resources[p.resource].prog, production[p.resource].progReq);
    //workers
    document.getElementById(p.workers).innerHTML = production[p.resource].workers + ": " + gameData.resources[p.resource].workers;
    //production per second
    let n = gameData.resources[p.resource].pps;
    n = parseFloat(n.toFixed(2));
    document.getElementById(p.pps).innerHTML = "Production: " + n + "/day";

    if (gameData.resources[p.resource].amt < 0){
      gameData.resources[p.resource].amt = 0;
    }
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
      if (gameData.resources[target.resource].amt < gameData.resources[target.resource].max){
        gameData.resources[target.resource].amt++;
      }
    }
    updateAll();
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
    </div>
    <div>
    <div class="btn buildingBtn" id="${b.buildingId}Btn">Upgrade</div>
    <p id="${b.buildingId}Costs"></p>
    </div>`;
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
    gameData.population.nextCost = Math.ceil(gameData.population.nextCost*1.53);
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
  document.getElementById(building + "Building").style.display = "";
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
  if (gameData.resources.wood.amt >= 10 || gameData.buildings.woodShed.unlocked == true){
    unlockBuilding("woodShed");
    unlockTab("tabBuildings")
  }
  if (gameData.resources.wood.amt >= 15 || gameData.buildings.granary.unlocked == true){
    unlockBuilding("granary");
  }
  if (gameData.buildings.granary.level >= 1){
    unlockResource("food"); 
    unlockBtn("foodBtn");
  }
  if (gameData.resources.wood.amt >=20 || gameData.buildings.houses.unlocked == true) {
    unlockBuilding("houses");
  }
  if (gameData.buildings.houses.level >= 1){
    unlockTab("tabPopulation");
    unlockBuilding("lumberjacksHut");
  }
  if (gameData.buildings.houses.level >=1 && gameData.buildings.granary.level >= 1){
    unlockBuilding("farm");
  }
  if (gameData.buildings.farm.level >= 1){
    unlockWorker("food");
  }
  if (gameData.buildings.farm.level >= 1 && gameData.buildings.lumberjacksHut.level >= 1){
    unlockBuilding("stoneyard");
  }
  if (gameData.buildings.lumberjacksHut.level >= 1){
    unlockWorker("wood");
  }
  if (gameData.buildings.stoneyard.level >= 1){
    unlockBuilding("quarry");
  }
  if (gameData.buildings.quarry.level >= 1){
    unlockWorker("stone");
  }
  if (gameData.buildings.quarry.level >=1 || gameData.resources.stone.unlocked == true){
    unlockResource("stone");
  }
  if (gameData.resources.stone.amt > 0 || gameData.buildings.library.unlocked == true){
    unlockBuilding("library");
  }
}

// --- BUILDINGS & UPGRADES ---

function upgradeBuilding(building){
  if (payIfPossible (getUpgradeCost(building))){
    gameData.buildings[building].level ++;
    let level = gameData.buildings[building].level;
    switch (building) {
      case 'granary':
        gameData.resources.food.max += 10 * Math.round(Math.pow(level, 1.4));
        if (level == 1){unlockResource("food"); unlockBtn("foodBtn")}
      break;
      case 'woodShed':
        gameData.resources.wood.max += 10 * Math.round(Math.pow(level, 1.45));
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
      case 'stoneyard':
        gameData.resources.stone.max += 10 * Math.round(Math.pow(level, 1.45));
      break;
      case 'library':
        if (level == 1){unlockTab("tabResearch")}
      break;
  }
  updateAll();
  }
}

function getUpgradeCost(building){
  let level = gameData.buildings[building].level + 1;
  const resources = [];
    switch (building) {
      case 'woodShed':
        resources.push({'resource': 'wood', 'amount': Math.ceil(10 * Math.pow(level-1, 1.43) + 10)});
        if (level > 3) {resources.push({'resource': 'stone', 'amount': Math.ceil(5 * Math.pow(level - 3, 1.43))});}
      break;
      case 'granary':
        resources.push({'resource': 'wood', 'amount': Math.ceil(15 * Math.pow(level, 1.43))});
        if (level > 3) {resources.push({'resource': 'stone', 'amount': Math.ceil(6 * Math.pow(level - 3, 1.43))});}
      break;
      case 'houses':
        resources.push({'resource': 'wood', 'amount': Math.ceil(20 * Math.pow(level, 1.73))});
        if (level > 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(7 * Math.pow(level - 2, 1.73))});}
      break;
      case 'farm':
        resources.push({'resource': 'wood', 'amount': Math.ceil(25 * Math.pow(level, 1.73))});
        if (level > 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(8 * Math.pow(level - 2, 1.73))});}
      break;
      case 'lumberjacksHut':
        resources.push({'resource': 'wood', 'amount': Math.ceil(30 * Math.pow(level, 1.73))});
        if (level > 2) {resources.push({'resource': 'stone', 'amount': Math.ceil(9 * Math.pow(level - 2, 1.73))});}
      break;
      case 'stoneyard':
        resources.push({'resource': 'wood', 'amount': Math.ceil(35 * Math.pow(level, 1.43))});
        if (level > 1) {resources.push({'resource': 'stone', 'amount': Math.ceil(10 * Math.pow(level - 1, 1.43))});}
      break;
      case 'quarry':
        resources.push({'resource': 'wood', 'amount': Math.ceil(40 * Math.pow(level, 1.73))});
        if (level > 1) {resources.push({'resource': 'stone', 'amount': Math.ceil(11 * Math.pow(level - 1, 1.73))});}
      break;
      case 'library':
        resources.push({'resource': 'wood', 'amount': Math.ceil(45 * Math.pow(level, 1.73))});
        resources.push({'resource': 'stone', 'amount': Math.ceil(12 * Math.pow(level, 1.73))});
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