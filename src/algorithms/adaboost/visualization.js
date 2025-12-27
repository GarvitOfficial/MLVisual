export function init(container) {
    container.innerHTML = `
    <div style="display: flex; gap: 2rem; align-items: flex-start; justify-content: center; flex-wrap: wrap;">
      <div style="position: relative;">
        <canvas id="ada-canvas" width="600" height="400"></canvas>
      </div>
      
      <div class="controls-panel" style="flex: 1; min-width: 260px; max-width: 320px; padding: 1.5rem; border-radius: 20px;">
        <h3>🎯 AdaBoost</h3>
        <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">
          Each weak learner focuses on the mistakes of the previous one. Point size = weight!
        </p>
        
        <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
          <button id="btn-pos" style="background: #22c55e; flex: 1;">+ Class</button>
          <button id="btn-neg" style="background: #ef4444; flex: 1; transform: scale(0.95); opacity: 0.7;">- Class</button>
        </div>
        
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
          <div style="font-size: 0.8rem; color: #64748b;">Weak Learners:</div>
          <div id="learner-count" style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">0</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button id="boost-btn" style="background: var(--primary);">➕ Add Learner</button>
          <button id="clear-btn" style="background-color: #94a3b8; box-shadow: 0 4px 0 #64748b;">🗑️ Reset</button>
        </div>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#ada-canvas');
    const ctx = canvas.getContext('2d');
    const learnerCountEl = container.querySelector('#learner-count');
    const btnPos = container.querySelector('#btn-pos');
    const btnNeg = container.querySelector('#btn-neg');

    let points = [];
    let currentClass = 1;
    let weakLearners = [];

    function buildWeakLearner() {
        if (points.length < 2) return null;

        // Find best stump that minimizes weighted error
        let bestFeature = 'x';
        let bestThresh = 0;
        let bestPred = 1;
        let bestError = Infinity;

        ['x', 'y'].forEach(feature => {
            const vals = [...new Set(points.map(p => p[feature]))].sort((a, b) => a - b);

            vals.forEach(thresh => {
                [1, -1].forEach(pred => {
                    let error = 0;
                    points.forEach(p => {
                        const prediction = p[feature] <= thresh ? pred : -pred;
                        if (prediction !== p.cls) {
                            error += p.weight;
                        }
                    });

                    if (error < bestError) {
                        bestError = error;
                        bestFeature = feature;
                        bestThresh = thresh;
                        bestPred = pred;
                    }
                });
            });
        });

        // Calculate alpha
        const eps = 1e-10;
        const alpha = 0.5 * Math.log((1 - bestError + eps) / (bestError + eps));

        return {
            feature: bestFeature,
            thresh: bestThresh,
            pred: bestPred,
            alpha,
            predict: (x, y) => {
                const val = bestFeature === 'x' ? x : y;
                return val <= bestThresh ? bestPred : -bestPred;
            }
        };
    }

    function updateWeights(learner) {
        let sum = 0;
        points.forEach(p => {
            const pred = learner.predict(p.x, p.y);
            p.weight *= Math.exp(-learner.alpha * p.cls * pred);
            sum += p.weight;
        });
        // Normalize
        points.forEach(p => p.weight /= sum);
    }

    function boost() {
        if (points.length < 2) return;

        // Initialize weights if first learner
        if (weakLearners.length === 0) {
            points.forEach(p => p.weight = 1 / points.length);
        }

        const learner = buildWeakLearner();
        if (learner) {
            weakLearners.push(learner);
            updateWeights(learner);
            learnerCountEl.textContent = weakLearners.length;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (weakLearners.length > 0) {
            // Draw decision boundary
            const res = 25;
            const cellW = canvas.width / res;
            const cellH = canvas.height / res;

            for (let i = 0; i < res; i++) {
                for (let j = 0; j < res; j++) {
                    const x = (i + 0.5) * cellW;
                    const y = (j + 0.5) * cellH;

                    let score = 0;
                    weakLearners.forEach(l => {
                        score += l.alpha * l.predict(x, y);
                    });

                    const prob = 1 / (1 + Math.exp(-score * 2));
                    const r = Math.round((1 - prob) * 239);
                    const g = Math.round(prob * 197);
                    ctx.fillStyle = `rgba(${r}, ${g}, 94, 0.3)`;
                    ctx.fillRect(i * cellW, j * cellH, cellW, cellH);
                }
            }
        }

        // Draw points (size based on weight)
        points.forEach(p => {
            const radius = 5 + (p.weight || 1 / points.length) * points.length * 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.min(radius, 20), 0, Math.PI * 2);
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
        points.push({ x, y, cls: currentClass, weight: 1 / (points.length + 1) });
        // Reset weights
        points.forEach(p => p.weight = 1 / points.length);
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
        weakLearners = [];
        learnerCountEl.textContent = '0';
        draw();
    };

    btnPos.click();
    draw();
}
