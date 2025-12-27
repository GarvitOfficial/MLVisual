export function init(container) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #fce7f3, #fbcfe8); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #ec4899;">
        <h2 style="margin: 0 0 0.5rem 0; color: #9d174d;">🔮 Will You Pass or Fail?</h2>
        <p style="margin: 0; color: #831843; font-size: 1.1rem;">
          <b>The S-Curve Secret:</b> Logistic Regression predicts <b>probabilities</b> between 0% and 100%!<br><br>
          Unlike a straight line that can go below 0 or above 100, the <b>Sigmoid (S-curve)</b> always stays in the valid range. Perfect for yes/no predictions!
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="logreg-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- AXIS LABELS -->
          <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-weight: bold; color: #3b82f6; font-size: 0.9rem;">
            📚 Hours Studied
          </div>
          <div style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%) rotate(-90deg); background: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-weight: bold; color: #22c55e; font-size: 0.9rem;">
            📊 Pass Probability
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #ec4899;">🎮 Build Your Dataset</h3>
          
          <div style="background: #f0fdf4; padding: 0.75rem; border-radius: 12px; margin-bottom: 0.75rem; border: 2px solid #bbf7d0; font-size: 0.9rem;">
            Click <b>lower</b> on canvas = fewer hours studied<br>
            Click <b>higher</b> = more hours studied
          </div>

          <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
            <button id="btn-pass" style="background: #22c55e; flex: 1; font-size: 1rem;">✅ Passed</button>
            <button id="btn-fail" style="background: #ef4444; flex: 1; font-size: 1rem; opacity: 0.6;">❌ Failed</button>
          </div>
          
          <!-- PREDICTION -->
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">🔮 If you study <b id="input-hours">5</b> hours:</div>
            <input type="range" id="hours-slider" min="0" max="10" value="5" style="width: 100%; margin-bottom: 0.5rem;">
            <div id="prediction" style="font-size: 1.3rem; font-weight: bold; text-align: center;">
              Pass chance: <span id="pass-prob">50%</span>
            </div>
          </div>

          <button id="clear-btn" style="width: 100%; background: #94a3b8;">🗑️ Clear All</button>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 The Sigmoid Function</h4>
        <p style="margin: 0; color: #64748b;">
          <b>Formula:</b> P(pass) = 1 / (1 + e^(-(mx + b)))<br><br>
          The "e" and exponent create the S-shape that <b>squishes</b> any value into 0-1 range!<br>
          Low X → probability near 0% | High X → probability near 100% | Middle X → around 50%
        </p>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#logreg-canvas');
  const ctx = canvas.getContext('2d');
  const hoursSlider = container.querySelector('#hours-slider');
  const inputHours = container.querySelector('#input-hours');
  const passProb = container.querySelector('#pass-prob');
  const btnPass = container.querySelector('#btn-pass');
  const btnFail = container.querySelector('#btn-fail');

  let points = [];
  let currentClass = 1;
  let w = 0.5, b = -2.5;

  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

  function train() {
    if (points.length < 2) return;
    const lr = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      points.forEach(p => {
        const x = p.x / canvas.width * 10;
        const pred = sigmoid(w * x + b);
        const error = p.cls - pred;
        w += lr * error * x;
        b += lr * error;
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 55) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      // Hour labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText((x / canvas.width * 10).toFixed(0) + 'h', x, canvas.height - 5);
    }
    for (let y = 0; y <= canvas.height; y += 38) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    train();

    // Draw sigmoid curve
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let px = 0; px <= canvas.width; px += 2) {
      const x = px / canvas.width * 10;
      const prob = sigmoid(w * x + b);
      const py = canvas.height - prob * canvas.height;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw 50% line
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw points
    points.forEach(p => {
      const displayY = p.cls === 1 ? 30 : canvas.height - 30;
      ctx.beginPath();
      ctx.arc(p.x, displayY, 12, 0, Math.PI * 2);
      ctx.fillStyle = p.cls === 1 ? '#22c55e' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.cls === 1 ? '✓' : '✗', p.x, displayY);
    });

    // Update prediction
    const hours = parseFloat(hoursSlider.value);
    const prob = sigmoid(w * hours + b) * 100;
    passProb.textContent = prob.toFixed(0) + '%';
    passProb.style.color = prob >= 60 ? '#22c55e' : prob >= 40 ? '#f59e0b' : '#ef4444';

    // Draw prediction marker
    const markerX = hours / 10 * canvas.width;
    const markerY = canvas.height - (sigmoid(w * hours + b) * canvas.height);
    ctx.beginPath();
    ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    points.push({ x, cls: currentClass });
    draw();
  });

  hoursSlider.addEventListener('input', (e) => {
    inputHours.textContent = e.target.value;
    draw();
  });

  btnPass.onclick = () => { currentClass = 1; btnPass.style.opacity = '1'; btnFail.style.opacity = '0.6'; };
  btnFail.onclick = () => { currentClass = 0; btnFail.style.opacity = '1'; btnPass.style.opacity = '0.6'; };

  container.querySelector('#clear-btn').onclick = () => {
    points = [];
    w = 0.5; b = -2.5;
    draw();
  };

  draw();
}
