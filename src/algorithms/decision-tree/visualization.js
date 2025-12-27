export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #22c55e;">
        <h2 style="margin: 0 0 0.5rem 0; color: #166534;">🌳 The Question Tree!</h2>
        <p style="margin: 0; color: #14532d; font-size: 1.1rem;">
          <b>Imagine a game of 20 questions!</b> "Is it bigger than a breadbox? Is it alive?"<br><br>
          <b>Decision Trees work the same way!</b> They ask yes/no questions about your data to sort things into groups.<br>
          "Is X > 200? Is Y < 150?" — Each question splits the data until everything is sorted! 🎯
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="dt-canvas" width="600" height="400" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- LEGEND -->
          <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; margin-bottom: 0.5rem;">Legend:</div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #22c55e;"></div>
              <span>🍏 Green Apples</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #ef4444;"></div>
              <span>🍎 Red Apples</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 30px; height: 3px; background: #8b5cf6;"></div>
              <span>Split Lines</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #22c55e;">🎮 Grow the Tree!</h3>
          
          <!-- CLASS SELECTION -->
          <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
            <button id="btn-green" style="background: #22c55e; flex: 1; font-size: 1.1rem;">🍏 Green</button>
            <button id="btn-red" style="background: #ef4444; flex: 1; font-size: 1.1rem; opacity: 0.6;">🍎 Red</button>
          </div>
          
          <div style="background: #f0fdf4; padding: 0.75rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #bbf7d0; font-size: 0.9rem; text-align: center;">
            👆 Click to add apples. Watch the tree figure out how to separate them!
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem; color: #334155;">
              🌳 Tree Depth: <span id="depth-value" style="color: #22c55e; font-size: 1.3rem;">3</span>
            </label>
            <input type="range" id="depth-slider" min="1" max="5" value="3" style="width: 100%; height: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #94a3b8;">
              <span>Simple (1)</span>
              <span>Complex (5)</span>
            </div>
          </div>

          <button id="clear-btn" style="width: 100%; background: #94a3b8;">🗑️ Clear All</button>
          
          <div id="tree-info" style="margin-top: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 12px; text-align: center; color: #64748b;">
            Add some apples to see the tree grow!
          </div>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 How does it decide?</h4>
        <p style="margin: 0; color: #64748b;">
          The tree asks questions like: "Is the X position greater than 300?"<br>
          • If YES → go right<br>
          • If NO → go left<br>
          It keeps asking until everything in each region is the <b>same color</b>!
          The <b>purple lines</b> show where it made cuts.
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#dt-canvas');
    const ctx = canvas.getContext('2d');
    const depthSlider = container.querySelector('#depth-slider');
    const depthValue = container.querySelector('#depth-value');
    const treeInfo = container.querySelector('#tree-info');
    const btnGreen = container.querySelector('#btn-green');
    const btnRed = container.querySelector('#btn-red');

    let points = [];
    let currentClass = 0;
    let maxDepth = 3;
    let tree = null;

    class TreeNode {
        constructor(depth) {
            this.depth = depth;
            this.left = null;
            this.right = null;
            this.splitFeature = null;
            this.splitValue = null;
            this.prediction = null;
            this.isLeaf = false;
            this.bounds = null;
        }
    }

    function giniImpurity(labels) {
        if (labels.length === 0) return 0;
        const p0 = labels.filter(l => l === 0).length / labels.length;
        return 1 - (p0 * p0 + (1 - p0) * (1 - p0));
    }

    function buildTree(pts, depth, bounds) {
        const node = new TreeNode(depth);
        node.bounds = bounds;

        if (pts.length === 0) {
            node.isLeaf = true;
            node.prediction = 0;
            return node;
        }

        const labels = pts.map(p => p.cls);
        const unique = [...new Set(labels)];

        if (unique.length === 1 || depth >= maxDepth) {
            node.isLeaf = true;
            node.prediction = labels.filter(l => l === 0).length >= labels.filter(l => l === 1).length ? 0 : 1;
            return node;
        }

        let bestGain = -1, bestFeature = null, bestValue = null, bestLeft = [], bestRight = [];

        ['x', 'y'].forEach(feature => {
            const vals = pts.map(p => p[feature]).sort((a, b) => a - b);
            for (let i = 0; i < vals.length - 1; i++) {
                const thresh = (vals[i] + vals[i + 1]) / 2;
                const left = pts.filter(p => p[feature] <= thresh);
                const right = pts.filter(p => p[feature] > thresh);
                if (left.length === 0 || right.length === 0) continue;

                const gain = giniImpurity(labels) -
                    (left.length * giniImpurity(left.map(p => p.cls)) + right.length * giniImpurity(right.map(p => p.cls))) / pts.length;

                if (gain > bestGain) {
                    bestGain = gain;
                    bestFeature = feature;
                    bestValue = thresh;
                    bestLeft = left;
                    bestRight = right;
                }
            }
        });

        if (bestFeature === null) {
            node.isLeaf = true;
            node.prediction = labels.filter(l => l === 0).length >= labels.length / 2 ? 0 : 1;
            return node;
        }

        node.splitFeature = bestFeature;
        node.splitValue = bestValue;

        const leftBounds = { ...bounds };
        const rightBounds = { ...bounds };
        if (bestFeature === 'x') {
            leftBounds.x2 = bestValue;
            rightBounds.x1 = bestValue;
        } else {
            leftBounds.y2 = bestValue;
            rightBounds.y1 = bestValue;
        }

        node.left = buildTree(bestLeft, depth + 1, leftBounds);
        node.right = buildTree(bestRight, depth + 1, rightBounds);

        return node;
    }

    function countSplits(node) {
        if (!node || node.isLeaf) return 0;
        return 1 + countSplits(node.left) + countSplits(node.right);
    }

    function drawRegions(node) {
        if (!node) return;
        if (node.isLeaf) {
            const { x1, y1, x2, y2 } = node.bounds;
            ctx.fillStyle = node.prediction === 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        } else {
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (node.splitFeature === 'x') {
                ctx.moveTo(node.splitValue, node.bounds.y1);
                ctx.lineTo(node.splitValue, node.bounds.y2);
            } else {
                ctx.moveTo(node.bounds.x1, node.splitValue);
                ctx.lineTo(node.bounds.x2, node.splitValue);
            }
            ctx.stroke();
            drawRegions(node.left);
            drawRegions(node.right);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (points.length > 0) {
            tree = buildTree(points, 0, { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height });
            drawRegions(tree);
            treeInfo.innerHTML = `🌳 Tree made <b>${countSplits(tree)}</b> splits to separate your apples!`;
        }

        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 0 ? '#22c55e' : '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.cls === 0 ? '🍏' : '🍎', p.x, p.y);
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, cls: currentClass });
        draw();
    });

    btnGreen.onclick = () => {
        currentClass = 0;
        btnGreen.style.opacity = '1';
        btnRed.style.opacity = '0.6';
    };

    btnRed.onclick = () => {
        currentClass = 1;
        btnRed.style.opacity = '1';
        btnGreen.style.opacity = '0.6';
    };

    depthSlider.addEventListener('input', (e) => {
        maxDepth = parseInt(e.target.value);
        depthValue.textContent = maxDepth;
        draw();
    });

    container.querySelector('#clear-btn').onclick = () => {
        points = [];
        tree = null;
        treeInfo.innerHTML = 'Add some apples to see the tree grow!';
        draw();
    };

    draw();
}
