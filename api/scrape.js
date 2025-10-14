// /api/scrape.js
// Fonction serverless Vercel (Node 18+)

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

// 🧩 Extraction des chiffres (prix + surface) à partir d'un texte
function extractFromText(text = "") {
  const prixMatch = text.match(/(\d{2,3}(?:[\s.,]?\d{3})*)\s*€/) || [];
  const surfMatch = text.match(/(\d{1,3})\s*m²/i) || [];
  const prix = prixMatch[1] ? Number(prixMatch[1].replace(/[^\d]/g, "")) : 0;
  const surface = surfMatch[1] ? Number(surfMatch[1].replace(/[^\d]/g, "")) : 0;
  return { prix, surface };
}

function normalizeAnnonce(item, region) {
  let { prix, surface } = extractFromText(`${item.title || ""} ${item.snippet || ""}`);
  const prixM2 = surface > 0 ? Math.round(prix / surface) : 0;

  return {
    titre: item.title || "Annonce immobilière",
    ville: region,
    prix,
    surface,
    prixM2,
    viabilite: computeViability(prixM2, region),
    lien: item.link || item.url || "#",
    source: "SerpAPI",
  };
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const region = url.searchParams.get("region") || "Île-de-France";
    const serpKey = process.env.SERPAPI_KEY;

    if (!serpKey) throw new Error("❌ SERPAPI_KEY non défini.");

    const query = `site:leboncoin.fr immobilier à vendre ${region}`;
    const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
      query
    )}&api_key=${encodeURIComponent(
      serpKey
    )}&google_domain=google.fr&hl=fr&num=20`;

    console.log("🔍 Requête envoyée :", serpUrl);
    const fetchRes = await fetch(serpUrl);
    const json = await fetchRes.json();

    console.log("📦 Clés reçues :", Object.keys(json));

    let rawItems = [];
    if (Array.isArray(json.properties_results) && json.properties_results.length) {
      rawItems = json.properties_results;
    } else if (Array.isArray(json.organic_results) && json.organic_results.length) {
      rawItems = json.organic_results;
    } else if (Array.isArray(json.local_results) && json.local_results.length) {
      rawItems = json.local_results;
    }

    if (!rawItems.length) {
      console.log("⚠️ Aucune annonce trouvée, fallback DEMO");
      const base = MEDIANS[region] || 3000;
      const rand = (min, max) => Math.round(min + Math.random() * (max - min));
      const demo = Array.from({ length: 10 }).map((_, i) => {
        const surface = rand(25, 100);
        const prixM2 = rand(Math.round(base * 0.7), Math.round(base * 1.2));
        const prix = surface * prixM2;
        return {
          titre: `${surface} m² - ${["T2", "T3", "Maison", "Loft"][i % 4]} ${region}`,
          ville: region,
          prix,
          surface,
          prixM2,
          viabilite: computeViability(prixM2, region),
          lien: `https://exemple-immobilier.test/${region}/${i + 1}`,
          source: "DEMO",
        };
      });
      return res.status(200).json(demo);
    }

    const annonces = rawItems
      .map((it) => normalizeAnnonce(it, region))
      .filter((a) => a.prix > 0)
      .sort((a, b) => b.viabilite - a.viabilite)
      .slice(0, 25);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json(annonces);
  } catch (err) {
    console.error("❌ /api/scrape error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
};
