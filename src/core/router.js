/**
 * Enhanced router with professional dashboard featuring categories, 
 * difficulty levels, and detailed algorithm descriptions.
 */

const algorithmMeta = {
    'k-means': {
        emoji: '🎨',
        category: 'Clustering',
        difficulty: 'Beginner',
        howItWorks: 'Groups data by finding K center points and assigning each data point to the nearest center. Repeats until centers stop moving.',
        realWorld: 'Customer segmentation, image compression, grouping similar documents'
    },
    'linear-regression': {
        emoji: '📈',
        category: 'Regression',
        difficulty: 'Beginner',
        howItWorks: 'Draws a straight line through data points that minimizes the total distance from all points to the line.',
        realWorld: 'Predicting house prices, forecasting sales, estimating growth'
    },
    'knn': {
        emoji: '🏘️',
        category: 'Classification',
        difficulty: 'Beginner',
        howItWorks: 'Classifies a new point by looking at its K nearest neighbors and taking a majority vote.',
        realWorld: 'Recommendation systems, handwriting recognition, medical diagnosis'
    },
    'logistic-regression': {
        emoji: '🔮',
        category: 'Classification',
        difficulty: 'Beginner',
        howItWorks: 'Predicts probability (0 to 1) using an S-shaped curve. Great for yes/no predictions.',
        realWorld: 'Spam detection, disease prediction, credit approval'
    },
    'svm': {
        emoji: '🚧',
        category: 'Classification',
        difficulty: 'Intermediate',
        howItWorks: 'Finds the widest possible "road" (margin) between two classes. Points on the edge are support vectors.',
        realWorld: 'Face detection, text categorization, bioinformatics'
    },
    'decision-tree': {
        emoji: '🌳',
        category: 'Classification',
        difficulty: 'Beginner',
        howItWorks: 'Splits data using yes/no questions. Each split maximizes the purity of resulting groups.',
        realWorld: 'Loan approval, medical diagnosis, game AI'
    },
    'neural-network': {
        emoji: '🧠',
        category: 'Deep Learning',
        difficulty: 'Advanced',
        howItWorks: 'Layers of connected "neurons" learn patterns by adjusting connection weights through training.',
        realWorld: 'Image recognition, language translation, self-driving cars'
    },
    'pca': {
        emoji: '📉',
        category: 'Dimensionality',
        difficulty: 'Intermediate',
        howItWorks: 'Finds the main directions (axes) along which your data varies most, allowing you to reduce dimensions.',
        realWorld: 'Face recognition, data compression, noise reduction'
    },
    'naive-bayes': {
        emoji: '🎰',
        category: 'Classification',
        difficulty: 'Beginner',
        howItWorks: 'Uses probability and Bayes theorem. Assumes features are independent (naive) to calculate likelihood.',
        realWorld: 'Spam filtering, sentiment analysis, document classification'
    },
    'random-forest': {
        emoji: '🌲',
        category: 'Ensemble',
        difficulty: 'Intermediate',
        howItWorks: 'Grows many decision trees on random subsets of data, then combines their votes for final prediction.',
        realWorld: 'Credit scoring, fraud detection, medical imaging'
    },
    'gradient-boosting': {
        emoji: '💪',
        category: 'Ensemble',
        difficulty: 'Advanced',
        howItWorks: 'Builds trees sequentially, where each new tree tries to fix the mistakes of the previous ones.',
        realWorld: 'Search ranking, click prediction, competition winning models'
    },
    'perceptron': {
        emoji: '⚡',
        category: 'Classification',
        difficulty: 'Beginner',
        howItWorks: 'The simplest neural network - just one neuron! Learns a linear boundary by adjusting weights.',
        realWorld: 'Binary classification, foundation of neural networks'
    },
    'dbscan': {
        emoji: '🫧',
        category: 'Clustering',
        difficulty: 'Intermediate',
        howItWorks: 'Groups points by density. Dense regions become clusters, sparse points become noise/outliers.',
        realWorld: 'Anomaly detection, geographic clustering, astronomy'
    },
    'hierarchical-clustering': {
        emoji: '🌳',
        category: 'Clustering',
        difficulty: 'Intermediate',
        howItWorks: 'Builds a tree of clusters by repeatedly merging the closest pairs until desired number is reached.',
        realWorld: 'Gene expression analysis, social network analysis, taxonomy'
    },
    'polynomial-regression': {
        emoji: '〰️',
        category: 'Regression',
        difficulty: 'Intermediate',
        howItWorks: 'Fits a curved line (polynomial) instead of straight. Higher degree = more curvy.',
        realWorld: 'Modeling growth curves, physics simulations, trend analysis'
    },
    'adaboost': {
        emoji: '🎯',
        category: 'Ensemble',
        difficulty: 'Advanced',
        howItWorks: 'Trains weak learners sequentially. Each focuses on mistakes of previous ones. Weights hard examples.',
        realWorld: 'Face detection, object recognition, medical screening'
    },
    'mean-shift': {
        emoji: '🏔️',
        category: 'Clustering',
        difficulty: 'Intermediate',
        howItWorks: 'Points "roll" towards density peaks. No need to specify cluster count - it finds them automatically!',
        realWorld: 'Image segmentation, video tracking, mode finding'
    },
    'gmm': {
        emoji: '☁️',
        category: 'Clustering',
        difficulty: 'Advanced',
        howItWorks: 'Models data as mixture of Gaussian (bell curve) distributions. Each point has probability of belonging to each cluster.',
        realWorld: 'Image segmentation, speech recognition, anomaly detection'
    }
};

