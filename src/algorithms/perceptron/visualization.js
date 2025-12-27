export function init(container) {
    container.innerHTML = `
    <div style="display: flex; gap: 2rem; align-items: flex-start; justify-content: center; flex-wrap: wrap;">
      <div style="position: relative;">
        <canvas id="perceptron-canvas" width="600" height="400"></canvas>
      </div>
      
      <div class="controls-panel" style="flex: 1; min-width: 260px; max-width: 320px; padding: 1.5rem; border-radius: 20px;">
        <h3>⚡ Perceptron</h3>
        <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">
          The OG neural unit! Add <span style="color:#22c55e">+1</span> or <span style="color:#ef4444">-1</span> points and train!
        </p>
        
        <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
          <button id="btn-pos" style="background: #22c55e; flex: 1;">+1</button>
          <button id="btn-neg" style="background: #ef4444; flex: 1; transform: scale(0.95); opacity: 0.7;">-1</button>
        </div>
        
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; font-family: monospace;">
          <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">Weights:</div>
          <div>w1: <span id="w1">0.00</span></div>
          <div>w2: <span id="w2">0.00</span></div>
          <div>bias: <span id="bias">0.00</span></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button id="train-btn" style="background: var(--primary);">🧠 Train (1 epoch)</button>
          <button id="clear-btn" style="background-color: #94a3b8; box-shadow: 0 4px 0 #64748b;">🗑️ Reset</button>
        </div>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#perceptron-canvas');
    const ctx = canvas.getContext('2d');
    const w1El = container.querySelector('#w1');
    const w2El = container.querySelector('#w2');
    const biasEl = container.querySelector('#bias');
    const btnPos = container.querySelector('#btn-pos');
    const btnNeg = container.querySelector('#btn-neg');

    let points = [];
    let currentClass = 1;
    let w = [Math.random() - 0.5, Math.random() - 0.5];
    let bias = Math.random() - 0.5;

    function predict(x, y) {
        const nx = (x - canvas.width / 2) / 100;
        const ny = (y - canvas.height / 2) / 100;
        const sum = w[0] * nx + w[1] * ny + bias;
        return sum >= 0 ? 1 : -1;
    }

    function train() {
        const lr = 0.1;
        points.forEach(p => {
            const nx = (p.x - canvas.width / 2) / 100;
            const ny = (p.y - canvas.height / 2) / 100;
            const pred = predict(p.x, p.y);
            const error = p.cls - pred;

            w[0] += lr * error * nx;
            w[1] += lr * error * ny;
            bias += lr * error;
        });

        w1El.textContent = w[0].toFixed(3);
        w2El.textContent = w[1].toFixed(3);
        biasEl.textContent = bias.toFixed(3);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw decision boundary
        // w[0]*x + w[1]*y + bias = 0
        // y = (-w[0]*x - bias) / w[1]
        if (Math.abs(w[1]) > 0.001) {
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 3;
            ctx.beginPath();

            const x1 = -canvas.width / 2 / 100;
            const x2 = canvas.width / 2 / 100;
            const y1 = (-w[0] * x1 - bias) / w[1];
            const y2 = (-w[0] * x2 - bias) / w[1];

            ctx.moveTo(0, y1 * 100 + canvas.height / 2);
            ctx.lineTo(canvas.width, y2 * 100 + canvas.height / 2);
            ctx.stroke();
        }

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 1 ? '#22c55e' : '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y, cls: currentClass });
        draw();
    });

    btnPos.onclick = () => {
        currentClass = 1;
        btnPos.style.transform = 'scale(1)';
        btnPos.style.opacity = '1';
        btnNeg.style.transform = 'scale(0.95)';
        btnNeg.style.opacity = '0.7';
    };

    btnNeg.onclick = () => {
        currentClass = -1;
        btnNeg.style.transform = 'scale(1)';
        btnNeg.style.opacity = '1';
        btnPos.style.transform = 'scale(0.95)';
        btnPos.style.opacity = '0.7';
    };

    container.querySelector('#train-btn').onclick = () => {
        train();
        draw();
    };

    container.querySelector('#clear-btn').onclick = () => {
        points = [];
        w = [Math.random() - 0.5, Math.random() - 0.5];
        bias = Math.random() - 0.5;
        w1El.textContent = w[0].toFixed(3);
        w2El.textContent = w[1].toFixed(3);
        biasEl.textContent = bias.toFixed(3);
        draw();
    };

    btnPos.click();
    w1El.textContent = w[0].toFixed(3);
    w2El.textContent = w[1].toFixed(3);
    biasEl.textContent = bias.toFixed(3);
    draw();
}
