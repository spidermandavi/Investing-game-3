// ===== GAME STATE =====
let players = [];
let currentPlayer = 0;
let turn = 1;
let actionTracker = {};

let gameMode = "turns";
let modeValue = 20;

let stocks = [
  { name: "CDJ", price: 10, volatility: 0.05, owned: {}, totalSpent: {}, desc: "Clothing company, medium risk." },
  { name: "Panda & Co.", price: 10, volatility: 0.02, owned: {}, totalSpent: {}, desc: "Stable bank." },
  { name: "GRAY-BOX", price: 10, volatility: 0.02, owned: {}, totalSpent: {}, desc: "Safe insurance." },
  { name: "BA", price: 10, volatility: 0.12, owned: {}, totalSpent: {}, desc: "Very volatile sports brand." },
  { name: "SEED", price: 10, volatility: 0.06, owned: {}, totalSpent: {}, desc: "Agriculture, event-driven." },
  { name: "EXTRA FRESH", price: 10, volatility: 0.04, owned: {}, totalSpent: {}, desc: "Food, steady growth." }
];

let playerColors = ["#ff4c4c","#4caf50","#2196f3","#ff9800"];

// ===== GAME FUNCTIONS =====

function startGame() {
  let count = Number(document.getElementById("playerCount").value);
  gameMode = document.getElementById("gameMode").value;
  modeValue = Number(document.getElementById("modeValue").value);

  players = [];

  for (let i = 0; i < count; i++) {
    let nameInput = document.getElementById(`playerName${i}`);
    let name = nameInput && nameInput.value ? nameInput.value : `Player ${i+1}`;

    players.push({ 
      money: 1000, 
      name: name, 
      color: playerColors[i] || "#fff",
      history: [1000] // 🔥 track worth over time
    });
  }

  stocks.forEach(s => {
    players.forEach((_, i) => {
      s.owned[i] = 0;
      s.totalSpent[i] = 0; // 🔥 track avg price
    });
  });

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  currentPlayer = 0;
  turn = 1;
  resetTurn();
  render();
}

function resetTurn() {
  actionTracker = {};
}

// ===== BUY / SELL =====

function buy(i, amount) {
  if (actionTracker[i] === "sell") return popup("You cannot buy and sell the same stock in one turn!");

  let s = stocks[i];
  let cost = s.price * amount;

  if (players[currentPlayer].money < cost) return popup("Not enough money");

  players[currentPlayer].money -= cost;
  s.owned[currentPlayer] += amount;
  s.totalSpent[currentPlayer] += cost; // 🔥 track spending

  actionTracker[i] = "buy";

  render();
}

function sell(i) {
  if (actionTracker[i] === "buy") return popup("You cannot buy and sell the same stock in one turn!");

  let s = stocks[i];

  if (s.owned[currentPlayer] <= 0) return popup("No stocks to sell");

  s.owned[currentPlayer]--;
  players[currentPlayer].money += s.price;

  // 🔥 adjust avg price tracking
  let avg = s.totalSpent[currentPlayer] / (s.owned[currentPlayer] + 1);
  s.totalSpent[currentPlayer] -= avg;

  actionTracker[i] = "sell";

  render();
}

// ===== TURN SYSTEM =====

function endTurn() {
  currentPlayer++;

  if (currentPlayer >= players.length) {
    currentPlayer = 0;
    turn++;

    updateMarket();
    applyDividends();
    randomEvent();

    // 🔥 track history AFTER full round
    players.forEach((p, i) => {
      let total = p.money;
      stocks.forEach(s => total += s.owned[i] * s.price);
      p.history.push(total);
    });
  }

  resetTurn();

  if (players[currentPlayer].money < 0) forceSell();

  checkWin();
  render();
}

// ===== MARKET =====

function updateMarket() {
  stocks.forEach(s => {
    let change = (Math.random()*2-1)*s.volatility*s.price;
    s.price += change;
    s.price = Math.max(1, Math.min(500, s.price));
    s.change = change ?? 0; // 🔥 FIX Panda bug
  });
}

function applyDividends() {
  players.forEach((p, pi)=>{
    stocks.forEach(s=>{
      let owned = s.owned[pi];
      let value = owned*s.price;

      let rate=0;
      if(owned>=1000) rate=0.1;
      else if(owned>=500) rate=0.075;
      else if(owned>=100) rate=0.05;

      p.money += value*rate;
    });
  });
}

// ===== EVENTS =====

// 🔥 Flash/highlight a player temporarily
function flashPlayer(index, color = "#ffff00", duration = 800){
  const playerEl = document.getElementById(`player${index}`);
  if(!playerEl) return;

  const originalBg = playerEl.style.backgroundColor;
  playerEl.style.backgroundColor = color;

  setTimeout(() => {
    playerEl.style.backgroundColor = originalBg || "";
  }, duration);
}

function randomEvent(){
  if(turn < 10) return;            
  if(Math.random() > 0.2) return;  // 20% chance per round

  // Weighted events: smaller events more likely
  let events = [
    {text:"Crashed car", value:-500, weight:1},
    {text:"Gift", value:200, weight:3},
    {text:"Repairs", value:-100, weight:2},
    {text:"Clothes", value:-50, weight:4},
    {text:"Phone broken", value:-240, weight:2},
    {text:"Birthday", value:75, weight:3},
    {text:"Furniture", value:-300, weight:1},
    {text:"Flowers", value:-20, weight:5}, // 🔥 replaced Bills
    {text:"Tax return", value:150, weight:3}
  ];

  // Create weighted array
  let weightedEvents = [];
  events.forEach(e => {
    for(let w = 0; w < e.weight; w++) weightedEvents.push(e);
  });

  // Pick one random player
  let i = Math.floor(Math.random() * players.length);
  let player = players[i];

  // Pick one random event
  let e = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];

  // Apply event
  player.money += e.value;

  // Flash the affected player
  flashPlayer(i, e.value >= 0 ? "#4caf50" : "#ff4c4c", 1000); // green for gain, red for loss

  // Show popup for affected player
  popup(`Event for ${player.name}: ${e.text}\n${e.value >= 0 ? "+" : ""}$${e.value}`);
}

function forceSell(){ 
  popup("You have negative money! Sell stocks!"); 
}

// ===== WIN SYSTEM =====

function checkWin(){
  if(gameMode==="turns" && turn>modeValue) return endGame(true);
  if(gameMode==="money" && players.some(p=>p.money>=modeValue)) return endGame(true);
}

function endGame(force=false){
  if(force){
    let scores = players.map((p,i)=>{
      let total = p.money;
      stocks.forEach(s=> total += s.owned[i] * s.price);

      let earned = total - 1000;

      return {
        total: total,
        earned: earned,
        name: p.name,
        color: p.color,
        history: p.history
      };
    });

    scores.sort((a,b)=>b.total-a.total);

    showPodium(scores);
  } else {
    resetGame();
  }
}

// ===== RESET =====

function resetGame(){
  document.getElementById('setup').classList.remove('hidden');
  document.getElementById('game').classList.add('hidden');

  players=[]; currentPlayer=0; turn=1; actionTracker={};
}
