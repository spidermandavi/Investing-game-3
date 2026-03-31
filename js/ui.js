// ===== UI =====

// Close popup
document.getElementById("popupOk").onclick = () => {
  document.getElementById("popup").classList.add("hidden");
};

// Popup function
function popup(html){
  const popupEl = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");

  // Set HTML, keep OK button at bottom
  popupContent.innerHTML = html + '<canvas id="graphCanvas"></canvas><button id="popupOk">OK</button>';

  popupEl.classList.remove("hidden");

  // Reassign OK button click
  document.getElementById("popupOk").onclick = () => {
    popupEl.classList.add("hidden");
  };
}

// ===== GRAPH DRAWER (High-res & responsive) =====
function drawGraph(data, color="#4caf50"){
  const canvas = document.getElementById("graphCanvas");
  if(!canvas || !data || data.length < 2) return;

  const ctx = canvas.getContext("2d");

  // Make canvas responsive & high-res
  canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
  canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
  ctx.setTransform(1,0,0,1,0,0); // reset transform
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);

  let padding = 40;
  let w = canvas.clientWidth - padding*2;
  let h = canvas.clientHeight - padding*2;

  let max = Math.max(...data);
  let min = Math.min(...data);
  if(max === min){ max += 1; min -= 1; }

  // Axes
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;

  // Y axis
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + h);
  ctx.stroke();

  // X axis
  ctx.beginPath();
  ctx.moveTo(padding, padding + h);
  ctx.lineTo(padding + w, padding + h);
  ctx.stroke();

  // Y labels
  ctx.fillStyle = "#aaa";
  ctx.font = "12px Arial";

  let steps = 4;
  for(let i=0;i<=steps;i++){
    let value = min + (i/steps)*(max-min);
    let y = padding + h - (i/steps)*h;

    ctx.fillText(value.toFixed(0), 2, y+3);

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + w, y);
    ctx.stroke();
  }

  // Animated line
  let progress = 0;
  function animate(){
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let maxIndex = Math.floor(progress * (data.length-1));
    for(let i=0;i<=maxIndex;i++){
      let x = padding + (i/(data.length-1))*w;
      let y = padding + h - ((data[i]-min)/(max-min))*h;

      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }

    ctx.stroke();

    progress += 0.04;
    if(progress <= 1){
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// ===== Player Input Generator =====
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
    Turn ${turn} | 
    <span style="color:${players[currentPlayer].color}">
      ${players[currentPlayer].name}
    </span> | 
    Money: $${players[currentPlayer].money.toFixed(2)}
    <button id="infoBtn" style="margin-left:20px;">Info</button>
  `;
  infoBar.style.background = players[currentPlayer].color;

  document.getElementById("infoBtn").onclick = () => showPlayerInfo(currentPlayer);

  let tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML = "";

  stocks.forEach((s, i) => {
    let change = s.change ?? 0;
    let changeClass = change > 0 ? "green" : change < 0 ? "red" : "neutral";

    let row = document.createElement("tr");
    row.innerHTML = `
      <td onclick="toggleInfo(${i})" style="cursor:pointer; text-decoration:underline;">${s.name}</td>
      <td>$${s.price.toFixed(2)}</td>
      <td class="${changeClass}">${change.toFixed(2)}</td>
      <td>${s.owned[currentPlayer]}</td>
      <td>${[1,5,10,20,100].map(n => `<button onclick="buy(${i},${n})">+${n}</button>`).join("")}</td>
      <td><button onclick="sell(${i})">Sell</button></td>
    `;
    tbody.appendChild(row);
  });

  document.querySelector(".buttons").innerHTML = `
    <button onclick="endTurn()">End Turn</button>
    <button class="danger" onclick="endGame(true)">End Game</button>
  `;
}

// ===== Stock Info =====
function toggleInfo(i){
  let s = stocks[i];
  popup(`<b>${s.name}</b><br>${s.desc}<br><br><i>Price History:</i>`);
  setTimeout(() => drawGraph(s.history, "#2196f3"), 50);
}

// ===== Player Info =====
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
    <b>Stocks:</b><br>${stockDetails || "None"}<br><br>
    <b>Worth History:</b>
  `);

  setTimeout(() => drawGraph(p.history, p.color), 50);
}

// ===== Podium =====
function showPodium(scores){
  document.getElementById("game").classList.add("hidden");
  const podium = document.getElementById("podium");
  podium.classList.remove("hidden");

  document.getElementById("firstPlace").innerText = scores[0].name;
  document.getElementById("secondPlace").innerText = scores[1]?.name || "";
  document.getElementById("thirdPlace").innerText = scores[2]?.name || "";

  let msg = scores.map(s=>`${s.name}: Earned $${s.earned.toFixed(2)} | Total $${s.total.toFixed(2)}`).join("<br>");
  popup(`<b>Game Over!</b><br>Winner: ${scores[0].name}<br><br>${msg}`);
}

function resetPodium(){
  resetGame();
  document.getElementById("podium").classList.add("hidden");
}
