export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #e0e7ff, #c7d2fe); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #6366f1;">
        <h2 style="margin: 0 0 0.5rem 0; color: #3730a3;">☁️ Soft Probability Clouds!</h2>
        <p style="margin: 0; color: #312e81; font-size: 1.1rem;">
          <b>Unlike K-Means:</b> where each point belongs to exactly ONE cluster...<br><br>
          <b>GMM says:</b> "Each point has a PROBABILITY of belonging to each cluster!" Point near the edge? Maybe 60% cluster A, 40% cluster B. It's fuzzy! 🌫️
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="gmm-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 40px; height: 16px; background: radial-gradient(circle, rgba(248,113,113,0.5), transparent); border-radius: 8px;"></div>
              <span>Gaussian "cloud"</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #1e293b;"></div>
              <span>Cluster center (mean)</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #6366f1;">⚙️ GMM Controls</h3>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem;">
              Number of Clusters (K): <span id="k-value" style="color: #6366f1;">3</span>
            </label>
            <input type="range" id="k-slider" min="2" max="5" value="3" style="width: 100%;">
          </div>
          
          <div style="background: #f0f9ff; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #bae6fd; text-align: center;">
            <div style="font-size: 0.8rem; color: #64748b;">EM Iteration:</div>
            <div id="iteration" style="font-size: 2rem; font-weight: bold; color: #6366f1;">0</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="step-btn" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">👣 EM Step</button>
            <button id="run-btn" style="background: #22c55e;">▶️ Auto Run</button>
            <button id="random-btn" style="background: #f59e0b;">🎲 Random Data</button>
            <button id="clear-btn" style="background: #94a3b8;">🗑️ Reset</button>
          </div>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 The EM Algorithm (Expectation-Maximization)</h4>
        <p style="margin: 0; color: #64748b;">
          <b>E-Step (Expectation):</b> For each point, calculate probability it belongs to each cluster<br>
          <b>M-Step (Maximization):</b> Update cluster means and variances based on these probabilities<br>
          <b>Repeat:</b> Until clusters stabilize!<br><br>
          The colored "clouds" show the Gaussian distributions. Bigger cloud = more variance in that cluster.
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#gmm-canvas');
    const ctx = canvas.getContext('2d');
    const kSlider = container.querySelector('#k-slider');
    const kValue = container.querySelector('#k-value');
    const iterationEl = container.querySelector('#iteration');

    let points = [], k = 3;
    let means = [], variances = [], weights = [], responsibilities = [];
    let iteration = 0, isRunning = false, animId = null;
    const colors = ['#f87171', '#38bdf8', '#4ade80', '#facc15', '#c084fc'];

    function initParams() {
        means = []; variances = []; weights = [];
        for (let i = 0; i < k; i++) {
            means.push({ x: 100 + Math.random() * (canvas.width - 200), y: 100 + Math.random() * (canvas.height - 200) });
            variances.push(3000 + Math.random() * 2000);
            weights.push(1 / k);
        }
        responsibilities = points.map(() => new Array(k).fill(1 / k));
        iteration = 0;
    }

    function gaussian(x, y, mean, variance) {
        const dist2 = (x - mean.x) ** 2 + (y - mean.y) ** 2;
        return Math.exp(-dist2 / (2 * variance)) / (2 * Math.PI * variance);
    }

    function eStep() {
        points.forEach((p, pi) => {
            let sum = 0;
            const probs = [];
            for (let j = 0; j < k; j++) {
                const prob = weights[j] * gaussian(p.x, p.y, means[j], variances[j]);
                probs.push(prob); sum += prob;
            }
            for (let j = 0; j < k; j++) responsibilities[pi][j] = sum > 0 ? probs[j] / sum : 1 / k;
        });
    }

    function mStep() {
        for (let j = 0; j < k; j++) {
            let sumResp = 0, sumX = 0, sumY = 0, sumVar = 0;
            points.forEach((p, pi) => { const r = responsibilities[pi][j]; sumResp += r; sumX += r * p.x; sumY += r * p.y; });
            if (sumResp > 0) {
                means[j] = { x: sumX / sumResp, y: sumY / sumResp };
                points.forEach((p, pi) => { sumVar += responsibilities[pi][j] * ((p.x - means[j].x) ** 2 + (p.y - means[j].y) ** 2); });
                variances[j] = Math.max(sumVar / sumResp, 500);
                weights[j] = sumResp / points.length;
            }
        }
    }

    function step() {
        if (points.length < k) return false;
        eStep(); mStep();
        iteration++;
        iterationEl.textContent = iteration;
        return true;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        means.forEach((m, j) => {
            const radius = Math.sqrt(variances[j]);
            const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, radius);
            gradient.addColorStop(0, colors[j] + '66');
            gradient.addColorStop(1, colors[j] + '00');
            ctx.beginPath();
            ctx.arc(m.x, m.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        points.forEach((p, pi) => {
            let maxR = 0, maxJ = 0;
            if (responsibilities[pi]) responsibilities[pi].forEach((r, j) => { if (r > maxR) { maxR = r; maxJ = j; } });
            ctx.beginPath();
            ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = colors[maxJ];
            ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        });

        means.forEach((m, j) => {
            ctx.beginPath();
            ctx.arc(m.x, m.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = colors[j];
            ctx.fill(); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.stroke();
        });
    }

    function runLoop() {
        if (!isRunning || points.length < k) return;
        step(); draw();
        animId = setTimeout(runLoop, 150);
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        if (means.length === 0) initParams();
        responsibilities.push(new Array(k).fill(1 / k));
        draw();
    });

    kSlider.addEventListener('input', (e) => { k = parseInt(e.target.value); kValue.textContent = k; if (points.length > 0) initParams(); draw(); });
    container.querySelector('#step-btn').onclick = () => { if (points.length < k) return; if (means.length === 0) initParams(); step(); draw(); };
    container.querySelector('#run-btn').onclick = () => {
        if (isRunning) { isRunning = false; clearTimeout(animId); container.querySelector('#run-btn').textContent = '▶️ Auto Run'; }
        else { if (points.length < k) return; if (means.length === 0) initParams(); isRunning = true; container.querySelector('#run-btn').textContent = '⏹ Stop'; runLoop(); }
    };
    container.querySelector('#random-btn').onclick = () => {
        points = [];
        for (let b = 0; b < 3; b++) {
            const cx = 100 + Math.random() * (canvas.width - 200), cy = 80 + Math.random() * (canvas.height - 160);
            for (let i = 0; i < 20; i++) points.push({ x: cx + (Math.random() - 0.5) * 100, y: cy + (Math.random() - 0.5) * 100 });
        }
        initParams(); draw();
    };
    container.querySelector('#clear-btn').onclick = () => { points = []; means = []; isRunning = false; clearTimeout(animId); iteration = 0; iterationEl.textContent = '0'; draw(); };
    draw();
}
