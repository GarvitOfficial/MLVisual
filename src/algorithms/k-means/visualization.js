export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #f59e0b;">
        <h2 style="margin: 0 0 0.5rem 0; color: #92400e;">🎉 Party Time Grouping!</h2>
        <p style="margin: 0; color: #78350f; font-size: 1.1rem;">
          <b>Imagine this:</b> You're planning a HUGE party with 50 guests! 🥳<br>
          But you need to split them into groups for games. How do you decide who goes with who?<br><br>
          <b>K-Means helps!</b> It finds "Party Leaders" (the squares) and groups guests (dots) by who's closest to each leader!
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="kmeans-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- FLOATING LEGEND -->
          <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #94a3b8;"></div>
              <span>Guests (not grouped yet)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; background: #8b5cf6;"></div>
              <span>Party Leaders</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #8b5cf6;">🎮 Your Mission</h3>
          
          <!-- STEP INDICATORS -->
          <div id="steps" style="margin-bottom: 1.5rem;">
            <div class="step active" id="step1" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f0fdf4; border-radius: 12px; margin-bottom: 0.5rem; border: 2px solid #22c55e;">
              <div style="width: 28px; height: 28px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
              <div>
                <div style="font-weight: bold; color: #166534;">Add Guests!</div>
                <div style="font-size: 0.8rem; color: #64748b;">Tap the white area to invite people</div>
              </div>
            </div>
            
            <div class="step" id="step2" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 12px; margin-bottom: 0.5rem; border: 2px solid #e2e8f0; opacity: 0.6;">
              <div style="width: 28px; height: 28px; background: #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">2</div>
              <div>
                <div style="font-weight: bold; color: #475569;">Choose Groups</div>
                <div style="font-size: 0.8rem; color: #64748b;">Pick how many groups (K)</div>
              </div>
            </div>
            
            <div class="step" id="step3" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 12px; border: 2px solid #e2e8f0; opacity: 0.6;">
              <div style="width: 28px; height: 28px; background: #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">3</div>
              <div>
                <div style="font-weight: bold; color: #475569;">Watch the Magic!</div>
                <div style="font-size: 0.8rem; color: #64748b;">Hit "GO!" and watch groups form</div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem; color: #334155;">
              🎯 How many groups? <span id="k-value" style="color: #8b5cf6; font-size: 1.3rem;">3</span>
            </label>
            <input type="range" id="k-slider" min="2" max="6" value="3" style="width: 100%; height: 24px;">
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="run-btn" style="background: linear-gradient(135deg, #22c55e, #16a34a); font-size: 1.2rem; padding: 1rem;">
              🚀 GO! Watch the Magic!
            </button>
            <button id="step-btn" style="background: #8b5cf6;">👣 One Step at a Time</button>
            <button id="reset-btn" style="background: #f59e0b;">🔄 Try Again</button>
          </div>
          
          <!-- RESULT BOX -->
          <div id="result-box" style="display: none; margin-top: 1rem; padding: 1rem; background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-radius: 12px; text-align: center; border: 2px solid #22c55e;">
            <div style="font-size: 1.5rem;">🎊</div>
            <div style="font-weight: bold; color: #166534;">Groups Found!</div>
            <div id="result-text" style="color: #15803d;"></div>
          </div>
        </div>
      </div>
      
      <!-- WHAT'S HAPPENING EXPLAINER -->
      <div id="explainer" style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px; display: none;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">🔍 What just happened?</h4>
        <p id="explain-text" style="margin: 0; color: #64748b;"></p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#kmeans-canvas');
    const ctx = canvas.getContext('2d');
    const kSlider = container.querySelector('#k-slider');
    const kValueDisplay = container.querySelector('#k-value');
    const resultBox = container.querySelector('#result-box');
    const resultText = container.querySelector('#result-text');
    const explainer = container.querySelector('#explainer');
    const explainText = container.querySelector('#explain-text');

    let points = [];
    let centroids = [];
    let k = 3;
    let iteration = 0;
    let isRunning = false;
    let animationId = null;

    const colors = ['#f87171', '#38bdf8', '#4ade80', '#facc15', '#c084fc', '#fb923c'];

    function updateSteps(activeStep) {
        for (let i = 1; i <= 3; i++) {
            const step = container.querySelector(`#step${i}`);
            if (i < activeStep) {
                step.style.opacity = '1';
                step.style.background = '#dcfce7';
                step.style.borderColor = '#22c55e';
                step.querySelector('div:first-child').style.background = '#22c55e';
                step.querySelector('div:first-child').innerHTML = '✓';
            } else if (i === activeStep) {
                step.style.opacity = '1';
                step.style.background = '#f0fdf4';
                step.style.borderColor = '#22c55e';
            } else {
                step.style.opacity = '0.6';
                step.style.background = '#f8fafc';
                step.style.borderColor = '#e2e8f0';
            }
        }
    }

    function showExplanation(text) {
        explainer.style.display = 'block';
        explainText.textContent = text;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw connection lines
        if (centroids.length > 0) {
            points.forEach(p => {
                if (p.clusterIndex !== -1 && centroids[p.clusterIndex]) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(centroids[p.clusterIndex].x, centroids[p.clusterIndex].y);
                    ctx.strokeStyle = colors[p.clusterIndex] + '40';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }

        // Draw guests (points)
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = p.clusterIndex === -1 ? '#94a3b8' : colors[p.clusterIndex];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Face
            if (p.clusterIndex !== -1) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(p.x - 3, p.y - 2, 2, 0, Math.PI * 2);
                ctx.arc(p.x + 3, p.y - 2, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x, p.y + 3, 3, 0, Math.PI);
                ctx.stroke();
            }
        });

        // Draw party leaders (centroids)
        centroids.forEach((c, idx) => {
            // Glow
            ctx.beginPath();
            ctx.arc(c.x, c.y, 25, 0, Math.PI * 2);
            ctx.fillStyle = colors[idx] + '30';
            ctx.fill();

            // Square body
            ctx.fillStyle = colors[idx];
            ctx.fillRect(c.x - 15, c.y - 15, 30, 30);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.strokeRect(c.x - 15, c.y - 15, 30, 30);

            // Crown
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.moveTo(c.x - 10, c.y - 15);
            ctx.lineTo(c.x - 10, c.y - 25);
            ctx.lineTo(c.x - 5, c.y - 20);
            ctx.lineTo(c.x, c.y - 28);
            ctx.lineTo(c.x + 5, c.y - 20);
            ctx.lineTo(c.x + 10, c.y - 25);
            ctx.lineTo(c.x + 10, c.y - 15);
            ctx.closePath();
            ctx.fill();
        });
    }

    function initCentroids() {
        if (points.length === 0) return;
        centroids = [];
        const usedIndices = new Set();
        for (let i = 0; i < k; i++) {
            let idx;
            do {
                idx = Math.floor(Math.random() * points.length);
            } while (usedIndices.has(idx) && usedIndices.size < points.length);
            usedIndices.add(idx);
            centroids.push({ ...points[idx] });
        }
        iteration = 0;
        updateSteps(3);
        showExplanation(`We placed ${k} Party Leaders randomly! Now they'll look for their closest guests.`);
        draw();
    }

    function assignClusters() {
        let changed = false;
        points.forEach(p => {
            let minDist = Infinity;
            let closestIdx = -1;
            centroids.forEach((c, idx) => {
                const dist = Math.hypot(p.x - c.x, p.y - c.y);
                if (dist < minDist) {
                    minDist = dist;
                    closestIdx = idx;
                }
            });
            if (p.clusterIndex !== closestIdx) {
                changed = true;
                p.clusterIndex = closestIdx;
            }
        });
        return changed;
    }

    function updateCentroids() {
        let maxShift = 0;
        centroids.forEach((c, idx) => {
            const clusterPoints = points.filter(p => p.clusterIndex === idx);
            if (clusterPoints.length === 0) return;

            const newX = clusterPoints.reduce((s, p) => s + p.x, 0) / clusterPoints.length;
            const newY = clusterPoints.reduce((s, p) => s + p.y, 0) / clusterPoints.length;

            maxShift = Math.max(maxShift, Math.hypot(newX - c.x, newY - c.y));
            c.x = newX;
            c.y = newY;
        });
        return maxShift;
    }

    function step() {
        if (centroids.length === 0) {
            initCentroids();
            return true;
        }

        assignClusters();
        draw();

        const shift = updateCentroids();
        draw();
        iteration++;

        showExplanation(`Round ${iteration}: Each guest joined their nearest leader. Leaders moved to the center of their group!`);

        if (shift < 1) {
            isRunning = false;
            resultBox.style.display = 'block';
            const groupCounts = centroids.map((_, i) => points.filter(p => p.clusterIndex === i).length);
            resultText.textContent = `${k} perfect groups: ${groupCounts.join(', ')} guests each!`;
            showExplanation(`DONE in ${iteration} rounds! 🎉 Everyone found their group! The leaders stopped moving because everyone is happy.`);
            container.querySelector('#run-btn').textContent = '🚀 GO! Watch the Magic!';
            return false;
        }
        return true;
    }

    function runAuto() {
        if (!isRunning) return;
        if (step()) {
            animationId = setTimeout(runAuto, 600);
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            clusterIndex: -1
        });
        if (points.length >= 3) updateSteps(2);
        resultBox.style.display = 'none';
        draw();
    });

    kSlider.addEventListener('input', (e) => {
        k = parseInt(e.target.value);
        kValueDisplay.textContent = k;
        centroids = [];
        points.forEach(p => p.clusterIndex = -1);
        resultBox.style.display = 'none';
        draw();
    });

    container.querySelector('#step-btn').onclick = () => {
        if (isRunning) return;
        if (points.length < k) {
            showExplanation(`Add at least ${k} guests first! (You have ${points.length})`);
            return;
        }
        step();
    };

    container.querySelector('#run-btn').onclick = (e) => {
        if (points.length < k) {
            showExplanation(`Add at least ${k} guests first! (You have ${points.length})`);
            return;
        }
        if (isRunning) {
            isRunning = false;
            clearTimeout(animationId);
            e.target.textContent = '🚀 GO! Watch the Magic!';
        } else {
            isRunning = true;
            e.target.textContent = '⏹ Stop';
            resultBox.style.display = 'none';
            if (centroids.length === 0) initCentroids();
            runAuto();
        }
    };

    container.querySelector('#reset-btn').onclick = () => {
        isRunning = false;
        clearTimeout(animationId);
        points.forEach(p => p.clusterIndex = -1);
        centroids = [];
        iteration = 0;
        resultBox.style.display = 'none';
        explainer.style.display = 'none';
        updateSteps(1);
        container.querySelector('#run-btn').textContent = '🚀 GO! Watch the Magic!';
        draw();
    };

    // Generate initial random guests
    for (let i = 0; i < 30; i++) {
        points.push({
            x: 50 + Math.random() * (canvas.width - 100),
            y: 50 + Math.random() * (canvas.height - 100),
            clusterIndex: -1
        });
    }
    updateSteps(2);
    draw();

    return () => {
        isRunning = false;
        clearTimeout(animationId);
    };
}
