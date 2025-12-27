export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #fce7f3, #fbcfe8); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #ec4899;">
        <h2 style="margin: 0 0 0.5rem 0; color: #9d174d;">🗳️ The Voting Neighbors!</h2>
        <p style="margin: 0; color: #831843; font-size: 1.1rem;">
          <b>Imagine:</b> You just moved to a new neighborhood! Will you join the 🍎 Apple Club or 🫐 Berry Club?<br><br>
          <b>KNN says:</b> "Ask your K closest neighbors! Whatever MOST of them are, you become that too!"<br>
          It's like a democracy where your neighbors vote on your identity! 🏠
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="knn-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- DRAG HINT -->
          <div id="drag-hint" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); text-align: center; pointer-events: none;">
            <div style="font-size: 2rem;">👆</div>
            <div style="font-weight: bold; color: #334155;">Drag the "?" circle!</div>
            <div style="color: #64748b; font-size: 0.9rem;">Move it around and watch neighbors vote</div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #ec4899;">🎮 How It Works</h3>
          
          <div style="background: #fdf2f8; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #fbcfe8;">
            <div style="font-weight: bold; color: #be185d;">The "?" is YOU (the new neighbor)</div>
            <div style="color: #64748b; font-size: 0.9rem;">Drag it around to see which club you'd join based on who's nearby!</div>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="font-weight: bold; display: block; margin-bottom: 0.5rem; color: #334155;">
              🤝 Ask how many neighbors? <span id="k-value" style="color: #ec4899; font-size: 1.3rem;">3</span>
            </label>
            <input type="range" id="k-slider" min="1" max="9" value="3" style="width: 100%; height: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #94a3b8;">
              <span>1 (risky!)</span>
              <span>9 (safe)</span>
            </div>
          </div>
          
          <!-- VOTE DISPLAY -->
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">🗳️ Neighbor Votes:</div>
            <div id="votes" style="display: flex; gap: 0.25rem; flex-wrap: wrap; font-size: 1.5rem;"></div>
            <div id="winner" style="margin-top: 0.75rem; font-size: 1.2rem; font-weight: bold; text-align: center;"></div>
          </div>
          
          <button id="reset-btn" style="width: 100%; background: #f59e0b;">🔀 Scramble Neighbors</button>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 Why does K matter?</h4>
        <p style="margin: 0; color: #64748b;">
          <b>K=1:</b> Only your CLOSEST neighbor decides. Risky! What if they're weird? 🤪<br>
          <b>K=9:</b> Many neighbors vote. Safer but slower. What if they're far away? 🤔<br>
          <b>Sweet spot:</b> Usually K=3 to 7 works best!
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#knn-canvas');
    const ctx = canvas.getContext('2d');
    const kSlider = container.querySelector('#k-slider');
    const kValueDisplay = container.querySelector('#k-value');
    const votesEl = container.querySelector('#votes');
    const winnerEl = container.querySelector('#winner');
    const dragHint = container.querySelector('#drag-hint');

    let points = [];
    let k = 3;
    let queryPoint = { x: canvas.width / 2, y: canvas.height / 2 };
    let isDragging = false;
    let hasInteracted = false;

    const classes = [
        { name: 'Apple Club', color: '#ef4444', emoji: '🍎' },
        { name: 'Berry Club', color: '#3b82f6', emoji: '🫐' }
    ];

    function generatePoints() {
        points = [];
        // Create two clusters
        for (let i = 0; i < 15; i++) {
            points.push({
                x: 100 + Math.random() * 150,
                y: 100 + Math.random() * 180,
                cls: 0
            });
        }
        for (let i = 0; i < 15; i++) {
            points.push({
                x: 300 + Math.random() * 150,
                y: 100 + Math.random() * 180,
                cls: 1
            });
        }
        draw();
    }

    function getNearestNeighbors() {
        const withDist = points.map(p => ({
            ...p,
            dist: Math.hypot(p.x - queryPoint.x, p.y - queryPoint.y)
        }));
        withDist.sort((a, b) => a.dist - b.dist);
        return withDist.slice(0, k);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const nearest = getNearestNeighbors();

        // Vote count
        const votes = { 0: 0, 1: 0 };
        nearest.forEach(p => votes[p.cls]++);

        const winner = votes[0] > votes[1] ? 0 : votes[1] > votes[0] ? 1 : -1;
        queryPoint.color = winner === -1 ? '#94a3b8' : classes[winner].color;

        // Draw connection lines to nearest
        nearest.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(queryPoint.x, queryPoint.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Draw all neighbors
        points.forEach(p => {
            const isNearest = nearest.includes(p);

            ctx.beginPath();
            ctx.arc(p.x, p.y, isNearest ? 14 : 10, 0, Math.PI * 2);
            ctx.fillStyle = classes[p.cls].color;
            ctx.fill();
            ctx.strokeStyle = isNearest ? '#1e293b' : '#fff';
            ctx.lineWidth = isNearest ? 3 : 2;
            ctx.stroke();

            // Emoji
            ctx.font = isNearest ? '16px sans-serif' : '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(classes[p.cls].emoji, p.x, p.y);
        });

        // Draw query point
        // Glow
        ctx.beginPath();
        ctx.arc(queryPoint.x, queryPoint.y, 35, 0, Math.PI * 2);
        ctx.fillStyle = queryPoint.color + '30';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(queryPoint.x, queryPoint.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = queryPoint.color;
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Fredoka';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', queryPoint.x, queryPoint.y);

        // Update vote display
        votesEl.innerHTML = nearest.map(n => classes[n.cls].emoji).join('');

        if (winner === -1) {
            winnerEl.innerHTML = '🤔 It\'s a TIE!';
            winnerEl.style.color = '#94a3b8';
        } else {
            winnerEl.innerHTML = `You join: ${classes[winner].emoji} ${classes[winner].name}!`;
            winnerEl.style.color = classes[winner].color;
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (Math.hypot(x - queryPoint.x, y - queryPoint.y) < 30) {
            isDragging = true;
            hasInteracted = true;
            dragHint.style.display = 'none';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        queryPoint.x = Math.max(30, Math.min(e.clientX - rect.left, canvas.width - 30));
        queryPoint.y = Math.max(30, Math.min(e.clientY - rect.top, canvas.height - 30));
        draw();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    kSlider.addEventListener('input', (e) => {
        k = parseInt(e.target.value);
        kValueDisplay.textContent = k;
        draw();
    });

    container.querySelector('#reset-btn').onclick = () => {
        generatePoints();
        queryPoint = { x: canvas.width / 2, y: canvas.height / 2 };
        draw();
    };

    generatePoints();
}
