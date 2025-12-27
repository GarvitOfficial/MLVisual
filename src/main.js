import './style.css';
import { loadAlgorithms } from './core/loader.js';
import { initRouter } from './core/router.js';

document.addEventListener('DOMContentLoaded', async () => {
    const algorithms = await loadAlgorithms();
    console.log('Loaded algorithms:', algorithms);
    
    initRouter(algorithms);
});
