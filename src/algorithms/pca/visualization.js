export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #fce7f3, #fbcfe8); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #ec4899;">
        <h2 style="margin: 0 0 0.5rem 0; color: #9d174d;">📉 Find the Data's Spine!</h2>
        <p style="margin: 0; color: #831843; font-size: 1.1rem;">
          <b>Imagine:</b> You have a cloud of data points floating in space! ☁️<br><br>
          <b>PCA finds the "spine"</b> — the main direction your data stretches!<br>
          It's like finding the longest stick you could push through a cloud! The <b>pink arrow</b> shows this direction.
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="pca-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- LEGEND -->
          <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #38bdf8;"></div>
              <span>Data Points</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #f59e0b;"></div>
              <span>Center (Mean)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 30px; height: 4px; background: #ec4899;"></div>
              <span>Main Direction (PC1)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 30px; height: 2px; background: #94a3b8; border-style: dashed;"></div>
              <span>Secondary (PC2)</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #ec4899;">🎮 Create a Data Cloud!</h3>
          
          <div style="background: #fdf2f8; padding: 0.75rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #fbcfe8; font-size: 0.9rem; text-align: center;">
            👆 Click to add points, or hit "Random Cloud" to generate a stretched blob!
          </div>
          
          <!-- VARIANCE EXPLAINED -->
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.25rem;">Main Direction Captures:</div>
            <div id="variance" style="font-size: 2.5rem; font-weight: bold; color: #ec4899;">0%</div>
            <div style="font-size: 0.8rem; color: #64748b;">of data spread</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="random-btn" style="background: linear-gradient(135deg, #ec4899, #f472b6); font-size: 1.1rem;">🎲 Random Cloud</button>
            <button id="clear-btn" style="background: #94a3b8;">🗑️ Clear</button>
          </div>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 Why is finding the "spine" useful?</h4>
        <p style="margin: 0; color: #64748b;">
          PCA helps <b>simplify data</b>! If the pink arrow captures 90% of the spread, you could almost ignore the gray direction!<br>
          This is called <b>dimensionality reduction</b> — turning 2D data into 1D without losing much info! 🧹
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#pca-canvas');
    const ctx = canvas.getContext('2d');
    const varianceEl = container.querySelector('#variance');

    let points = [];

    function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

    function pca() {
        if (points.length < 2) return null;

        const mx = mean(points.map(p => p.x));
        const my = mean(points.map(p => p.y));
        const centered = points.map(p => ({ x: p.x - mx, y: p.y - my }));

        let cxx = 0, cyy = 0, cxy = 0;
        centered.forEach(p => { cxx += p.x * p.x; cyy += p.y * p.y; cxy += p.x * p.y; });
        const n = points.length;
        cxx /= n; cyy /= n; cxy /= n;

        const trace = cxx + cyy;
        const det = cxx * cyy - cxy * cxy;
        const lambda1 = trace / 2 + Math.sqrt(Math.max(0, trace * trace / 4 - det));
        const lambda2 = trace / 2 - Math.sqrt(Math.max(0, trace * trace / 4 - det));

        let vx = Math.abs(cxy) > 0.0001 ? lambda1 - cyy : 1;
        let vy = Math.abs(cxy) > 0.0001 ? cxy : 0;
        const len = Math.sqrt(vx * vx + vy * vy) || 1;
        vx /= len; vy /= len;

        return { mx, my, vx, vy, lambda1, lambda2, variance: (lambda1 / (lambda1 + lambda2 + 0.001)) * 100 };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 50) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 50) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        const result = pca();

        if (result) {
            const { mx, my, vx, vy, lambda1, lambda2, variance } = result;
            varianceEl.textContent = variance.toFixed(0) + '%';
            varianceEl.style.color = variance >= 80 ? '#22c55e' : variance >= 50 ? '#f59e0b' : '#ef4444';

            const scale1 = Math.sqrt(lambda1) * 3;
            const scale2 = Math.sqrt(lambda2) * 3;

            // PC2 (secondary)
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(mx + vy * scale2, my - vx * scale2);
            ctx.lineTo(mx - vy * scale2, my + vx * scale2);
            ctx.stroke();
            ctx.setLineDash([]);

            // PC1 (main)
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(mx - vx * scale1, my - vy * scale1);
            ctx.lineTo(mx + vx * scale1, my + vy * scale1);
            ctx.stroke();

            // Arrowhead
            const ax = mx + vx * scale1, ay = my + vy * scale1;
            const angle = Math.atan2(vy, vx);
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - 15 * Math.cos(angle - Math.PI / 6), ay - 15 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(ax - 15 * Math.cos(angle + Math.PI / 6), ay - 15 * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();

            // Mean point
            ctx.beginPath();
            ctx.arc(mx, my, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            varianceEl.textContent = '0%';
        }

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        draw();
    });

    container.querySelector('#random-btn').onclick = () => {
        points = [];
        const cx = canvas.width / 2 + (Math.random() - 0.5) * 100;
        const cy = canvas.height / 2 + (Math.random() - 0.5) * 100;
        const angle = Math.random() * Math.PI;
        const spread = 100 + Math.random() * 80;
        const spread2 = 20 + Math.random() * 30;

        for (let i = 0; i < 50; i++) {
            const t = (Math.random() - 0.5) * spread;
            const s = (Math.random() - 0.5) * spread2;
            points.push({
                x: cx + t * Math.cos(angle) - s * Math.sin(angle),
                y: cy + t * Math.sin(angle) + s * Math.cos(angle)
            });
        }
        draw();
    };

    container.querySelector('#clear-btn').onclick = () => {
        points = [];
        draw();
    };

    draw();
}
