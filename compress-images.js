const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesFolder = path.join(__dirname, 'src', 'assets', 'images', 'blog');

async function compressAll() {
    if (!fs.existsSync(imagesFolder)) {
        console.log("Images directory not found.");
        return;
    }

    const files = fs.readdirSync(imagesFolder);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    console.log(`\nFound ${files.length} items. Starting batch compression...\n`);

    let totalSavedBytes = 0;

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!validExtensions.includes(ext)) continue;

        const filePath = path.join(imagesFolder, file);
        const originalStats = fs.statSync(filePath);
        const originalSizeKB = (originalStats.size / 1024).toFixed(1);

        try {
            const inputBuffer = fs.readFileSync(filePath);
            
            // Resize to a maximum width of 1200px while maintaining aspect ratio
            let pipeline = sharp(inputBuffer).resize({
                width: 1200,
                withoutEnlargement: true
            });

            if (ext === '.png') {
                pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
            } else if (ext === '.jpg' || ext === '.jpeg') {
                pipeline = pipeline.jpeg({ quality: 80, progressive: true });
            } else if (ext === '.webp') {
                pipeline = pipeline.webp({ quality: 80 });
            }

            const outputBuffer = await pipeline.toBuffer();

            // Overwrite original file
            fs.writeFileSync(filePath, outputBuffer);

            const newSizeKB = (outputBuffer.length / 1024).toFixed(1);
            const savedKB = (originalStats.size - outputBuffer.length) / 1024;
            totalSavedBytes += (originalStats.size - outputBuffer.length);

            console.log(`✓ ${file}: ${originalSizeKB} KB -> ${newSizeKB} KB (Saved ${savedKB.toFixed(1)} KB)`);
        } catch (err) {
            console.error(`✕ Failed to compress ${file}:`, err.message);
        }
    }

    const totalSavedMB = (totalSavedBytes / (1024 * 1024)).toFixed(2);
    console.log(`\nDone! Total storage saved: ${totalSavedMB} MB\n`);
}

compressAll();