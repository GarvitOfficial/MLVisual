export function init(container) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #f59e0b;">
        <h2 style="margin: 0 0 0.5rem 0; color: #92400e;">🎰 The Probability Guesser!</h2>
        <p style="margin: 0; color: #78350f; font-size: 1.1rem;">
          <b>Imagine:</b> You're a fruit detective! 🍊🍇 Given where a mystery fruit is, what's the probability it's an Orange vs a Grape?<br><br>
          <b>Naive Bayes</b> calculates: "Oranges are usually HERE, Grapes are usually THERE..." then picks the most likely!
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="nb-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- LEGEND -->
          <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #f97316;"></div>
              <span>🍊 Orange data</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #a855f7;"></div>
              <span>🍇 Grape data</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #94a3b8; border: 2px solid #1e293b;"></div>
              <span>❓ Mystery fruit (drag me!)</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #f59e0b;">🎮 How to Play</h3>
          
          <div style="background: #fff7ed; padding: 0.75rem; border-radius: 12px; margin-bottom: 0.75rem; border: 2px solid #fed7aa; font-size: 0.9rem;">
            <b>Step 1:</b> Click to add 🍊 or 🍇 fruit data
          </div>
          
          <div style="background: #faf5ff; padding: 0.75rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #e9d5ff; font-size: 0.9rem;">
            <b>Step 2:</b> Drag the ❓ circle to classify!
          </div>

          <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
            <button id="btn-orange" style="background: #f97316; flex: 1; font-size: 1rem;">🍊 Orange</button>
            <button id="btn-grape" style="background: #a855f7; flex: 1; font-size: 1rem; opacity: 0.6;">🍇 Grape</button>
          </div>
          
          <!-- RESULT BOX -->
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.25rem;">🔮 Prediction</div>
            <div id="prediction" style="font-size: 1.5rem; font-weight: bold;">Add some fruits!</div>
            <div style="margin-top: 0.5rem; display: flex; justify-content: center; gap: 1rem; font-size: 0.9rem;">
              <span style="color: #f97316;">🍊 <span id="prob-orange">0%</span></span>
              <span style="color: #a855f7;">🍇 <span id="prob-grape">0%</span></span>
            </div>
          </div>

          <button id="clear-btn" style="width: 100%; background: #94a3b8;">🗑️ Start Over</button>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 How does Naive Bayes work?</h4>
        <p style="margin: 0; color: #64748b;">
          It uses <b>Bayes' Theorem</b>: P(Orange|position) = P(position|Orange) × P(Orange) / P(position)<br><br>
          <b>In simple terms:</b> "Given all the oranges I've seen, how likely is THIS spot to have an orange?"<br>
          The word "Naive" means it assumes X and Y positions are independent (a simplification that often works!).
        </p>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#nb-canvas');
  const ctx = canvas.getContext('2d');
  const predictionEl = container.querySelector('#prediction');
  const probOrangeEl = container.querySelector('#prob-orange');
  const probGrapeEl = container.querySelector('#prob-grape');
  const btnOrange = container.querySelector('#btn-orange');
  const btnGrape = container.querySelector('#btn-grape');

  let points = [];
  let currentClass = 0;
  let queryPoint = { x: 275, y: 190 };
  let isDragging = false;

  function gaussianPDF(x, mean, variance) {
    if (variance === 0) return x === mean ? 1 : 0;
    return (1 / Math.sqrt(2 * Math.PI * variance)) * Math.exp(-((x - mean) ** 2) / (2 * variance));
  }

  function classify() {
    if (points.length < 2) return { prediction: -1, probOrange: 0, probGrape: 0 };

    const oranges = points.filter(p => p.cls === 0);
    const grapes = points.filter(p => p.cls === 1);

    if (oranges.length === 0 || grapes.length === 0) {
      return { prediction: oranges.length > 0 ? 0 : 1, probOrange: oranges.length > 0 ? 100 : 0, probGrape: grapes.length > 0 ? 100 : 0 };
    }

    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = (arr) => { const m = mean(arr); return arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / arr.length; };

    const priorOrange = oranges.length / points.length;
    const priorGrape = grapes.length / points.length;

    const oxs = oranges.map(p => p.x), oys = oranges.map(p => p.y);
    const gxs = grapes.map(p => p.x), gys = grapes.map(p => p.y);

    const likelihoodOrange = gaussianPDF(queryPoint.x, mean(oxs), variance(oxs) + 0.001) * gaussianPDF(queryPoint.y, mean(oys), variance(oys) + 0.001);
    const likelihoodGrape = gaussianPDF(queryPoint.x, mean(gxs), variance(gxs) + 0.001) * gaussianPDF(queryPoint.y, mean(gys), variance(gys) + 0.001);

    const posteriorOrange = likelihoodOrange * priorOrange;
    const posteriorGrape = likelihoodGrape * priorGrape;
    const total = posteriorOrange + posteriorGrape;

    return {
      prediction: posteriorOrange > posteriorGrape ? 0 : 1,
      probOrange: total > 0 ? (posteriorOrange / total) * 100 : 50,
      probGrape: total > 0 ? (posteriorGrape / total) * 100 : 50
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { prediction, probOrange, probGrape } = classify();

    // Draw points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = p.cls === 0 ? '#f97316' : '#a855f7';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.cls === 0 ? '🍊' : '🍇', p.x, p.y);
    });

    // Draw query point
    ctx.beginPath();
    ctx.arc(queryPoint.x, queryPoint.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = prediction === 0 ? '#f97316' : prediction === 1 ? '#a855f7' : '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Fredoka';
    ctx.fillText('?', queryPoint.x, queryPoint.y);

    // Update UI
    predictionEl.innerHTML = prediction === 0 ? '🍊 Orange!' : prediction === 1 ? '🍇 Grape!' : 'Add fruits!';
    predictionEl.style.color = prediction === 0 ? '#f97316' : prediction === 1 ? '#a855f7' : '#64748b';
    probOrangeEl.textContent = probOrange.toFixed(0) + '%';
    probGrapeEl.textContent = probGrape.toFixed(0) + '%';
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (Math.hypot(x - queryPoint.x, y - queryPoint.y) < 30) {
      isDragging = true;
    } else {
      points.push({ x, y, cls: currentClass });
      draw();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    queryPoint.x = Math.max(30, Math.min(e.clientX - rect.left, canvas.width - 30));
    queryPoint.y = Math.max(30, Math.min(e.clientY - rect.top, canvas.height - 30));
    draw();
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  btnOrange.onclick = () => { currentClass = 0; btnOrange.style.opacity = '1'; btnGrape.style.opacity = '0.6'; };
  btnGrape.onclick = () => { currentClass = 1; btnGrape.style.opacity = '1'; btnOrange.style.opacity = '0.6'; };

  container.querySelector('#clear-btn').onclick = () => {
    points = [];
    queryPoint = { x: 275, y: 190 };
    draw();
  };

  draw();
}
