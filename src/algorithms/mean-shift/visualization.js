export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #f59e0b;">
        <h2 style="margin: 0 0 0.5rem 0; color: #92400e;">🏔️ Roll Towards the Peaks!</h2>
        <p style="margin: 0; color: #78350f; font-size: 1.1rem;">
          <b>Imagine marbles on a bumpy surface.</b> They roll towards the lowest points (density peaks).<br><br>
          <b>Mean Shift</b> moves each point towards the densest area nearby, again and again, until points converge at cluster centers. No need to specify K! 🎯
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="ms-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #38bdf8;"></div>
              <span>Data points (colored by cluster)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #1e293b; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">★</div>
              <span>Converged centers</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #f59e0b;">⚙️ Mean Shift Control</h3>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem;">
              Bandwidth: <span id="bw-value" style="color: #f59e0b;">50</span>
            </label>
            <input type="range" id="bw-slider" min="25" max="100" value="50" style="width: 100%;">
            <div style="font-size: 0.8rem; color: #64748b;">How far to look for neighbors</div>
          </div>
          
          <div style="background: #fef3c7; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #fde68a; text-align: center;">
            <div style="font-size: 0.8rem; color: #92400e;">Iteration:</div>
            <div id="iteration" style="font-size: 2rem; font-weight: bold; color: #f59e0b;">0</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="step-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706);">👣 Step</button>
            <button id="run-btn" style="background: #22c55e;">▶️ Auto Run</button>
            <button id="random-btn" style="background: #6366f1;">🎲 Random Blobs</button>
            <button id="clear-btn" style="background: #94a3b8;">🗑️ Reset</button>
          </div>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 How Mean Shift Works</h4>
        <p style="margin: 0; color: #64748b;">
          <b>1. Kernel Window:</b> For each point, look at all neighbors within "bandwidth" distance<br>
          <b>2. Calculate Mean:</b> Find the weighted average position of neighbors (denser areas pull harder)<br>
          <b>3. Shift:</b> Move the point to this new mean position<br>
          <b>4. Repeat:</b> Until all points stop moving (converge at density peaks!)
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#ms-canvas');
    const ctx = canvas.getContext('2d');
    const bwSlider = container.querySelector('#bw-slider');
    const bwValue = container.querySelector('#bw-value');
    const iterationEl = container.querySelector('#iteration');

    let originalPoints = [], shiftedPoints = [];
    let bandwidth = 50, iteration = 0, isRunning = false, animId = null;
    const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc'];

    function gaussianKernel(dist, bw) { return Math.exp(-(dist * dist) / (2 * bw * bw)); }

    function step() {
        let totalShift = 0;
        shiftedPoints = shiftedPoints.map(p => {
            let sumX = 0, sumY = 0, sumWeight = 0;
            originalPoints.forEach(q => {
                const weight = gaussianKernel(Math.hypot(p.x - q.x, p.y - q.y), bandwidth);
                sumX += weight * q.x; sumY += weight * q.y; sumWeight += weight;
            });
            const newX = sumWeight > 0 ? sumX / sumWeight : p.x;
            const newY = sumWeight > 0 ? sumY / sumWeight : p.y;
            totalShift += Math.hypot(newX - p.x, newY - p.y);
            return { x: newX, y: newY };
        });
        iteration++;
        iterationEl.textContent = iteration;
        return totalShift < 0.5;
    }

    function assignClusters() {
        const clusters = [], threshold = bandwidth / 2;
        shiftedPoints.forEach((p, idx) => {
            let foundCluster = clusters.findIndex(c => Math.hypot(p.x - c.x, p.y - c.y) < threshold);
            if (foundCluster === -1) clusters.push({ x: p.x, y: p.y, indices: [idx] });
            else clusters[foundCluster].indices.push(idx);
        });
        return clusters;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const clusters = assignClusters();

        originalPoints.forEach((op, idx) => {
            const sp = shiftedPoints[idx];
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(op.x, op.y); ctx.lineTo(sp.x, sp.y); ctx.stroke();
        });

        clusters.forEach((cluster, cIdx) => {
            cluster.indices.forEach(idx => {
                ctx.beginPath();
                ctx.arc(originalPoints[idx].x, originalPoints[idx].y, 8, 0, Math.PI * 2);
                ctx.fillStyle = colors[cIdx % colors.length];
                ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
            });
            ctx.beginPath();
            ctx.arc(cluster.x, cluster.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = colors[cIdx % colors.length];
            ctx.fill(); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('★', cluster.x, cluster.y);
        });
    }

    function runLoop() {
        if (!isRunning) return;
        const converged = step(); draw();
        if (!converged) animId = requestAnimationFrame(runLoop);
        else { isRunning = false; container.querySelector('#run-btn').textContent = '▶️ Auto Run'; }
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        originalPoints.push({ x, y }); shiftedPoints.push({ x, y }); iteration = 0; draw();
    });

    bwSlider.addEventListener('input', (e) => { bandwidth = parseInt(e.target.value); bwValue.textContent = bandwidth; });
    container.querySelector('#step-btn').onclick = () => { step(); draw(); };
    container.querySelector('#run-btn').onclick = () => {
        if (isRunning) { isRunning = false; cancelAnimationFrame(animId); container.querySelector('#run-btn').textContent = '▶️ Auto Run'; }
        else { isRunning = true; container.querySelector('#run-btn').textContent = '⏹ Stop'; runLoop(); }
    };
    container.querySelector('#random-btn').onclick = () => {
        originalPoints = []; shiftedPoints = []; iteration = 0;
        for (let b = 0; b < 3; b++) {
            const cx = 100 + Math.random() * (canvas.width - 200), cy = 80 + Math.random() * (canvas.height - 160);
            for (let i = 0; i < 15; i++) {
                const x = cx + (Math.random() - 0.5) * 80, y = cy + (Math.random() - 0.5) * 80;
                originalPoints.push({ x, y }); shiftedPoints.push({ x, y });
            }
        }
        draw();
    };
    container.querySelector('#clear-btn').onclick = () => { originalPoints = []; shiftedPoints = []; iteration = 0; isRunning = false; iterationEl.textContent = '0'; draw(); };
    draw();
}
