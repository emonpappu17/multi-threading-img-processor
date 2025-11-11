// import { parentPort, workerData } from "node:worker_threads";

// function processImage() {
//     const filename = workerData;
//     // console.log("iamge", filename);

//     parentPort.postMessage(`${filename} processed!`)
// }

// processImage();



import { Jimp } from "jimp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parentPort, workerData } from "node:worker_threads";

const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);

const OUTPUT_DIR = path.join(__dirname, 'multi-threaded-output')


async function processImage() {
    const { imagePath, filename } = workerData;

    const outputSubDirPath = path.join(OUTPUT_DIR, filename.split('.')[0]);

    await mkdir(outputSubDirPath, { recursive: true })

    const image = await Jimp.read(imagePath);

    const tasks = [
        {
            name: 'thumbnail',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 150, h: 150 });
                await cloned.write(path.join(outputSubDirPath, 'thumbnail.jpg'))
            }
        },
        {
            name: 'small',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 300, h: 300 });
                await cloned.write(path.join(outputSubDirPath, 'small.jpg'))
            }
        },
        {
            name: 'medium',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 600, h: 600 });
                await cloned.write(path.join(outputSubDirPath, 'medium.jpg'))
            }
        },
        {
            name: 'large',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 1200, h: 1200 });
                await cloned.write(path.join(outputSubDirPath, 'large.jpg'))
            }
        },
        {
            name: 'grayscale',
            operation: async () => {
                const cloned = image.clone();
                cloned.greyscale();
                await cloned.write(path.join(outputSubDirPath, 'grayscale.jpg'))
            }
        },
        {
            name: 'blur',
            operation: async () => {
                const cloned = image.clone();
                cloned.blur(5);
                await cloned.write(path.join(outputSubDirPath, 'blur.jpg'))
            }
        },
    ]

    for (const task of tasks) {
        await task.operation();
    }

    parentPort.postMessage({
        success: true,
        filename
    })
}

processImage();
