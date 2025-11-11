import path from "node:path"
import { Jimp } from "jimp";
import { fileURLToPath } from "node:url";
import { mkdir, readdir } from "node:fs/promises";

const _filename = fileURLToPath(import.meta.url); // 'C:\\Dev\\multi-threading-img-processor\\normal.js'
const __dirname = path.dirname(_filename); // 'C:\\Dev\\multi-threading-img-processor'

// console.log({ _filename, __dirname });

const OUTPUT_DIR = path.join(__dirname, 'normal-output')
const INPUT_DIR = path.join(__dirname, 'input-images')

async function processImage(imagePath, filename) {
    const outputSubDirPath = path.join(OUTPUT_DIR, filename.split('.')[0]); // 'C:\\Dev\\multi-threading-img-processor\\normal-output\\sample-1'

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
    // image.resize({ w: 100 });

    // await image.write(path.join(outputSubDirPath, 'resize.jpg'));
}

async function main() {
    const files = await readdir(INPUT_DIR)
    // console.log({ files });

    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

    const startTime = Date.now();

    for (let i = 0; i < imageFiles.length; i++) {
        // const element = array[index];
        const file = imageFiles[i];
        const filePath = path.join(INPUT_DIR, file)
        await processImage(filePath, file);
        console.log(`${file} processed!`);

    }

    //const filePath = path.join(__dirname, 'input-images', 'sample-1.jpg') // 'C:\\Dev\\multi-threading-img-processor\\input-images\\sample-1.jpg'

    const totalTime = Date.now() - startTime;
    console.log(`Total time:${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`Avg image time:${(totalTime / imageFiles.length).toFixed(0)}ms)`);
}

main();