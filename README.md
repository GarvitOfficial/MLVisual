# 🧠 ML Adventure - Interactive Machine Learning Visualizer

> **Learn Machine Learning by playing!** An interactive educational platform with 18 ML algorithms, explained through stories and visualizations.

![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎮 **Interactive Visualizations** - Click, drag, and watch algorithms learn in real-time
- 📖 **Story-Based Learning** - Each algorithm explained through relatable analogies
- 🏷️ **Difficulty Levels** - Beginner, Intermediate, and Advanced algorithms
- 💡 **"How it Works"** - Plain English explanations on every card
- 🌍 **Real-World Uses** - See where each algorithm is used in practice
- 🎨 **Kid-Friendly UI** - Colorful, playful design that makes learning fun

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/GarvitOfficial/MLVisual.git
cd MLVisual

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser!

## 📊 Algorithms Included

### Classification
| Algorithm | Theme | Difficulty |
|-----------|-------|------------|
| K-Nearest Neighbors | 🏘️ Neighborhood Voting | Beginner |
| Logistic Regression | 🔮 S-Curve Predictor | Beginner |
| Naive Bayes | 🎰 Probability Guesser | Beginner |
| Decision Tree | 🌳 20 Questions Game | Beginner |
| SVM | 🚧 Widest Road Builder | Intermediate |
| Perceptron | ⚡ Single Neuron | Beginner |

### Clustering
| Algorithm | Theme | Difficulty |
|-----------|-------|------------|
| K-Means | 🎉 Party Grouping | Beginner |
| DBSCAN | 🫧 Density Detective | Intermediate |
| Mean Shift | 🏔️ Roll to Peaks | Intermediate |
| Hierarchical | 🌳 Family Tree | Intermediate |
| GMM | ☁️ Probability Clouds | Advanced |

### Regression
| Algorithm | Theme | Difficulty |
|-----------|-------|------------|
| Linear Regression | 🌻 Sunflower Predictor | Beginner |
| Polynomial Regression | 〰️ Curve Fitter | Intermediate |

### Ensemble Methods
| Algorithm | Theme | Difficulty |
|-----------|-------|------------|
| Random Forest | 🌲 Wisdom of Crowds | Intermediate |
| Gradient Boosting | 💪 Error Fixer | Advanced |
| AdaBoost | 🎯 Focus on Mistakes | Advanced |

### Deep Learning & Dimensionality
| Algorithm | Theme | Difficulty |
|-----------|-------|------------|
| Neural Network | 🧠 Train a Tiny Brain | Advanced |
| PCA | 📉 Data Spine Finder | Intermediate |

## 🛠️ Tech Stack

- **Vite** - Lightning-fast build tool
- **Vanilla JavaScript** - No framework dependencies
- **HTML5 Canvas** - Smooth, interactive visualizations
- **CSS3** - Modern, responsive design

## 📁 Project Structure

```
MLVisual/
├── src/
│   ├── algorithms/          # Each algorithm has its own folder
│   │   ├── k-means/
│   │   │   ├── info.json       # Metadata (title, description)
│   │   │   └── visualization.js # Canvas visualization
│   │   ├── neural-network/
│   │   └── ...
│   ├── core/
│   │   ├── loader.js        # Dynamic algorithm loading
│   │   └── router.js        # Hash-based routing + dashboard
│   ├── main.js              # Entry point
│   └── style.css            # Global styles
├── index.html
└── package.json
```

## ➕ Adding New Algorithms

1. Create a folder in `src/algorithms/your-algorithm/`
2. Add `info.json`:
```json
{
  "title": "Your Algorithm",
  "description": "A brief, fun description"
}
```
3. Add `visualization.js`:
```javascript
export function init(container) {
  container.innerHTML = `<canvas id="my-canvas"></canvas>`;
  // Your visualization logic
}
```
4. The algorithm will auto-appear on the dashboard! 🎉

## 🌐 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The `dist/` folder is ready for deployment to GitHub Pages, Netlify, or Vercel.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new algorithms
- Improve existing visualizations
- Fix bugs
- Enhance the UI

## 📄 License

MIT License - feel free to use this for learning and teaching!

---

Made with 💜 for ML learners everywhere
