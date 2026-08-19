const https = require('https');

module.exports = async function() {
    const artists = {
        lenin: "3hTffafUYLLgO4yuPAxb5U",
        t3r: "34nbQa7Hug9DYkRJpfKNFv",
        rabbanito: "4VPLEp6rYxqpf6n0QEkS5z",
        yahir: "19NGyg3ucHFhAP3mwPsggJ",
        panchito: "1enyvmNKgt4BIIkVnt9FAV",
        sucesionm: "2Cxqiw8iTT18OMjlq033V6",
        diferencia: "56Bgv8NobSf7vr83bUsPWV",
        cuerno: "6WfZ64HOR7tT0nGmxKQ7Hq",
        josem: "1rXOb9uSnt1qvPF44FTplr",
        whathedgar: "5tO4Hf0EVv8MRtvJHgANcB",
        emanuel: "7qqYlhGMuHBRqjQ3ly1oHl",
        marco: "7nh08l0O7hWA0a0IQIgZmj",
        jason: "2lepWRiiExF1dCk2hSyZ12",
        martin: "7oKwuamCT99LkJECNqSUtR",
        andi: "3nON5znO7TMA84ZKtOhORy",
        cobian: "4OVBPUhuX2CwyDSZLgi6Qc",
        diana: "2gddhtroO8YVORZShAjf2O",
        dseiko: "0WqL04uQDLZsWFQ2gOpovx"
    };

    const results = {};

    const fetchHTML = (url) => {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    // Spoofing Googlebot forces Spotify to bypass the JS shell and serve the hardcoded SEO meta tags
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                    'Accept': 'text/html'
                }
            };
            https.get(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            }).on('error', err => reject(err));
        });
    };

    for (const [key, id] of Object.entries(artists)) {
        try {
            const { data } = await fetchHTML(`https://open.spotify.com/artist/${id}`);
            
            // Grabs the number specifically from the SEO HTML
            const match = data.match(/([\d\.,]+[KMB]?)\s+monthly listeners/i);
            results[key] = match ? match[1] : "N/A";
            
        } catch (err) {
            results[key] = "N/A";
        }
        
        // 500ms delay to prevent Spotify from rate-limiting the build server
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
};