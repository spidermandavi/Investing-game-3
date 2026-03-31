// ===== UI =====

// Popup fix
document.getElementById("popupOk").onclick = () => {
  document.getElementById("popup").classList.add("hidden");
};

// 🔥 UPDATED popup (supports HTML + graph)
function popup(html){
  const popupEl = document.getElementById("popup");
  document.getElementById("popupContent").innerHTML = html;
  popupEl.classList.remove("hidden");
}

// ===== GRAPH DRAWER =====
function drawGraph(data, color="#4caf50"){
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(data.length < 2) return;

  let max = Math.max(...data);
  let min = Math.min(...data);

  let padding = 20;
  let w = canvas.width - padding*2;
  let h = canvas.height - padding*2;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  data.forEach((v,i)=>{
    let x = padding + (i/(data.length-1))*w;
    let y = padding + h - ((v-min)/(max-min||1))*h;

    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.stroke();
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

  document.getElementById("infoBtn").onclick = () => showPlayerInfo(currentPlayer);

  // Render table
  let tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML = "";

  stocks.forEach((s, i) => {
    let row = document.createElement("tr");

    let change = s.change ?? 0;
    let changeClass = change > 0 ? "green" : change < 0 ? "red" : "neutral";

    row.innerHTML = `
      <td onclick="toggleInfo(${i})" style="cursor:pointer; text-decoration:underline;">
        ${s.name}
      </td>
      <td>$${s.price.toFixed(2)}</td>
      <td class="${changeClass}">${change.toFixed(2)}</td>
      <td>${s.owned[currentPlayer]}</td>
      <td>${[1,5,10,20,100].map(n => `<button onclick="buy(${i},${n})">+${n}</button>`).join("")}</td>
      <td><button onclick="sell(${i})">Sell</button></td>
    `;

    tbody.appendChild(row);
  });

  // Buttons
  const btnContainer = document.querySelector(".buttons");
  btnContainer.innerHTML = `
    <button onclick="endTurn()">End Turn</button>
    <button class="danger" onclick="endGame(true)">End Game</button>
  `;
}

// ===== Stock Info Popup (WITH GRAPH) =====
function toggleInfo(i){
  let s = stocks[i];

  popup(`
    <b>${s.name}</b><br>
    ${s.desc}<br><br>
    <i>Price History:</i>
  `);

  // 🔥 store history if not exists
  if(!s.history) s.history = [s.price];
  s.history.push(s.price);

  drawGraph(s.history, "#2196f3");
}

// ===== Player Info (WITH GRAPH) =====
function showPlayerInfo(playerIndex){
  const p = players[playerIndex];
  let total = p.money;
  let stockDetails = "";

  stocks.forEach(s=>{
    total += s.owned[playerIndex]*s.price;
    if(s.owned[playerIndex]>0){
      let avg = (s.totalSpent[playerIndex]/s.owned[playerIndex]).toFixed(2);
      let value = (s.owned[playerIndex]*s.price).toFixed(2);
      stockDetails += `${s.name}: ${s.owned[playerIndex]} shares, avg $${avg}, current $${value}<br>`;
    }
  });

  let lastWorth = p.history[p.history.length-2] ?? p.history[0];
  let changePercent = (((total-lastWorth)/lastWorth)*100).toFixed(2);

  popup(`
    <b>${p.name}</b><br><br>
    Total Worth: $${total.toFixed(2)}<br>
    Change: ${changePercent}%<br><br>
    <b>Stocks:</b><br>
    ${stockDetails || "None"}<br><br>
    <b>Worth History:</b>
  `);

  drawGraph(p.history, p.color);
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

  let msg = scores.map(s=>`${s.name}: Earned $${s.earned.toFixed(2)} | Total $${s.total.toFixed(2)}`).join("<br>");

  popup(`<b>Game Over!</b><br>Winner: ${scores[0].name}<br><br>${msg}`);
}

function resetPodium(){
  resetGame();
  document.getElementById("podium").classList.add("hidden");
}
