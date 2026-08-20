const https = require('https');

module.exports = async function() {
    const artistList = [
        { name: "Lenin Ramirez", id: "3hTffafUYLLgO4yuPAxb5U", image: "/assets/images/lenin.jpg", fallbackListeners: "19.3M" },
        { name: "T3R Elemento", id: "34nbQa7Hug9DYkRJpfKNFv", image: "/assets/images/t3r.jpg", fallbackListeners: "7.5M" },
        { name: "El Rabbanito", id: "4VPLEp6rYxqpf6n0QEkS5z", image: "/assets/images/rabbanito.jpg", fallbackListeners: "4.7M" },
        { name: "Yahir Saldivar", id: "19NGyg3ucHFhAP3mwPsggJ", image: "/assets/images/yahir.jpg", fallbackListeners: "1.3M" },
        { name: "Panchito Arredondo", id: "1enyvmNKgt4BIIkVnt9FAV", image: "/assets/images/panchito.jpg", fallbackListeners: "1.4M" },
        { name: "Sucesión M", id: "2Cxqiw8iTT18OMjlq033V6", image: "/assets/images/sucesionm.jpg", fallbackListeners: "204K" },
        { name: "LA DIFERENCIA", id: "56Bgv8NobSf7vr83bUsPWV", image: "/assets/images/diferencia.jpg", fallbackListeners: "101K" },
        { name: "CUERNO", id: "6WfZ64HOR7tT0nGmxKQ7Hq", image: "/assets/images/cuerno.jpg", fallbackListeners: "120,255" },
        { name: "Jose Manuel", id: "1rXOb9uSnt1qvPF44FTplr", image: "/assets/images/josem.jpg", fallbackListeners: "73,529" },
        { name: "whathedgar", id: "5tO4Hf0EVv8MRtvJHgANcB", image: "/assets/images/whathedgar.jpg", fallbackListeners: "43,775" },
        { name: "Emanuel Garcia", id: "7qqYlhGMuHBRqjQ3ly1oHl", image: "/assets/images/emma.jpg", fallbackListeners: "61,031" },
        { name: "Marco Granillo", id: "7nh08l0O7hWA0a0IQIgZmj", image: "/assets/images/marcos.jpg", fallbackListeners: "51,071" },
        { name: "Jason Cota", id: "2lepWRiiExF1dCk2hSyZ12", image: "/assets/images/jasoncota.jpg", fallbackListeners: "34,033" },
        { name: "Martín Beltran", id: "7oKwuamCT99LkJECNqSUtR", image: "/assets/images/martinb.jpg", fallbackListeners: "10,324" },
        { name: "Andi Luan", id: "3nON5znO7TMA84ZKtOhORy", image: "/assets/images/andi.jpg", fallbackListeners: "8,724" },
        { name: "Cobian Montana", id: "4OVBPUhuX2CwyDSZLgi6Qc", image: "/assets/images/cobian.jpg", fallbackListeners: "2,555" },
        { name: "Diana Araujo", id: "2gddhtroO8YVORZShAjf2O", image: "/assets/images/diana.jpg", fallbackListeners: "698" },
        { name: "Dseiko", id: "0WqL04uQDLZsWFQ2gOpovx", image: "/assets/images/dseiko.jpg", fallbackListeners: "470" }
    ];

    const fetchHTML = (url) => {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
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

    // Helper: Converts strings like "19.3M", "204K", "120,255" into raw numbers for accurate sorting
    const parseListenerCount = (str) => {
        if (!str || str === 'N/A') return 0;
        const cleaned = str.trim().toUpperCase();
        if (cleaned.endsWith('M')) {
            return parseFloat(cleaned.replace('M', '').replace(/,/g, '')) * 1000000;
        }
        if (cleaned.endsWith('K')) {
            return parseFloat(cleaned.replace('K', '').replace(/,/g, '')) * 1000;
        }
        if (cleaned.endsWith('B')) {
            return parseFloat(cleaned.replace('B', '').replace(/,/g, '')) * 1000000000;
        }
        return parseFloat(cleaned.replace(/,/g, '')) || 0;
    };

    const hydratedArtists = [];

    for (const artist of artistList) {
        let monthlyListeners = artist.fallbackListeners;
        try {
            const { data } = await fetchHTML(`https://open.spotify.com/artist/${artist.id}`);
            const match = data.match(/([\d\.,]+[KMB]?)\s+monthly listeners/i);
            if (match && match[1]) {
                monthlyListeners = match[1];
            }
        } catch (err) {
            // Falls back to existing baseline if a network blip occurs
            monthlyListeners = artist.fallbackListeners;
        }

        hydratedArtists.push({
            name: artist.name,
            url: `https://open.spotify.com/artist/${artist.id}`,
            image: artist.image,
            monthlyListeners: monthlyListeners,
            numericCount: parseListenerCount(monthlyListeners)
        });

        // 500ms delay to keep requests safe
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Sort descending by monthly listeners
    hydratedArtists.sort((a, b) => b.numericCount - a.numericCount);

    return {
        featured: hydratedArtists.slice(0, 4),
        normal: hydratedArtists.slice(4)
    };
};