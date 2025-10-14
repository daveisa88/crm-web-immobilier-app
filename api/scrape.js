// /api/scrape.js
// Vercel Serverless Function
// Utilise fetch natif (Node 18+). Pas de dépendance obligatoire.
// Si besoin de parsing HTML avancé, tu peux installer "cheerio" et brancher un parseur HTML.

// --- prix médians €/m² approximatifs (à ajuster / brancher sur une vraie source) ---
const MEDIANS = {
    "Île-de-France": 7200,
    "Auvergne-Rhône-Alpes": 3800,
    "Provence-Alpes-Côte d’Azur": 4500,
    "Centre-Val de Loire": 2200,
    "Grand Est": 2200,
    "Normandie": 2300,
};

// clamp helper
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// calcule le score de viabilité (10 = très bon plan)
function computeViability(pricePerM2, region) {
    const median = MEDIANS[region] || 3000;
    const ratio = pricePerM2 / median; // <1 = sous la médiane
    // score simple : 10 - (écart% * 10). Exemple: à 80% du prix médian → 10 - (0.8-1)*10 = 12 → clamp à 10
    const score = 10 - (ratio - 1) * 10;
    return Math.round(clamp(score, 0, 10) * 10) / 10;
}

// Normalisation d’une annonce
function normalizeItem({ titre, ville, prix, surface, lien, source }) {
    const px = Number(prix || 0);
    const s = Number(surface || 0);
    const prixM2 = s > 0 ? Math.round(px / s) : 0;
    return { titre, ville, prix: px, surface: s, prixM2, lien, source };
}

// 🔌 Adaptateurs (exemples “structure”)
// NB: Beaucoup de sites bloquent `fetch` serveur ou requièrent headers/cookies. On garde ici des exemples
// et ON RETOMBE SUR LE MODE FALLBACK si ça échoue.
async function adapterDemo(region) {
    // Génère de fausses annonces "plausibles" en fonction de la région
    const base = MEDIANS[region] || 3000;
    const cities = {
        "Île-de-France": ["Paris 15e", "Ivry-sur-Seine", "Montreuil", "Versailles"],
        "Auvergne-Rhône-Alpes": ["Lyon", "Villeurbanne", "Grenoble", "Annecy"],
        "Provence-Alpes-Côte d’Azur": ["Marseille", "Nice", "Aix-en-Provence", "Toulon"],
        "Centre-Val de Loire": ["Tours", "Orléans", "Chartres", "Bourges"],
        "Grand Est": ["Strasbourg", "Nancy", "Metz", "Reims"],
        "Normandie": ["Rouen", "Caen", "Le Havre", "Évreux"],
    }[region] || ["Centre-ville"];

    const rand = (min, max) => Math.round(min + Math.random() * (max - min));
    const items = Array.from({ length: 24 }).map((_, i) => {
        const surface = rand(18, 120);
        const prixM2 = rand(Math.round(base * 0.6), Math.round(base * 1.2));
        const prix = prixM2 * surface;
        return normalizeItem({
            titre: `${surface} m² — ${["Studio", "T2", "T3", "Maison", "Loft"][i % 5]} ${cities[i % cities.length]}`,
            ville: cities[i % cities.length],
            prix,
            surface,
            lien: `https://exemple-immobilier.test/annonce/${region}/${i + 1}`,
            source: "DEMO",
        });
    });

    return items;
}

// Exemple squelette d’un adaptateur réel (désactivé par défaut)
// async function adapterSomeSite(region) {
//   const url = "https://exemple-site-immobilier/recherche?region=" + encodeURIComponent(region);
//   const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }});
//   if (!res.ok) throw new Error("Source indisponible");
//   const html = await res.text();
//   // => parser HTML ici (cheerio) pour extraire les annonces...
//   // const $ = cheerio.load(html)
//   // ...
//   return parsedItems.map(normalizeItem);
// }

module.exports = async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const region = url.searchParams.get("region") || "Île-de-France";
        const limit = Number(url.searchParams.get("limit") || 100);

        // Appelle les adaptateurs en parallèle (ici, seulement demo)
        // Tu pourras rajouter d'autres adaptateurs: [adapterDemo, adapterSomeSite, ...]
        let items = [];
        try {
            const demoItems = await adapterDemo(region);
            items = items.concat(demoItems);
        } catch (e) {
            // ignore
        }

        // enrichissement: prix/m2 + score de viabilité
        const enriched = items
            .map((it) => ({
                ...it,
                viabilite: computeViability(it.prixM2, region),
            }))
            .sort((a, b) => b.viabilite - a.viabilite)
            .slice(0, limit);

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(200).send(JSON.stringify(enriched));
    } catch (err) {
        res.status(500).send(
            JSON.stringify({
                error: true,
                message: err.message || "Erreur inconnue",
            })
        );
    }
};
