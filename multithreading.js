import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);

const WORKER_FILE_PATH = path.join(__dirname, 'worker.js')

function runWorker(filepath, filename) {
    return new Promise((resolve, reject) => {
        const worker = new Worker((WORKER_FILE_PATH), {
            workerData: {
                imagePath: filepath,
                filename
            }
        })

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    })
}

async function main() {
    const INPUT_DIR = path.join(__dirname, 'input-images')
    const files = await readdir(INPUT_DIR)

    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

    const startTime = Date.now();

    // this is problematic => 100 files -> 100 workers => worker pool
    const imagePromises = imageFiles.map(async (file) => {
        const filePath = path.join(INPUT_DIR, file)
        const data = await runWorker(filePath, file);

        return data;
    })

    await Promise.all(imagePromises);

    const totalTime = Date.now() - startTime;
    console.log(`Multi threading Total time:${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`Avg image time:${(totalTime / imageFiles.length).toFixed(0)}ms)`);
}

main();