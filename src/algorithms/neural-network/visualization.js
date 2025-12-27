export function init(container) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 1rem;">
      <!-- STORY INTRO -->
      <div class="story-box" style="background: linear-gradient(135deg, #e0e7ff, #c7d2fe); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; border: 3px solid #6366f1;">
        <h2 style="margin: 0 0 0.5rem 0; color: #3730a3;">🧠 Train a Tiny Brain!</h2>
        <p style="margin: 0; color: #312e81; font-size: 1.1rem;">
          <b>Neural Networks are like brains!</b> They have "neurons" that learn patterns.<br><br>
          <b>Your Mission:</b> Teach this baby brain to tell apart ✅ PASS and ❌ FAIL students!<br>
          Add some data, then hit TRAIN and watch the brain learn! 🎓
        </p>
      </div>
      
      <!-- MAIN VISUALIZATION -->
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div style="position: relative; flex: 1; min-width: 400px;">
          <canvas id="nn-canvas" width="550" height="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></canvas>
          
          <!-- LEGEND -->
          <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #22c55e;"></div>
              <span>✅ Students who PASSED</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 16px; height: 16px; border-radius: 50%; background: #ef4444;"></div>
              <span>❌ Students who FAILED</span>
            </div>
          </div>
          
          <!-- AXIS LABELS -->
          <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); background: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-weight: bold; color: #6366f1;">
            📚 Hours Studied
          </div>
          <div style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%) rotate(-90deg); background: white; padding: 0.25rem 0.75rem; border-radius: 8px; font-weight: bold; color: #f59e0b;">
            😴 Hours Slept
          </div>
        </div>
        
        <div class="controls-panel" style="min-width: 280px; max-width: 320px; padding: 1.5rem; border-radius: 20px; background: white; border: 2px solid #e2e8f0;">
          <h3 style="margin: 0 0 1rem 0; color: #6366f1;">🎮 Train the Brain!</h3>
          
          <!-- CLASS SELECTION -->
          <div style="margin-bottom: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
            <button id="btn-pass" class="class-btn active" style="background: #22c55e; flex: 1; font-size: 1.1rem;">✅ PASS</button>
            <button id="btn-fail" class="class-btn" style="background: #ef4444; flex: 1; font-size: 1.1rem; opacity: 0.6;">❌ FAIL</button>
          </div>
          
          <div style="background: #f0fdf4; padding: 0.75rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #bbf7d0; font-size: 0.9rem; text-align: center;">
            👆 Click the canvas to add student data!<br>
            <span style="color: #64748b;">Top-right = studied + slept well</span>
          </div>
          
          <!-- BRAIN STATUS -->
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: bold; color: #334155;">🧠 Brain Training</span>
              <span id="epoch-count" style="color: #6366f1; font-weight: bold;">0 lessons</span>
            </div>
            <div style="height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden;">
              <div id="progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6366f1, #a855f7); transition: width 0.3s;"></div>
            </div>
            <div id="accuracy" style="margin-top: 0.5rem; text-align: center; font-weight: bold; color: #64748b;">
              Accuracy: Train me first!
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="train-btn" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); font-size: 1.1rem; padding: 0.9rem;">
              🏋️ TRAIN! (100 lessons)
            </button>
            <button id="clear-btn" style="background: #94a3b8;">🗑️ Start Over</button>
          </div>
        </div>
      </div>
      
      <!-- EXPLANATION -->
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f1f5f9; border-radius: 16px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #334155;">💡 What's happening?</h4>
        <p id="explain-text" style="margin: 0; color: #64748b;">
          The <b>colored background</b> shows what the brain THINKS right now. 
          <span style="color: #22c55e;">Green = "I think PASS"</span>, 
          <span style="color: #ef4444;">Red = "I think FAIL"</span>.<br>
          When you train, the brain adjusts its thinking to match your examples! 
          The more you train, the smarter it gets! 🎉
        </p>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#nn-canvas');
  const ctx = canvas.getContext('2d');
  const progressBar = container.querySelector('#progress-bar');
  const epochCount = container.querySelector('#epoch-count');
  const accuracyEl = container.querySelector('#accuracy');
  const explainText = container.querySelector('#explain-text');
  const btnPass = container.querySelector('#btn-pass');
  const btnFail = container.querySelector('#btn-fail');

  let points = [];
  let currentClass = 1;
  let epochs = 0;

  // Network weights
  let weights1 = Array(4).fill(0).map(() => [Math.random() - 0.5, Math.random() - 0.5]);
  let bias1 = Array(4).fill(0).map(() => Math.random() - 0.5);
  let weights2 = Array(4).fill(0).map(() => Math.random() - 0.5);
  let bias2 = Math.random() - 0.5;

  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  function sigmoidDeriv(x) { return x * (1 - x); }

  function forward(x, y) {
    const nx = x / canvas.width;
    const ny = y / canvas.height;

    const hidden = [];
    for (let i = 0; i < 4; i++) {
      hidden[i] = sigmoid(weights1[i][0] * nx + weights1[i][1] * ny + bias1[i]);
    }

    let output = bias2;
    for (let i = 0; i < 4; i++) {
      output += weights2[i] * hidden[i];
    }
    return { hidden, output: sigmoid(output) };
  }

  function train() {
    if (points.length < 2) {
      explainText.innerHTML = '⚠️ Add at least 2 students first! One PASS and one FAIL.';
      return;
    }

    const lr = 0.5;

    for (let e = 0; e < 100; e++) {
      points.forEach(p => {
        const nx = p.x / canvas.width;
        const ny = p.y / canvas.height;
        const target = p.cls;

        const { hidden, output } = forward(p.x, p.y);

        const outputError = target - output;
        const outputDelta = outputError * sigmoidDeriv(output);

        const hiddenDeltas = [];
        for (let i = 0; i < 4; i++) {
          hiddenDeltas[i] = outputDelta * weights2[i] * sigmoidDeriv(hidden[i]);
        }

        for (let i = 0; i < 4; i++) {
          weights2[i] += lr * outputDelta * hidden[i];
        }
        bias2 += lr * outputDelta;

        for (let i = 0; i < 4; i++) {
          weights1[i][0] += lr * hiddenDeltas[i] * nx;
          weights1[i][1] += lr * hiddenDeltas[i] * ny;
          bias1[i] += lr * hiddenDeltas[i];
        }
      });
      epochs++;
    }

    epochCount.textContent = epochs + ' lessons';
    progressBar.style.width = Math.min(100, epochs / 5) + '%';

    let correct = 0;
    points.forEach(p => {
      const pred = forward(p.x, p.y).output > 0.5 ? 1 : 0;
      if (pred === p.cls) correct++;
    });
    const acc = ((correct / points.length) * 100).toFixed(0);
    accuracyEl.textContent = `Accuracy: ${acc}% correct!`;
    accuracyEl.style.color = acc >= 80 ? '#22c55e' : acc >= 50 ? '#f59e0b' : '#ef4444';

    if (acc >= 90) {
      explainText.innerHTML = '🎉 <b>AMAZING!</b> The brain learned the pattern almost perfectly!';
    } else if (acc >= 70) {
      explainText.innerHTML = '🎯 Getting there! The brain is learning. Train more for better results!';
    } else {
      explainText.innerHTML = '🤔 Still learning... Add more examples or train more!';
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap
    const res = 20;
    const cellW = canvas.width / res;
    const cellH = canvas.height / res;

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x = (i + 0.5) * cellW;
        const y = (j + 0.5) * cellH;
        const pred = forward(x, y).output;

        const r = Math.round((1 - pred) * 239);
        const g = Math.round(pred * 197);
        ctx.fillStyle = `rgba(${r}, ${g}, 94, 0.35)`;
        ctx.fillRect(i * cellW, j * cellH, cellW, cellH);
      }
    }

    // Draw points as students
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = p.cls === 1 ? '#22c55e' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.cls === 1 ? '✓' : '✗', p.x, p.y);
    });
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, cls: currentClass });
    draw();
  });

  btnPass.onclick = () => {
    currentClass = 1;
    btnPass.style.opacity = '1';
    btnFail.style.opacity = '0.6';
  };

  btnFail.onclick = () => {
    currentClass = 0;
    btnFail.style.opacity = '1';
    btnPass.style.opacity = '0.6';
  };

  container.querySelector('#train-btn').onclick = () => {
    train();
    draw();
  };

  container.querySelector('#clear-btn').onclick = () => {
    points = [];
    epochs = 0;
    weights1 = Array(4).fill(0).map(() => [Math.random() - 0.5, Math.random() - 0.5]);
    bias1 = Array(4).fill(0).map(() => Math.random() - 0.5);
    weights2 = Array(4).fill(0).map(() => Math.random() - 0.5);
    bias2 = Math.random() - 0.5;
    epochCount.textContent = '0 lessons';
    progressBar.style.width = '0%';
    accuracyEl.textContent = 'Accuracy: Train me first!';
    accuracyEl.style.color = '#64748b';
    explainText.innerHTML = 'Add some student data and start training!';
    draw();
  };

  draw();
}
