export function init(container) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #3b82f6;">
        <h2 style="margin: 0 0 0.5rem 0; color: #1e40af;">📈 The Magic Line Finder!</h2>
        <p style="margin: 0; color: #1e3a8a; font-size: 1.1rem;">
          <b>The Problem:</b> You want to predict how tall a sunflower will grow based on how much water you give it! 🌻<br><br>
          <b>The Solution:</b> We draw a "best fit" line through your data points. This line can then <b>predict</b> new values!<br>
          If the line goes up → more water = taller plant! 📊
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="lr-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); cursor: crosshair;"></canvas>
          
          <!-- AXIS LABELS -->
          <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); background: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-weight: bold; color: #3b82f6;">
            💧 Water Given (ml)
          </div>
          <div style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%) rotate(-90deg); background: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-weight: bold; color: #22c55e;">
            🌻 Height (cm)
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #3b82f6;">🎯 How to Play</h3>
          
          <div style="background: #f0f9ff; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #bae6fd;">
            <div style="font-weight: bold; color: #0369a1; margin-bottom: 0.5rem;">Step 1: Drop some data! 📍</div>
            <div style="color: #64748b; font-size: 0.9rem;">Click on the white area to add points. Each point is one sunflower experiment!</div>
          </div>
          
          <div style="background: #fdf4ff; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid #f5d0fe;">
            <div style="font-weight: bold; color: #a21caf; margin-bottom: 0.5rem;">Step 2: Watch the line appear! ✨</div>
            <div style="color: #64748b; font-size: 0.9rem;">The pink line adjusts to fit through your points as best as it can!</div>
          </div>
          
          <!-- THE EQUATION -->
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.25rem;">✨ The Magic Formula ✨</div>
            <div id="equation" style="font-family: 'Fredoka', monospace; font-size: 1.5rem; color: #ec4899; font-weight: bold;">
              y = ?x + ?
            </div>
          </div>
          
          <!-- PREDICTION BOX -->
          <div style="background: #fefce8; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #fde047;">
            <div style="font-weight: bold; color: #a16207; margin-bottom: 0.5rem;">🔮 Predict!</div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span>If water =</span>
              <input type="number" id="predict-input" value="300" style="width: 60px; padding: 0.25rem; border-radius: 6px; border: 2px solid #fde047; text-align: center;">
              <span>ml</span>
            </div>
            <div id="prediction-result" style="margin-top: 0.5rem; font-weight: bold; color: #ca8a04;">
              → Height will be: ? cm
            </div>
          </div>
          
          <button id="clear-btn" style="width: 100%; background: #94a3b8;">🗑️ Start Fresh</button>
          
          <div id="point-count" style="margin-top: 1rem; text-align: center; color: #64748b;">
            Points: 0
          </div>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div id="explainer" style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 What does this mean?</h4>
        <p id="explain-text" style="margin: 0; color: #64748b;">
          The line finds the AVERAGE pattern in your data. If most tall sunflowers got lots of water, the line will go UP! 
          The formula "y = mx + b" means: <b>height = (slope × water) + starting height</b>.
        </p>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#lr-canvas');
  const ctx = canvas.getContext('2d');
  const equationEl = container.querySelector('#equation');
  const pointCountEl = container.querySelector('#point-count');
  const predictInput = container.querySelector('#predict-input');
  const predictionResult = container.querySelector('#prediction-result');

  let points = [];

  function calculateRegression() {
    const n = points.length;
    if (n < 2) return { m: 0, b: canvas.height / 2, valid: false };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
    }

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    return { m, b, valid: true };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const { m, b, valid } = calculateRegression();

    // Draw Line
    if (valid) {
      // Line shadow
      ctx.strokeStyle = '#ec489944';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, m * 0 + b);
      ctx.lineTo(canvas.width, m * canvas.width + b);
      ctx.stroke();

      // Main line
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, m * 0 + b);
      ctx.lineTo(canvas.width, m * canvas.width + b);
      ctx.stroke();

      // Update equation (flip sign because canvas Y is inverted)
      const displayM = -m;
      const displayB = canvas.height - b;
      equationEl.textContent = `height = ${displayM.toFixed(2)} × water + ${displayB.toFixed(0)}`;

      // Update prediction
      const waterVal = parseFloat(predictInput.value);
      if (!isNaN(waterVal)) {
        const predictedY = m * waterVal + b;
        const predictedHeight = canvas.height - predictedY;
        predictionResult.textContent = `→ Height will be: ${predictedHeight.toFixed(0)} cm`;
      }
    } else {
      equationEl.textContent = 'Add 2+ points!';
      predictionResult.textContent = '→ Height will be: ? cm';
    }

    // Draw Points as sunflowers
    points.forEach(p => {
      // Stem
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + 15);
      ctx.stroke();

      // Flower center
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Petals
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          p.x + Math.cos(angle) * 12,
          p.y + Math.sin(angle) * 12,
          5, 3, angle, 0, Math.PI * 2
        );
        ctx.fill();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#92400e';
      ctx.fill();
    });

    pointCountEl.textContent = `Points: ${points.length}`;
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    draw();
  });

  predictInput.addEventListener('input', () => {
    draw();
  });

  container.querySelector('#clear-btn').onclick = () => {
    points = [];
    draw();
  };

  draw();
}
