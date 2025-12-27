/**
 * Dynamically loads all algorithms from the src/algorithms directory.
 * It expects each algorithm folder to have an info.json and a visualization.js.
 */
export async function loadAlgorithms() {
    // 1. Load all info.json files to get metadata
    const infoFiles = import.meta.glob('/src/algorithms/*/info.json');

    // 2. Load all visualization.js files (but don't execute them yet)
    const activeFiles = import.meta.glob('/src/algorithms/*/visualization.js');

    const algorithms = [];

    for (const path in infoFiles) {
        // Extract the slug (folder name) from the path
        // Path example: /src/algorithms/k-means/info.json
        const parts = path.split('/');
        const id = parts[parts.length - 2]; // e.g., 'k-means'

        // Load the metadata
        const mod = await infoFiles[path]();
        const metadata = mod.default || mod;

        // Check if there is a corresponding visualization file
        const vizPath = `/src/algorithms/${id}/visualization.js`;

        if (activeFiles[vizPath]) {
            algorithms.push({
                id,
                ...metadata,
                loadVisualization: activeFiles[vizPath] // Function that returns a promise
            });
        } else {
            console.warn(`Algorithm ${id} has info.json but no visualization.js`);
        }
    }

    return algorithms;
}
