export function init(container) {
    container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #f59e0b;">
        <h2 style="margin: 0 0 0.5rem 0; color: #92400e;">🚧 Build the Widest Road!</h2>
        <p style="margin: 0; color: #78350f; font-size: 1.1rem;">
          <b>The Problem:</b> Two teams (🔴 Red vs 🔵 Blue) need to be separated by a road!<br><br>
          <b>SVM's Goal:</b> Build the <b>WIDEST</b> possible road between them!<br>
          The wider the road, the easier it is to tell which side someone is on! 🛤️
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="svm-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- LEGEND -->
          <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 30px; height: 4px; background: #8b5cf6;"></div>
              <span>Center Road</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 30px; height: 2px; background: #cbd5e1; border-style: dashed;"></div>
              <span>Road Edges (Margin)</span>
            </div>
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #f59e0b;">🎮 Place Your Teams!</h3>
          
          <!-- CLASS SELECTION -->
          <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
            <button id="btn-red" style="background: #ef4444; flex: 1; font-size: 1.1rem;">🔴 Red Team</button>
            <button id="btn-blue" style="background: #3b82f6; flex: 1; font-size: 1.1rem; opacity: 0.6;">🔵 Blue Team</button>
          </div>
          
          <div style="background: #fef3c7; padding: 0.75rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #fde68a; font-size: 0.9rem; text-align: center;">
            👆 Click to add team members!<br>
            <span style="color: #92400e;">Try putting teams on opposite sides</span>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
            <div style="font-weight: bold; color: #334155; margin-bottom: 0.5rem;">🛤️ Road Status:</div>
            <div id="road-status" style="color: #64748b;">Add players from both teams!</div>
          </div>

          <button id="clear-btn" style="width: 100%; background: #94a3b8;">🗑️ Clear Field</button>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 Why does the "widest road" matter?</h4>
        <p style="margin: 0; color: #64748b;">
          A <b>wide road</b> means there's lots of "buffer space" between teams.<br>
          If a new person shows up, we can easily tell which side of the road they're on!<br>
          The dots closest to the road are called <b>"Support Vectors"</b> — they're the key players! ⭐
        </p>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#svm-canvas');
    const ctx = canvas.getContext('2d');
    const roadStatus = container.querySelector('#road-status');
    const btnRed = container.querySelector('#btn-red');
    const btnBlue = container.querySelector('#btn-blue');

    let points = [];
    let currentClass = -1;
    let w = { x: 0.1, y: 0.1 };
    let b = 0;

    function train() {
        if (points.length < 2) return;
        if (points.filter(p => p.label === -1).length === 0 || points.filter(p => p.label === 1).length === 0) return;

        const lr = 0.001;
        const C = 1;

        for (let iter = 0; iter < 100; iter++) {
            points.forEach(p => {
                const x = (p.x - canvas.width / 2) / 100;
                const y = (p.y - canvas.height / 2) / 100;
                const val = w.x * x + w.y * y + b;

                if (p.label * val < 1) {
                    w.x -= lr * (2 * 0.01 * w.x - C * p.label * x);
                    w.y -= lr * (2 * 0.01 * w.y - C * p.label * y);
                    b -= lr * (-C * p.label);
                } else {
                    w.x -= lr * (2 * 0.01 * w.x);
                    w.y -= lr * (2 * 0.01 * w.y);
                }
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        train();

        function getCanvasY(canvasX, offset = 0) {
            if (Math.abs(w.y) < 0.001) return null;
            const xNorm = (canvasX - canvas.width / 2) / 100;
            const yNorm = (offset - b - w.x * xNorm) / w.y;
            return yNorm * 100 + canvas.height / 2;
        }

        const hasRed = points.some(p => p.label === -1);
        const hasBlue = points.some(p => p.label === 1);

        if (hasRed && hasBlue && Math.abs(w.y) > 0.001) {
            // Fill regions
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(canvas.width, 0);
            ctx.lineTo(canvas.width, getCanvasY(canvas.width, 0));
            ctx.lineTo(0, getCanvasY(0, 0));
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(canvas.width, getCanvasY(canvas.width, 0));
            ctx.lineTo(0, getCanvasY(0, 0));
            ctx.closePath();
            ctx.fill();

            // Draw center line
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, getCanvasY(0, 0));
            ctx.lineTo(canvas.width, getCanvasY(canvas.width, 0));
            ctx.stroke();

            // Draw margins
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(0, getCanvasY(0, 1));
            ctx.lineTo(canvas.width, getCanvasY(canvas.width, 1));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, getCanvasY(0, -1));
            ctx.lineTo(canvas.width, getCanvasY(canvas.width, -1));
            ctx.stroke();
            ctx.setLineDash([]);

            roadStatus.innerHTML = '✅ <b>Road built!</b> The purple line separates the teams!';
        } else {
            roadStatus.innerHTML = hasRed && hasBlue ? 'Training...' : 'Add players from <b>BOTH</b> teams!';
        }

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = p.label === -1 ? '#ef4444' : '#3b82f6';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.label === -1 ? '🔴' : '🔵', p.x, p.y);
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, label: currentClass });
        draw();
    });

    btnRed.onclick = () => {
        currentClass = -1;
        btnRed.style.opacity = '1';
        btnBlue.style.opacity = '0.6';
    };

    btnBlue.onclick = () => {
        currentClass = 1;
        btnBlue.style.opacity = '1';
        btnRed.style.opacity = '0.6';
    };

    container.querySelector('#clear-btn').onclick = () => {
        points = [];
        w = { x: 0.1, y: 0.1 };
        b = 0;
        draw();
    };

    // Live training loop
    function loop() {
        if (document.contains(canvas)) {
            draw();
            requestAnimationFrame(loop);
        }
    }
    loop();
}
