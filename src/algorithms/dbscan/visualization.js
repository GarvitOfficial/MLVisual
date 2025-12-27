export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #e0e7ff, #c7d2fe); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #6366f1;">
        <h2 style="margin: 0 0 0.5rem 0; color: #3730a3;">🫧 Density-Based Clustering!</h2>
        <p style="margin: 0; color: #312e81; font-size: 1.1rem;">
          <b>The Problem with K-Means:</b> You have to pick K ahead of time, and it only finds "ball-shaped" clusters.<br><br>
          <b>DBSCAN is smarter!</b> It finds clusters by looking at <b>density</b>. Dense regions = clusters. Sparse points = noise (outliers). No need to pick K! 🎯
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="dbscan-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #94a3b8;"></div>
              <span>Gray = Noise/Outlier</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: linear-gradient(135deg, #f87171, #38bdf8);"></div>
              <span>Colors = Clusters found!</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #6366f1;">⚙️ DBSCAN Parameters</h3>
          
          <div style="margin-bottom: 1rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem;">
              ε (Epsilon): <span id="eps-value" style="color: #6366f1;">30</span> pixels
            </label>
            <input type="range" id="eps-slider" min="15" max="80" value="30" style="width: 100%;">
            <div style="font-size: 0.8rem; color: #64748b;">How close is "nearby"?</div>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem;">
              MinPts: <span id="minpts-value" style="color: #6366f1;">3</span> neighbors
            </label>
            <input type="range" id="minpts-slider" min="2" max="10" value="3" style="width: 100%;">
            <div style="font-size: 0.8rem; color: #64748b;">Min neighbors to be a "core" point</div>
          </div>
          
          <div style="background: #f0f9ff; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #bae6fd; text-align: center;">
            <div style="font-size: 0.8rem; color: #64748b;">Clusters Found:</div>
            <div id="cluster-count" style="font-size: 2rem; font-weight: bold; color: #6366f1;">0</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="random-btn" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">🎲 Random Blobs</button>
            <button id="clear-btn" style="background: #94a3b8;">🗑️ Clear</button>
          </div>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 How DBSCAN Works</h4>
        <p style="margin: 0; color: #64748b;">
          <b>1. Core Points:</b> If a point has ≥ MinPts neighbors within ε distance, it's a "core" point.<br>
          <b>2. Expand:</b> Core points and their neighbors form clusters. Clusters grow by connecting nearby core points.<br>
          <b>3. Noise:</b> Points not reachable from any core point are marked as noise (gray).
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#dbscan-canvas');
    const ctx = canvas.getContext('2d');
    const epsSlider = container.querySelector('#eps-slider');
    const epsValue = container.querySelector('#eps-value');
    const minptsSlider = container.querySelector('#minpts-slider');
    const minptsValue = container.querySelector('#minpts-value');
    const clusterCountEl = container.querySelector('#cluster-count');

    let points = [];
    let eps = 30, minPts = 3;
    const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];

    function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function getNeighbors(p) { return points.filter(q => distance(p, q) <= eps); }

    function dbscan() {
        points.forEach(p => { p.cluster = undefined; p.visited = false; });
        let clusterIdx = 0;

        points.forEach(p => {
            if (p.visited) return;
            p.visited = true;
            const neighbors = getNeighbors(p);
            if (neighbors.length < minPts) { p.cluster = -1; }
            else {
                expandCluster(p, neighbors, clusterIdx);
                clusterIdx++;
            }
        });
        return clusterIdx;
    }

    function expandCluster(point, neighbors, clusterIdx) {
        point.cluster = clusterIdx;
        const queue = [...neighbors];
        while (queue.length > 0) {
            const current = queue.shift();
            if (!current.visited) {
                current.visited = true;
                const currentNeighbors = getNeighbors(current);
                if (currentNeighbors.length >= minPts) {
                    currentNeighbors.forEach(n => { if (!queue.includes(n) && (n.cluster === undefined || n.cluster === -1)) queue.push(n); });
                }
            }
            if (current.cluster === undefined || current.cluster === -1) current.cluster = clusterIdx;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const numClusters = dbscan();
        clusterCountEl.textContent = numClusters;

        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = p.cluster === -1 ? '#94a3b8' : colors[p.cluster % colors.length];
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

    epsSlider.addEventListener('input', (e) => { eps = parseInt(e.target.value); epsValue.textContent = eps; draw(); });
    minptsSlider.addEventListener('input', (e) => { minPts = parseInt(e.target.value); minptsValue.textContent = minPts; draw(); });

    container.querySelector('#random-btn').onclick = () => {
        points = [];
        for (let b = 0; b < 3; b++) {
            const cx = 100 + Math.random() * (canvas.width - 200);
            const cy = 80 + Math.random() * (canvas.height - 160);
            for (let i = 0; i < 12 + Math.floor(Math.random() * 8); i++) {
                points.push({ x: cx + (Math.random() - 0.5) * 70, y: cy + (Math.random() - 0.5) * 70 });
            }
        }
        for (let i = 0; i < 5; i++) points.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
        draw();
    };

    container.querySelector('#clear-btn').onclick = () => { points = []; draw(); };
    draw();
}