const categoryColors = {
    'Clustering': '#22c55e',
    'Classification': '#3b82f6',
    'Regression': '#f59e0b',
    'Ensemble': '#ec4899',
    'Deep Learning': '#8b5cf6',
    'Dimensionality': '#06b6d4'
};

const difficultyColors = {
    'Beginner': '#22c55e',
    'Intermediate': '#f59e0b',
    'Advanced': '#ef4444'
};

export function initRouter(algorithms) {
    const dashboard = document.getElementById('dashboard');
    const vizContainer = document.getElementById('visualization-container');
    const homeBtn = document.getElementById('home-btn');

    let currentCleanup = null;

    function renderDashboard() {
        dashboard.innerHTML = '';
        dashboard.classList.remove('hidden');
        vizContainer.classList.add('hidden');
        vizContainer.innerHTML = '';
        homeBtn.style.display = 'none';

        // Hero Section
        const hero = document.createElement('div');
        hero.className = 'dashboard-hero';
        hero.innerHTML = `
      <div style="text-align: center; padding: 2rem; max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5rem; color: #8b5cf6; margin-bottom: 0.5rem;">🧠 Welcome to ML Adventure!</h2>
        <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 1rem;">
          Learn Machine Learning by <b>playing</b>! Each card below is an interactive lesson.
          Click any card to start experimenting!
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; background: #f0fdf4; padding: 0.5rem 1rem; border-radius: 20px; border: 2px solid #22c55e;">
            <span style="color: #22c55e;">●</span> Beginner Friendly
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; background: #fffbeb; padding: 0.5rem 1rem; border-radius: 20px; border: 2px solid #f59e0b;">
            <span style="color: #f59e0b;">●</span> Some Math Knowledge
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; background: #fef2f2; padding: 0.5rem 1rem; border-radius: 20px; border: 2px solid #ef4444;">
            <span style="color: #ef4444;">●</span> Advanced Concepts
          </div>
        </div>
      </div>
    `;
        dashboard.appendChild(hero);

        // Group by category
        const categories = {};
        algorithms.forEach(algo => {
            const meta = algorithmMeta[algo.id] || { emoji: '🔬', category: 'Other', difficulty: 'Intermediate', howItWorks: 'Interactive ML visualization', realWorld: 'Various applications' };
            if (!categories[meta.category]) categories[meta.category] = [];
            categories[meta.category].push({ ...algo, ...meta });
        });

        // Render each category
        Object.keys(categories).sort().forEach(category => {
            const section = document.createElement('div');
            section.className = 'category-section';
            section.innerHTML = `
        <div style="padding: 0 2rem; max-width: 1200px; margin: 0 auto;">
          <h3 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; color: ${categoryColors[category] || '#64748b'}; margin: 2rem 0 1rem 0; border-bottom: 3px solid ${categoryColors[category] || '#e2e8f0'}; padding-bottom: 0.5rem;">
            <span style="background: ${categoryColors[category] || '#64748b'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.9rem;">${category}</span>
            <span style="color: #64748b; font-weight: normal; font-size: 1rem;">${categories[category].length} algorithms</span>
          </h3>
        </div>
      `;

            const grid = document.createElement('div');
            grid.className = 'dashboard-grid';

            categories[category].forEach(algo => {
                const card = document.createElement('div');
                card.className = 'algo-card';
                card.innerHTML = `
          <div style="position: absolute; top: 12px; right: 12px; background: ${difficultyColors[algo.difficulty]}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
            ${algo.difficulty}
          </div>
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">${algo.emoji}</div>
          <h3 style="margin: 0.5rem 0;">${algo.title}</h3>
          <p style="font-size: 0.95rem; color: #64748b; margin-bottom: 1rem;">${algo.description}</p>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 0.75rem; text-align: left; font-size: 0.85rem; margin-bottom: 0.75rem;">
            <div style="font-weight: bold; color: #334155; margin-bottom: 0.25rem;">💡 How it works:</div>
            <div style="color: #64748b;">${algo.howItWorks}</div>
          </div>
          
          <div style="background: #fef3c7; border-radius: 12px; padding: 0.75rem; text-align: left; font-size: 0.85rem;">
            <div style="font-weight: bold; color: #92400e; margin-bottom: 0.25rem;">🌍 Used for:</div>
            <div style="color: #a16207;">${algo.realWorld}</div>
          </div>
          
          <div style="margin-top: 1rem; color: ${categoryColors[algo.category]}; font-weight: bold;">
            ▶ Click to Play!
          </div>
        `;
                card.onclick = () => {
                    window.location.hash = algo.id;
                };
                grid.appendChild(card);
            });

            section.appendChild(grid);
            dashboard.appendChild(section);
        });

        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
    }

    async function renderVisualization(id) {
        const algo = algorithms.find(a => a.id === id);
        if (!algo) {
            window.location.hash = '';
            return;
        }

        dashboard.classList.add('hidden');
        vizContainer.classList.remove('hidden');
        vizContainer.innerHTML = '';
        homeBtn.style.display = 'block';

        try {
            const module = await algo.loadVisualization();
            if (module.init) {
                currentCleanup = module.init(vizContainer);
            }
        } catch (err) {
            console.error("Failed to load visualization", err);
            vizContainer.innerHTML = `<p style="color:red">Error loading visualization: ${err.message}</p>`;
        }
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            renderVisualization(hash);
        } else {
            renderDashboard();
        }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    homeBtn.onclick = () => {
        window.location.hash = '';
    };
}
