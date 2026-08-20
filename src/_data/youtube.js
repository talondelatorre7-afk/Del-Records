const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = async function() {
    const fetchHTML = (urlString, redirects = 3) => {
        return new Promise((resolve, reject) => {
            if (redirects < 0) return reject(new Error("Too many redirects"));
            
            const parsedUrl = new URL(urlString);
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    // This cookie forces YouTube to bypass the consent wall and serve the actual page
                    'Cookie': 'CONSENT=YES+cb.20230101-01-p0.en+FX+478' 
                }
            };

            client.get(parsedUrl, options, (res) => {
                // Handle 302/301 Redirects automatically
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    let redirectUrl = res.headers.location;
                    if (!redirectUrl.startsWith('http')) {
                        redirectUrl = new URL(redirectUrl, parsedUrl.origin).href;
                    }
                    return resolve(fetchHTML(redirectUrl, redirects - 1));
                }
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            }).on('error', err => reject(err));
        });
    };

    try {
        console.log("\n--- YOUTUBE DIAGNOSTIC RUN ---");
        
        // 1. Fetch Latest Videos
        const latestRes = await fetchHTML('https://www.youtube.com/@DELRECORDS/videos');
        console.log("Latest Videos Status:", latestRes.status);
        const latestMatches = [...latestRes.data.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
        // Grab the first 3 unique video IDs
        const uniqueLatest = [...new Set(latestMatches.map(m => m[1]))].slice(0, 3);
        console.log("Latest Found IDs:", uniqueLatest);

        // 2. Fetch Popular Videos
        const popularRes = await fetchHTML('https://www.youtube.com/@DELRECORDS/popular');
        console.log("Popular Videos Status:", popularRes.status);
        const popularMatches = [...popularRes.data.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
        // Grab 3 unique popular IDs, making sure they don't overlap with the "Latest" row
        const uniquePopular = [...new Set(popularMatches.map(m => m[1]))]
            .filter(id => !uniqueLatest.includes(id)) 
            .slice(0, 3);
        console.log("Popular Found IDs:", uniquePopular);
        console.log("------------------------------\n");

        const finalVideos = [...uniqueLatest, ...uniquePopular];
        
        // If we successfully grabbed 6 videos, return them
        if (finalVideos.length === 6) {
            return finalVideos;
        }
        
        return ["eHeWD1TIxH0", "_BYgtLtjhnE", "vPdY1yIymbA", "eHeWD1TIxH0", "_BYgtLtjhnE", "vPdY1yIymbA"];
        
    } catch (err) {
        console.log("YouTube Script Error:", err.message);
        return ["eHeWD1TIxH0", "_BYgtLtjhnE", "vPdY1yIymbA", "eHeWD1TIxH0", "_BYgtLtjhnE", "vPdY1yIymbA"];
    }
};