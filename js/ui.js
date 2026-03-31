// ===== UI =====

// Popup fix
document.getElementById("popupOk").onclick = () => {
  document.getElementById("popup").classList.add("hidden");
};

function popup(text){
  const popupEl = document.getElementById("popup");
  document.getElementById("popupContent").innerText = text;
  popupEl.classList.remove("hidden");
}

// Player input generator
document.getElementById("playerCount").addEventListener("change", () => {
  let count = Number(document.getElementById("playerCount").value);
  const container = document.getElementById("playerNamesContainer");

  container.innerHTML = '';

  for(let i=0;i<count;i++){
    let div = document.createElement("div");
    div.innerHTML = `<label>Player ${i+1} Name: 
      <input id="playerName${i}" placeholder="Player ${i+1}" />
    </label>`;
    container.appendChild(div);
  }
});

// ===== Render Table & Info Bar =====
function render() {
  let infoBar = document.getElementById("infoBar");

  infoBar.innerHTML = `
    Turn ${turn} | <span style="color:${players[currentPlayer].color}">${players[currentPlayer].name}</span> | 
    Money: $${players[currentPlayer].money.toFixed(2)}
    <button id="infoBtn" style="margin-left:20px;">Info</button>
  `;
  infoBar.style.background = players[currentPlayer].color;

  // Info button listener
  document.getElementById("infoBtn").onclick = () => showPlayerInfo(currentPlayer);

  // Render table
  let tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML = "";

  stocks.forEach((s, i) => {
    let row = document.createElement("tr");

    let change = s.change ?? 0;
    let changeClass = change > 0 ? "green" : change < 0 ? "red" : "neutral";

    let avgPrice = s.owned[currentPlayer] ? (s.totalSpent[currentPlayer]/s.owned[currentPlayer]).toFixed(2) : "-";
    let currentValue = (s.owned[currentPlayer]*s.price).toFixed(2);

    row.innerHTML = `
      <td onclick="toggleInfo(${i})">${s.name}</td>
      <td>$${s.price.toFixed(2)}</td>
      <td class="${changeClass}">${change.toFixed(2)}</td>
      <td>${s.owned[currentPlayer]}</td>
      <td>${[1,5,10,20,100].map(n => `<button onclick="buy(${i},${n})">+${n}</button>`).join("")}</td>
      <td><button onclick="sell(${i})">Sell</button></td>
    `;

    tbody.appendChild(row);
  });

  // Swap buttons left/right
  const btnContainer = document.querySelector(".buttons");
  btnContainer.innerHTML = `
    <button onclick="endTurn()" style="float:left;">End Turn</button>
    <button onclick="endGame(true)" style="float:right;">End Game</button>
  `;
}

// ===== Stock Info Popup =====
function toggleInfo(i){
  popup(stocks[i].desc);
}

// ===== Player Info Panel =====
function showPlayerInfo(playerIndex){
  const p = players[playerIndex];
  let total = p.money;
  let stockDetails = "";

  stocks.forEach(s=>{
    total += s.owned[playerIndex]*s.price;
    if(s.owned[playerIndex]>0){
      let avg = (s.totalSpent[playerIndex]/s.owned[playerIndex]).toFixed(2);
      let value = (s.owned[playerIndex]*s.price).toFixed(2);
      stockDetails += `${s.name}: ${s.owned[playerIndex]} shares, avg $${avg}, current $${value}\n`;
    }
  });

  let lastWorth = p.history[p.history.length-2] ?? p.history[0];
  let changePercent = (((total-lastWorth)/lastWorth)*100).toFixed(2);

  let comparison = "";
  players.forEach((other,i)=>{
    if(i===playerIndex) return;
    let otherTotal = other.money;
    stocks.forEach(s=>otherTotal+=s.owned[i]*s.price);
    let diff = (total-otherTotal).toFixed(2);
    comparison += `${other.name}: ${diff>0?"+":""}${diff}\n`;
  });

  // Generate graph (history)
  let graph = "";
  if(p.history.length>1){
    graph = p.history.map((v,i)=>`Turn ${i+1}: $${v.toFixed(2)}`).join("\n");
  }

  popup(`Total Worth: $${total.toFixed(2)}
Change from last turn: ${changePercent}%
Difference vs other players:
${comparison}
Stocks:
${stockDetails}
History:
${graph}`);
}

// ===== Podium UI =====
function showPodium(scores){
  document.getElementById("game").classList.add("hidden");

  const podium = document.getElementById("podium");
  podium.classList.remove("hidden");

  document.getElementById("firstPlace").innerText = scores[0].name;
  document.getElementById("firstPlace").style.background = "gold";

  document.getElementById("secondPlace").innerText = scores[1]?scores[1].name:"";
  document.getElementById("secondPlace").style.background = "silver";

  document.getElementById("thirdPlace").innerText = scores[2]?scores[2].name:"";
  document.getElementById("thirdPlace").style.background = "#cd7f32";

  let msg = scores.map(s=>`${s.name}: Earned $${s.earned.toFixed(2)} | Total $${s.total.toFixed(2)}`).join("\n");

  popup(`Game Over!\nWinner: ${scores[0].name}\n${msg}`);
}

function resetPodium(){
  resetGame();
  document.getElementById("podium").classList.add("hidden");
}
