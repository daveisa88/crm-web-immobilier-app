// /api/scrape.js
// Serverless function for Vercel (Node 18+). Uses SerpAPI.
// Expects SERPAPI_KEY in environment variables.

const MEDIANS = {
    "Île-de-France": 7200,
    "Auvergne-Rhône-Alpes": 3800,
    "Provence-Alpes-Côte d’Azur": 4500,
    "Centre-Val de Loire": 2200,
    "Grand Est": 2200,
    "Normandie": 2300,
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function computeViability(pricePerM2, region) {
    const median = MEDIANS[region] || 3000;
    const ratio = pricePerM2 / median;
    const score = 10 - (ratio - 1) * 10;
    return Math.round(clamp(score, 0, 10) * 10) / 10;
}

function normalizeAnnonce(item, region) {
    // item from SerpAPI may differ; protect access
    const rawPrice = item.price || item.formatted_price || "";
    const rawSurface = item.surface || item.area || "";
    const prix = Number(String(rawPrice).replace(/\D/g, "")) || 0;
    const surface = Number(String(rawSurface).replace(/\D/g, "")) || 0;
    const prixM2 = surface > 0 ? Math.round(prix / surface) : 0;
    return {
        titre: item.title || item.name || item.snippet || "Annonce",
        ville: item.address || region,
        prix,
        surface,
        prixM2,
        viabilite: computeViability(prixM2, region),
        lien: item.link || item.url || "#",
        source: item.source || "SERPAPI_KEY",
    };
}

module.exports = async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const region = url.searchParams.get("region") || "Île-de-France";
        const serpKey = process.env.SERPAPI_KEY;

        // If no key, fall back to demo synthetic data (keeps frontend functional)
        if (!serpKey) {
            // demo generator (same as previous demo)
            const cities = {
                "Île-de-France": ["Paris 15e", "Ivry-sur-Seine", "Montreuil", "Versailles"],
                "Auvergne-Rhône-Alpes": ["Lyon", "Villeurbanne", "Grenoble", "Annecy"],
                "Provence-Alpes-Côte d’Azur": ["Marseille", "Nice", "Aix-en-Provence", "Toulon"],
                "Centre-Val de Loire": ["Tours", "Orléans", "Chartres", "Bourges"],
                "Grand Est": ["Strasbourg", "Nancy", "Metz", "Reims"],
                "Normandie": ["Rouen", "Caen", "Le Havre", "Évreux"],
            }[region] || ["Centre-ville"];

            const rand = (min, max) => Math.round(min + Math.random() * (max - min));
            const base = MEDIANS[region] || 3000;
            const items = Array.from({ length: 24 }).map((_, i) => {
                const surface = rand(18, 120);
                const prixM2 = rand(Math.round(base * 0.6), Math.round(base * 1.2));
                const prix = prixM2 * surface;
                return {
                    titre: `${surface} m² — ${["Studio", "T2", "T3", "Maison", "Loft"][i % 5]} ${cities[i % cities.length]}`,
                    ville: cities[i % cities.length],
                    prix,
                    surface,
                    prixM2,
                    viabilite: computeViability(prixM2, region),
                    lien: `https://exemple-immobilier.test/annonce/${region}/${i + 1}`,
                    source: "DEMO",
                };
            });
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            return res.status(200).json(items);
        }

        // Real SerpAPI call
        const query = `immobilier à vendre ${region}`;
        const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(serpKey)}&num=30`;

        const fetchRes = await fetch(serpUrl);
        if (!fetchRes.ok) {
            const txt = await fetchRes.text();
            throw new Error(`SerpAPI error: ${fetchRes.status} - ${txt}`);
        }
        const json = await fetchRes.json();

        // Attempt to get multiple possible fields (properties_results, local_results, organic_results)
        let rawItems = [];
        if (Array.isArray(json.properties_results) && json.properties_results.length) {
            rawItems = json.properties_results;
        } else if (Array.isArray(json.local_results) && json.local_results.length) {
            rawItems = json.local_results;
        } else if (Array.isArray(json.organic_results) && json.organic_results.length) {
            rawItems = json.organic_results;
        } else if (Array.isArray(json.inline_images) && json.inline_images.length) {
            rawItems = json.inline_images;
        } else {
            // fallback try items in json
            rawItems = json.results || [];
        }

        const normalized = rawItems
            .map((it) => normalizeAnnonce(it, region))
            .filter((n) => n.prix > 0 && n.surface > 0) // optional filter
            .sort((a, b) => b.viabilite - a.viabilite)
            .slice(0, 50);

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(200).json(normalized);
    } catch (err) {
        console.error("API /api/scrape error:", err);
        res.status(500).json({ error: true, message: err.message });
    }
};
