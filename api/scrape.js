// /api/scrape.js
// Fonction serverless pour Vercel. Utilise SerpAPI.
// Nécessite : SERPAPI_KEY dans les variables d’environnement.

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
    const rawPrice = item.price || item.formatted_price || "";
    const rawSurface = item.surface || item.area || "";
    const prix = Number(String(rawPrice).replace(/\D/g, "")) || 0;
    const surface = Number(String(rawSurface).replace(/\D/g, "")) || 0;
    const prixM2 = surface > 0 ? Math.round(prix / surface) : 0;

    return {
        titre: item.title || item.name || item.snippet || "Annonce immobilière",
        ville: item.address || item.location || region,
        prix,
        surface,
        prixM2,
        viabilite: computeViability(prixM2, region),
        lien: item.link || item.url || "#",
        source: item.source || "SerpAPI",
    };
}

module.exports = async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const region = url.searchParams.get("region") || "Île-de-France";
        const serpKey = process.env.SERPAPI_KEY;

        if (!serpKey) throw new Error("❌ SERPAPI_KEY non défini dans les variables d'environnement.");

        const query = `site:leboncoin.fr immobilier à vendre ${region}`;
        const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(
            serpKey
        )}&google_domain=google.fr&hl=fr&num=20`;

        console.log("🔍 Requête envoyée à :", serpUrl);

        const fetchRes = await fetch(serpUrl);
        if (!fetchRes.ok) {
            const txt = await fetchRes.text();
            throw new Error(`SerpAPI error: ${fetchRes.status} - ${txt}`);
        }

        const json = await fetchRes.json();
        console.log("📦 Réponse SerpAPI reçue :", Object.keys(json));

        let rawItems = [];
        if (Array.isArray(json.properties_results) && json.properties_results.length) {
            rawItems = json.properties_results;
        } else if (Array.isArray(json.organic_results) && json.organic_results.length) {
            rawItems = json.organic_results;
        } else if (Array.isArray(json.local_results) && json.local_results.length) {
            rawItems = json.local_results;
        } else {
            console.warn("⚠️ Aucun bloc d'annonces détecté dans la réponse SerpAPI.");
        }

        // Si aucun résultat valide => fallback mode démo
        if (rawItems.length === 0) {
            console.log("💡 Mode démo activé (aucun résultat SerpAPI)");
            const cities = {
                "Île-de-France": ["Paris", "Ivry", "Versailles", "Montreuil"],
                "Normandie": ["Rouen", "Caen", "Le Havre", "Évreux"],
                "Grand Est": ["Strasbourg", "Nancy", "Metz", "Reims"],
            }[region] || ["Centre-ville"];
            const base = MEDIANS[region] || 3000;
            const rand = (min, max) => Math.round(min + Math.random() * (max - min));

            const demo = Array.from({ length: 12 }).map((_, i) => {
                const surface = rand(25, 110);
                const prixM2 = rand(Math.round(base * 0.6), Math.round(base * 1.3));
                const prix = surface * prixM2;
                return {
                    titre: `${surface} m² — ${["T2", "T3", "Maison", "Loft"][i % 4]} ${cities[i % cities.length]}`,
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
            return res.status(200).json(demo);
        }

        const normalized = rawItems
            .map((it) => normalizeAnnonce(it, region))
            .filter((n) => n.prix > 0 && n.surface > 0)
            .sort((a, b) => b.viabilite - a.viabilite)
            .slice(0, 40);

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(200).json(normalized);
    } catch (err) {
        console.error("❌ /api/scrape error:", err.message);
        res.status(500).json({ error: true, message: err.message });
    }
};
