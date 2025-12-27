export function init(container) {
    container.innerHTML = `
    <div style="display: flex; gap: 2rem; align-items: flex-start; justify-content: center; flex-wrap: wrap;">
      <div style="position: relative;">
        <canvas id="gb-canvas" width="600" height="400"></canvas>
      </div>
      
      <div class="controls-panel" style="flex: 1; min-width: 260px; max-width: 320px; padding: 1.5rem; border-radius: 20px;">
        <h3>💪 Gradient Boosting</h3>
        <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">
          Watch weak learners combine into a strong predictor! Add points and boost!
        </p>
        
        <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
          <button id="btn-pos" style="background: #22c55e; flex: 1;">+ Positive</button>
          <button id="btn-neg" style="background: #ef4444; flex: 1; transform: scale(0.95); opacity: 0.7;">- Negative</button>
        </div>
        
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
          <div style="font-size: 0.8rem; color: #64748b;">Boosting Rounds:</div>
          <div id="rounds" style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">0</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button id="boost-btn" style="background: var(--primary);">🚀 Add Booster (+10 rounds)</button>
          <button id="clear-btn" style="background-color: #94a3b8; box-shadow: 0 4px 0 #64748b;">🗑️ Reset</button>
        </div>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#gb-canvas');
    const ctx = canvas.getContext('2d');
    const roundsEl = container.querySelector('#rounds');
    const btnPos = container.querySelector('#btn-pos');
    const btnNeg = container.querySelector('#btn-neg');

    let points = [];
    let currentClass = 1; // 1 = positive, -1 = negative
    let boosters = [];
    let predictions = []; // cumulative predictions for each point

    // Each booster is a simple stump
    function buildStump(residuals) {
        let bestFeature = 'x';
        let bestThresh = 0;
        let bestLeftVal = 0;
        let bestRightVal = 0;
        let bestLoss = Infinity;

        ['x', 'y'].forEach(feature => {
            const vals = points.map(p => p[feature]).sort((a, b) => a - b);
            for (let i = 0; i < vals.length - 1; i++) {
                const thresh = (vals[i] + vals[i + 1]) / 2;

                const leftResiduals = [];
                const rightResiduals = [];

                points.forEach((p, idx) => {
                    if (p[feature] <= thresh) leftResiduals.push(residuals[idx]);
                    else rightResiduals.push(residuals[idx]);
                });

                if (leftResiduals.length === 0 || rightResiduals.length === 0) continue;

                const leftVal = leftResiduals.reduce((a, b) => a + b, 0) / leftResiduals.length;
                const rightVal = rightResiduals.reduce((a, b) => a + b, 0) / rightResiduals.length;

                // Calculate loss
                let loss = 0;
                points.forEach((p, idx) => {
                    const pred = p[feature] <= thresh ? leftVal : rightVal;
                    loss += (residuals[idx] - pred) ** 2;
                });

                if (loss < bestLoss) {
                    bestLoss = loss;
                    bestFeature = feature;
                    bestThresh = thresh;
                    bestLeftVal = leftVal;
                    bestRightVal = rightVal;
                }
            }
        });

        return {
            feature: bestFeature,
            thresh: bestThresh,
            leftVal: bestLeftVal,
            rightVal: bestRightVal,
            predict: (x, y) => {
                const val = bestFeature === 'x' ? x : y;
                return val <= bestThresh ? bestLeftVal : bestRightVal;
            }
        };
    }

    function boost() {
        if (points.length < 2) return;

        const lr = 0.3; // Learning rate

        for (let round = 0; round < 10; round++) {
            // Calculate residuals
            const residuals = points.map((p, idx) => {
                const target = p.cls; // 1 or -1
                return target - (predictions[idx] || 0);
            });

            // Fit stump on residuals
            const stump = buildStump(residuals);
            boosters.push(stump);

            // Update predictions
            points.forEach((p, idx) => {
                const update = stump.predict(p.x, p.y);
                predictions[idx] = (predictions[idx] || 0) + lr * update;
            });
        }

        roundsEl.textContent = boosters.length;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (boosters.length > 0) {
            // Draw heatmap
            const res = 25;
            const cellW = canvas.width / res;
            const cellH = canvas.height / res;
            const lr = 0.3;

            for (let i = 0; i < res; i++) {
                for (let j = 0; j < res; j++) {
                    const x = (i + 0.5) * cellW;
                    const y = (j + 0.5) * cellH;

                    let pred = 0;
                    boosters.forEach(b => {
                        pred += lr * b.predict(x, y);
                    });

                    // Map pred (around -1 to 1) to colors
                    const prob = 1 / (1 + Math.exp(-pred * 2)); // Sigmoid-ish
                    const r = Math.round((1 - prob) * 239);
                    const g = Math.round(prob * 197);
                    ctx.fillStyle = `rgba(${r}, ${g}, 94, 0.3)`;
                    ctx.fillRect(i * cellW, j * cellH, cellW, cellH);
                }
            }
        }

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 1 ? '#22c55e' : '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y, cls: currentClass });
        predictions.push(0);
        draw();
    });

    btnPos.onclick = () => {
        currentClass = 1;
        btnPos.style.transform = 'scale(1)';
        btnPos.style.opacity = '1';
        btnNeg.style.transform = 'scale(0.95)';
        btnNeg.style.opacity = '0.7';
    };

    btnNeg.onclick = () => {
        currentClass = -1;
        btnNeg.style.transform = 'scale(1)';
        btnNeg.style.opacity = '1';
        btnPos.style.transform = 'scale(0.95)';
        btnPos.style.opacity = '0.7';
    };

    container.querySelector('#boost-btn').onclick = () => {
        boost();
        draw();
    };

    container.querySelector('#clear-btn').onclick = () => {
        points = [];
        boosters = [];
        predictions = [];
        roundsEl.textContent = '0';
        draw();
    };

    btnPos.click();
    draw();
}
