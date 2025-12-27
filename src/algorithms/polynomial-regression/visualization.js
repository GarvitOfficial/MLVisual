export function init(container) {
    container.innerHTML = `
    <div style="display: flex; gap: 2rem; align-items: flex-start; justify-content: center; flex-wrap: wrap;">
      <div style="position: relative;">
        <canvas id="poly-canvas" width="600" height="400"></canvas>
      </div>
      
      <div class="controls-panel" style="flex: 1; min-width: 260px; max-width: 320px; padding: 1.5rem; border-radius: 20px;">
        <h3>〰️ Polynomial Regression</h3>
        <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">
          Higher degree = more curvy! Click to add points.
        </p>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="font-weight: bold; display: block; margin-bottom: 0.5rem;">Polynomial Degree: <span id="degree-value" style="color: var(--primary);">2</span></label>
          <input type="range" id="degree-slider" min="1" max="8" value="2">
        </div>

        <button id="clear-btn" style="width: 100%; background-color: #94a3b8; box-shadow: 0 4px 0 #64748b;">🗑️ Clear</button>
        
        <div id="equation" style="margin-top: 1rem; font-family: monospace; font-size: 0.8rem; color: var(--text-secondary); text-align: center; word-break: break-all;">
          -
        </div>
      </div>
    </div>
  `;

    const canvas = container.querySelector('#poly-canvas');
    const ctx = canvas.getContext('2d');
    const degreeSlider = container.querySelector('#degree-slider');
    const degreeValue = container.querySelector('#degree-value');
    const equationEl = container.querySelector('#equation');

    let points = [];
    let degree = 2;

    // Solve polynomial using least squares (simple implementation)
    function fitPolynomial() {
        if (points.length < degree + 1) return null;

        const n = points.length;
        const d = degree + 1;

        // Build Vandermonde matrix X and vector y
        const X = [];
        const y = [];

        points.forEach(p => {
            const row = [];
            for (let j = 0; j < d; j++) {
                row.push(Math.pow(p.x / 100, j)); // Scale x to avoid huge numbers
            }
            X.push(row);
            y.push(p.y);
        });

        // Normal equations: (X^T * X) * coeffs = X^T * y
        // Solve using basic Gaussian elimination

        // X^T * X
        const XtX = [];
        for (let i = 0; i < d; i++) {
            XtX[i] = [];
            for (let j = 0; j < d; j++) {
                let sum = 0;
                for (let k = 0; k < n; k++) {
                    sum += X[k][i] * X[k][j];
                }
                XtX[i][j] = sum;
            }
        }

        // X^T * y
        const Xty = [];
        for (let i = 0; i < d; i++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += X[k][i] * y[k];
            }
            Xty[i] = sum;
        }

        // Augmented matrix
        const aug = XtX.map((row, i) => [...row, Xty[i]]);

        // Gaussian elimination
        for (let i = 0; i < d; i++) {
            // Find pivot
            let maxRow = i;
            for (let k = i + 1; k < d; k++) {
                if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
            }
            [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

            if (Math.abs(aug[i][i]) < 1e-10) continue;

            // Eliminate
            for (let k = i + 1; k < d; k++) {
                const c = aug[k][i] / aug[i][i];
                for (let j = i; j <= d; j++) {
                    aug[k][j] -= c * aug[i][j];
                }
            }
        }

        // Back substitution
        const coeffs = new Array(d).fill(0);
        for (let i = d - 1; i >= 0; i--) {
            if (Math.abs(aug[i][i]) < 1e-10) continue;
            coeffs[i] = aug[i][d];
            for (let j = i + 1; j < d; j++) {
                coeffs[i] -= aug[i][j] * coeffs[j];
            }
            coeffs[i] /= aug[i][i];
        }

        return coeffs;
    }

    function evaluate(coeffs, x) {
        let y = 0;
        const xScaled = x / 100;
        for (let i = 0; i < coeffs.length; i++) {
            y += coeffs[i] * Math.pow(xScaled, i);
        }
        return y;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        const coeffs = fitPolynomial();

        if (coeffs) {
            // Draw curve
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += 2) {
                const y = evaluate(coeffs, x);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Show equation
            let eq = 'y = ';
            coeffs.forEach((c, i) => {
                if (Math.abs(c) < 0.001) return;
                const sign = c >= 0 && i > 0 ? '+' : '';
                eq += `${sign}${c.toFixed(2)}x^${i} `;
            });
            equationEl.textContent = eq;
        } else {
            equationEl.textContent = `Need at least ${degree + 1} points`;
        }

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
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
        points.push({ x, y });
        draw();
    });

    degreeSlider.addEventListener('input', (e) => {
        degree = parseInt(e.target.value);
        degreeValue.textContent = degree;
        draw();
    });

    container.querySelector('#clear-btn').onclick = () => {
        points = [];
        draw();
    };

    draw();
}
