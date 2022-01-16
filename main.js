"use strict";

let gameData;
let initialGameData = {
  population: {
    amt: 0,
    max: 5,
    workers: 0,
    nextCost: 10
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
      max: 20,
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
  },
  buildings: {
    granary: 0,
    woodShed: 0,
    woodenHut: 0,
    stoneYard: 0
  }
};

//pps = production per second
const production = {
  food: {
    buttonName: "Gather food",
    buttonId: "foodBtn",
    actionText: "Gathering food",
    progId: "foodProg",
    displayName: "Food",
    resource: "food",
    progReq: 1,
    workers: "Farmers",
    pps: "ppsFood"
  },
  wood: {
    buttonName: "Chop wood",
    buttonId: "woodBtn",
    actionText: "Chopping wood",
    progId: "woodProg",
    displayName: "Wood",
    resource: "wood",
    progReq: 3,
    workers: "Lumberjacks",
    pps: "ppsWood"
  },
  stone: {
    buttonName: "Mine stone",
    buttonId: "stoneBtn",
    actionText: "Mining stone",
    progId: "stoneProg",
    displayName: "Stone",
    resource: "stone",
    progReq: 5,
    workers: "Miners",
    pps: "ppsStone"
  }
};

const buildings = {
  granary: {
    name: "Granary",
    type: "food",
    amount: 50
  },
  woodShed: {
    name: "Wood Shed",
    type: "wood",
    amount: 20
  },
  woodenHut: {
    name: "Wooden Hut",
    type: "population",
    amount: 5
  },
  
}


//navigation
function topnavMenu() {
  var x = document.getElementById("topMenu");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
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
  document.getElementById(tab).style.display = "inline-block"
}
tab("hearth");

buttonGen();
workerGen();
resourceGen();

//saving and loading
function reset(confirmReset) {
  confirmReset = confirmReset ?? confirm("Are you sure you want to reset your progress?");
  if (!confirmReset) {
    return;
  }
  gameData = JSON.parse(JSON.stringify(initialGameData));
  Object.values(production).forEach(p =>{
    document.getElementById(p.resource).style.display = "none";
  })
  document.getElementById('tabBuildings').style.display = "none";
  document.getElementById('tabPopulation').style.display = "none";
  document.getElementById('tabResearch').style.display = "none";

  document.getElementById('woodBtn').style.display = "flex";
  updateAll();
}
reset(true);
  
let saveGameLoop = window.setInterval(function() {
  localStorage.setItem("idleEmpireSave", JSON.stringify(gameData))
}, 10000)
  
let savegame = JSON.parse(localStorage.getItem("idleEmpireSave"))
  if (savegame !== null) {
    gameData = savegame
    updateAll();
  }
  
//updates
  
function updateAll() {
  document.getElementById("pop").innerHTML = "Population: " + gameData.population.amt + "/" + gameData.population.max;
  document.getElementById("popCost").innerHTML = "Cost: " + gameData.population.nextCost + " food";

  Object.values(production).forEach(p =>{
    //resource count
    let amt = gameData.resources[p.resource].amt;
    amt = amt.toFixed(0);
    document.getElementById(p.resource).innerHTML = `${p.displayName}: <span style="float: right">${amt}/${gameData.resources[p.resource].max}</span>`;
    //gathering progress
    document.getElementById(p.progId).innerHTML = percentify(gameData.resources[p.resource].prog, production[p.resource].progReq);
    //workers
    document.getElementById(p.workers).innerHTML = production[p.resource].workers + ": " + gameData.resources[p.resource].workers;
    //production per second
    let n = gameData.resources[p.resource].pps;
    n = parseFloat(n.toFixed(2));
    document.getElementById(p.pps).innerHTML = "Production: " + n + "/s";
  })
}

function percentify(val1, val2){
  return Intl.NumberFormat("en-GB", { style: "percent", 
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(val1 / val2);
}

function action(action){
  const currentAction = action;
  if (gameData.resources[action].amt +1 <= gameData.resources[action].max){
    gameData.resources[action].prog++;
    if (gameData.resources[action].prog >= production[action].progReq){
      gameData.resources[action].amt++;
      updateAll();
      gameData.resources[action].prog = 0;
    }
    else {updateAll();}    
  }
  if (gameData.resources[action].amt >= gameData.resources[action].max){updateAll();}
  }

// --- DYNAMIC GENERATION ---

//button gen
function buttonGen() {
  Object.values(production).forEach(p => {
    let element = document.createElement("div");
    element.classList.add("btn");
    element.classList.add("actionBtn");
    element.resource = p.resource;
    element.innerHTML = `<h3>${p.buttonName}</h3><p id="${p.progId}">0/${p.progReq}</p>`;
    document.getElementById("resourcePage").appendChild(element);
    element.id = p.buttonId;
    document.getElementById(p.buttonId).style.display = "none";
  });
  document.addEventListener("click", event => {
    let target = event.target.closest(".actionBtn");
    if (target) {
      action(target.resource);
      if (gameData.resources[target.resource].amt > 0) {
      document.getElementById(target.resource).style.display = "block";
      }
    }
  });
}

//worker buttons gen
function workerGen() {
  Object.values(production).forEach(p =>{
    let element = document.createElement("div");
      element.style.margin = "10px";
      element.style.width = "240px";
      element.resource = p.resource;
      element.innerHTML = `<h3 id="${p.workers}"></h3>
      <div class="btn" onclick="hire('${p.resource}', 1)" style="background-color: green; min-height: 60px; width:40%; float:left;">Hire</div>
      <div class="btn" onclick="hire('${p.resource}', -1)" style="background-color: crimson; min-height: 60px; width:40%; float:right;">Fire</div>
      <p id="${p.pps}"></p>`;
      document.getElementById("workerList").appendChild(element);
  });
}

//building buttons gen

//resource bar gen
function resourceGen() {
  Object.values(production).forEach(p =>{
    let element = document.createElement("div");
      element.id = p.resource;
      element.classList.add("res");
      document.getElementById("resourcebar").appendChild(element);
      document.getElementById(p.resource).style.display = "none";
  })
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
    res.pps = res.workers / p.progReq;
    res.amt += res.pps;
    if (res.amt > res.max){
      res.amt = res.max;
    }
    updateAll();
  }
)}, 1000)

// --- UNLOCKING STUFF ---

let unlockLoop = window.setInterval(function() {
  
  Object.values(production).forEach(p =>{
    let resource = gameData.resources[p.resource];
    if (resource.amt > 0 && resource.unlocked === false){
      document.getElementById(p.resource).style.display = "block";
      resource.unlocked = true;
    }
  })
  if (gameData.resources.wood.amt >= 10) {
    document.getElementById('tabBuildings').style.display = "block";
  }
}, 1000)

// --- BUILDINGS ---

function getUpgradeCost(building, level){
  const cost = [];
    switch (building) {
      case 'granary':
        cost.append({wood: Math.round(10 * Math.pow(level, 1.73))})
      break;
      case 'woodShed':
        cost.append({wood: Math.round(20 * Math.pow(level, 1.73))})
      break;
      case 'woodenHut':
        cost.append({wood: Math.round(15 * Math.pow(level, 1.73))})
      break;
      default:
        console.log('ERROR - building type not found!');
    }
  return cost;
}