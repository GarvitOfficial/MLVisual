export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #22c55e;">
        <h2 style="margin: 0 0 0.5rem 0; color: #166534;">🌲🌲🌲 The Wisdom of the Crowd!</h2>
        <p style="margin: 0; color: #14532d; font-size: 1.1rem;">
          <b>One tree can make mistakes</b>, but what if we grow a whole FOREST of trees?<br><br>
          <b>Random Forest</b> creates many decision trees, each trained on random subsets of data. Then they all <b>vote</b>! The majority wins. 🗳️
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="rf-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; margin-bottom: 0.25rem;">Color = Majority Vote</div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; background: rgba(34,197,94,0.3);"></div>
              <span>Trees say ✓</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; background: rgba(239,68,68,0.3);"></div>
              <span>Trees say ✗</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #22c55e;">🎮 Grow Your Forest!</h3>

          <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
            <button id="btn-yes" style="background: #22c55e; flex: 1;">✓ Positive</button>
            <button id="btn-no" style="background: #ef4444; flex: 1; opacity: 0.6;">✗ Negative</button>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem;">
              🌲 Number of Trees: <span id="tree-count" style="color: #22c55e; font-size: 1.3rem;">5</span>
            </label>
            <input type="range" id="tree-slider" min="1" max="20" value="5" style="width: 100%;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8;">
              <span>1 (weak)</span>
              <span>20 (strong)</span>
            </div>
          </div>
          
          <!-- VOTE DISPLAY -->
          <div style="background: #f0fdf4; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #bbf7d0;">
            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">🗳️ Tree Votes (for center):</div>
            <div id="votes" style="display: flex; gap: 0.25rem; flex-wrap: wrap; font-size: 1.3rem;">—</div>
          </div>

          <button id="clear-btn" style="width: 100%; background: #94a3b8;">🗑️ Clear</button>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 Why does Random Forest work so well?</h4>
        <p style="margin: 0; color: #64748b;">
          <b>Bagging:</b> Each tree sees a random sample of data (some data is repeated, some missing)<br>
          <b>Random Features:</b> Each split considers random features<br>
          <b>Voting:</b> Individual trees may overfit, but averaging many trees cancels out errors!<br><br>
          More trees = smoother, more reliable predictions! 🎯
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#rf-canvas');
    const ctx = canvas.getContext('2d');
    const treeSlider = container.querySelector('#tree-slider');
    const treeCountEl = container.querySelector('#tree-count');
    const votesEl = container.querySelector('#votes');
    const btnYes = container.querySelector('#btn-yes');
    const btnNo = container.querySelector('#btn-no');

    let points = [];
    let currentClass = 1;
    let numTrees = 5;

    function buildStump(subset) {
        if (subset.length === 0) return { predict: () => 0 };
        const feature = Math.random() > 0.5 ? 'x' : 'y';
        const vals = subset.map(p => p[feature]);
        const thresh = Math.min(...vals) + Math.random() * (Math.max(...vals) - Math.min(...vals));

        const leftLabels = subset.filter(p => p[feature] <= thresh).map(p => p.cls);
        const rightLabels = subset.filter(p => p[feature] > thresh).map(p => p.cls);

        const leftPred = leftLabels.filter(l => l === 1).length >= leftLabels.length / 2 ? 1 : 0;
        const rightPred = rightLabels.filter(l => l === 1).length >= rightLabels.length / 2 ? 1 : 0;

        return { predict: (x, y) => (feature === 'x' ? x : y) <= thresh ? leftPred : rightPred };
    }

    function bootstrap(arr) {
        return Array.from({ length: arr.length }, () => arr[Math.floor(Math.random() * arr.length)]);
    }

    function buildForest() {
        if (points.length < 2) return [];
        return Array.from({ length: numTrees }, () => buildStump(bootstrap(points)));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const forest = buildForest();

        if (forest.length > 0) {
            const res = 20;
            const cellW = canvas.width / res, cellH = canvas.height / res;

            for (let i = 0; i < res; i++) {
                for (let j = 0; j < res; j++) {
                    const x = (i + 0.5) * cellW, y = (j + 0.5) * cellH;
                    const yesVotes = forest.filter(t => t.predict(x, y) === 1).length;
                    const ratio = yesVotes / forest.length;
                    ctx.fillStyle = `rgba(${Math.round((1 - ratio) * 239)}, ${Math.round(ratio * 197)}, 94, 0.3)`;
                    ctx.fillRect(i * cellW, j * cellH, cellW, cellH);
                }
            }

            const centerVotes = forest.map(t => t.predict(canvas.width / 2, canvas.height / 2) === 1 ? '✓' : '✗');
            votesEl.innerHTML = centerVotes.map(v => `<span style="color: ${v === '✓' ? '#22c55e' : '#ef4444'}">${v}</span>`).join('');
        }

        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 1 ? '#22c55e' : '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, cls: currentClass });
        draw();
    });

    treeSlider.addEventListener('input', (e) => {
        numTrees = parseInt(e.target.value);
        treeCountEl.textContent = numTrees;
        draw();
    });

    btnYes.onclick = () => { currentClass = 1; btnYes.style.opacity = '1'; btnNo.style.opacity = '0.6'; };
    btnNo.onclick = () => { currentClass = 0; btnNo.style.opacity = '1'; btnYes.style.opacity = '0.6'; };

    container.querySelector('#clear-btn').onclick = () => { points = []; votesEl.textContent = '—'; draw(); };

    draw();
}
