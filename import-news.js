const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = 'https://rlbuduhviinhhoamzgdw.supabase.co';
const TABLE_NAME = 'news_articles';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYnVkdWh2aWluaGhvYW16Z2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDMwMTgsImV4cCI6MjA4NTcxOTAxOH0.6aTKRzvYw2yodXCoSrRKaLp8ljEgjv3RAII2LLYJZ5U';

const blogFolder = path.join(__dirname, 'src', 'content', 'blog');
const imagesFolder = path.join(__dirname, 'src', 'assets', 'images', 'blog');

// Helper to fetch JSON from Supabase REST API
const fetchPosts = () => {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&is_published=eq.true`;
        const options = {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Failed with status: ${res.statusCode} - ${data}`));
                }
            });
        }).on('error', err => reject(err));
    });
};

// Helper to download remote image files locally
const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(downloadFile(res.headers.location, dest));
            }
            if (res.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => {});
                return reject(new Error(`Failed status ${res.statusCode}`));
            }
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            file.close();
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

async function runImport() {
    console.log(`\nStarting clean migration matching blog.json schema...`);
    
    try {
        const posts = await fetchPosts();
        
        if (!posts || posts.length === 0) {
            console.log("No posts found.");
            return;
        }

        // Ensure directories exist
        if (!fs.existsSync(blogFolder)) fs.mkdirSync(blogFolder, { recursive: true });
        if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder, { recursive: true });

        for (const post of posts) {
            const title = post.title || 'Untitled';
            const slug = post.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const date = post.published_at ? post.published_at.split('T')[0] : new Date().toISOString().split('T')[0];
            const content = post.content || post.body || post.excerpt || '';

            // Find image URL from Supabase payload
            let rawImageUrl = post.image_url || post.image || post.cover_image || post.thumbnail || post.featured_image || post.featured_image_url || '';
            let localImagePath = "/assets/images/deep1.png"; // Fallback default
            
            if (rawImageUrl) {
                if (!rawImageUrl.startsWith('http')) {
                    rawImageUrl = `${SUPABASE_URL}/storage/v1/object/public/site-images/${rawImageUrl.replace(/^\//, '')}`;
                }

                try {
                    const parsedUrl = new URL(rawImageUrl);
                    const ext = path.extname(parsedUrl.pathname) || '.png';
                    const fileName = `${slug}${ext}`;
                    const targetPath = path.join(imagesFolder, fileName);

                    console.log(`Downloading image for: "${title}"...`);
                    await downloadFile(rawImageUrl, targetPath);
                    localImagePath = `/assets/images/blog/${fileName}`;
                } catch (imgErr) {
                    console.log(`Could not download image for "${title}", using fallback.`);
                }
            }

            // Matches the exact keys required by blog.json
            const markdown = `---
title: "${title.replace(/"/g, "'")}"
description: "${title.replace(/"/g, "'")}"
url: "${slug}"
date: ${date}
image: "${localImagePath}"
imageAlt: "${title.replace(/"/g, "'")}"
---

${content}
`;
            const filePath = path.join(blogFolder, `${slug}.md`);
            fs.writeFileSync(filePath, markdown);
            console.log(`Saved Post: ${title}`);
        }

        console.log("\nMigration Complete! All articles match blog.json perfectly.");
        
    } catch (err) {
        console.error("Migration failed:", err.message);
    }
}

runImport();