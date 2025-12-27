export function init(container) {
    container.innerHTML = `
    <div style="display: flex; gap: 2rem; align-items: flex-start; justify-content: center; flex-wrap: wrap;">
      <div style="position: relative;">
        <canvas id="hc-canvas" width="600" height="400"></canvas>
      </div>
      
      <div class="controls-panel" style="flex: 1; min-width: 260px; max-width: 320px; padding: 1.5rem; border-radius: 20px;">
        <h3>🌳 Hierarchical Clustering</h3>
        <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">
          Watch clusters merge step by step! Adjust the "cut height" to control final clusters.
        </p>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="font-weight: bold; display: block; margin-bottom: 0.5rem;">Number of Clusters: <span id="cluster-value" style="color: var(--primary);">3</span></label>
          <input type="range" id="cluster-slider" min="1" max="10" value="3">
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button id="random-btn" style="background: var(--primary);">🎲 Random Points</button>
          <button id="clear-btn" style="background-color: #94a3b8; box-shadow: 0 4px 0 #64748b;">🗑️ Clear</button>
        </div>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#hc-canvas');
    const ctx = canvas.getContext('2d');
    const clusterSlider = container.querySelector('#cluster-slider');
    const clusterValue = container.querySelector('#cluster-value');

    let points = [];
    let numClusters = 3;

    const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#a3e635'];

    function distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function clusterDistance(c1, c2) {
        // Single linkage (min distance)
        let minDist = Infinity;
        c1.forEach(p1 => {
            c2.forEach(p2 => {
                const d = distance(p1, p2);
                if (d < minDist) minDist = d;
            });
        });
        return minDist;
    }

    function hierarchicalClustering() {
        if (points.length === 0) return [];

        // Start with each point as its own cluster
        let clusters = points.map((p, i) => [{ ...p, idx: i }]);

        // Merge until we have desired number
        while (clusters.length > numClusters) {
            // Find closest pair
            let minDist = Infinity;
            let mergeI = 0, mergeJ = 1;

            for (let i = 0; i < clusters.length; i++) {
                for (let j = i + 1; j < clusters.length; j++) {
                    const d = clusterDistance(clusters[i], clusters[j]);
                    if (d < minDist) {
                        minDist = d;
                        mergeI = i;
                        mergeJ = j;
                    }
                }
            }

            // Merge
            const merged = [...clusters[mergeI], ...clusters[mergeJ]];
            clusters = clusters.filter((_, idx) => idx !== mergeI && idx !== mergeJ);
            clusters.push(merged);
        }

        return clusters;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const clusters = hierarchicalClustering();

        // Draw connections within clusters
        clusters.forEach((cluster, cIdx) => {
            if (cluster.length > 1) {
                ctx.strokeStyle = colors[cIdx % colors.length] + '44';
                ctx.lineWidth = 2;
                for (let i = 0; i < cluster.length; i++) {
                    for (let j = i + 1; j < cluster.length; j++) {
                        ctx.beginPath();
                        ctx.moveTo(cluster[i].x, cluster[i].y);
                        ctx.lineTo(cluster[j].x, cluster[j].y);
                        ctx.stroke();
                    }
                }
            }
        });

        // Draw points
        clusters.forEach((cluster, cIdx) => {
            cluster.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = colors[cIdx % colors.length];
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y });
        draw();
    });

    clusterSlider.addEventListener('input', (e) => {
        numClusters = parseInt(e.target.value);
        clusterValue.textContent = numClusters;
        draw();
    });

    container.querySelector('#random-btn').onclick = () => {
        points = [];
        for (let i = 0; i < 20; i++) {
            points.push({
                x: 50 + Math.random() * (canvas.width - 100),
                y: 50 + Math.random() * (canvas.height - 100)
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
