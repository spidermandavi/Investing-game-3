// ===== POPUP =====
document.getElementById("popupOk").onclick = () => {
  document.getElementById("popup").classList.add("hidden");
};

function popup(html){
  const popupEl = document.getElementById("popup");
  document.getElementById("popupContent").innerHTML = html;

  // clear graph
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  popupEl.classList.remove("hidden");
}

// ===== GRAPH (PRO VERSION) =====
function drawGraph(data, color="#4caf50"){
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");

  // 🔥 HIGH QUALITY FIX
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(!data || data.length < 2) return;

  let padding = 40;
  let w = rect.width - padding*2;
  let h = rect.height - padding*2;

  let max = Math.max(...data);
  let min = Math.min(...data);

  if(max === min){
    max += 1;
    min -= 1;
  }

  let progress = 0;

  function animate(){
    ctx.clearRect(0,0,rect.width,rect.height);

    // GRID
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for(let i=0;i<=10;i++){
      let y = padding + (i/10)*h;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + w, y);
      ctx.stroke();
    }

    // LINE
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    let maxIndex = Math.floor(progress * (data.length-1));

    for(let i=0;i<=maxIndex;i++){
      let x = padding + (i/(data.length-1))*w;
      let y = padding + h - ((data[i]-min)/(max-min))*h;

      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }

    ctx.stroke();

    // POINTS
    ctx.fillStyle = color;
    for(let i=0;i<=maxIndex;i++){
      let x = padding + (i/(data.length-1))*w;
      let y = padding + h - ((data[i]-min)/(max-min))*h;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fill();
    }

    progress += 0.03;
    if(progress <= 1){
      requestAnimationFrame(animate);
    }
  }

  animate();
}
