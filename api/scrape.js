// /api/scrape.js
// Scraper mixte : LeBonCoin (API), SeLoger, PAP
// Utilise ta clé SERPAPI_KEY et combine les résultats réels

const REGION_IDS = {
  "Ain": "22",
  "Aisne": "19",
  "Allier": "22",
  "Alpes-de-Haute-Provence": "21",
  "Hautes-Alpes": "21",
  "Alpes-Maritimes": "21",
  "Ardèche": "22",
  "Ardennes": "18",
  "Ariège": "20",
  "Aube": "18",
  "Aude": "20",
  "Aveyron": "20",
  "Bouches-du-Rhône": "21",
  "Calvados": "23",
  "Cantal": "22",
  "Charente": "16",
  "Charente-Maritime": "16",
  "Cher": "24",
  "Corrèze": "19",
  "Corse-du-Sud": "26",
  "Haute-Corse": "26",
  "Côte-d'Or": "27",
  "Côtes-d'Armor": "17",
  "Creuse": "19",
  "Dordogne": "16",
  "Doubs": "27",
  "Drôme": "22",
  "Eure": "23",
  "Eure-et-Loir": "24",
  "Finistère": "17",
  "Gard": "20",
  "Haute-Garonne": "20",
  "Gers": "20",
  "Gironde": "16",
  "Hérault": "20",
  "Ille-et-Vilaine": "17",
  "Indre": "24",
  "Indre-et-Loire": "24",
  "Isère": "22",
  "Jura": "27",
  "Landes": "16",
  "Loir-et-Cher": "24",
  "Loire": "22",
  "Haute-Loire": "22",
  "Loire-Atlantique": "17",
  "Loiret": "24",
  "Lot": "20",
  "Lot-et-Garonne": "16",
  "Lozère": "20",
  "Maine-et-Loire": "17",
  "Manche": "23",
  "Marne": "18",
  "Haute-Marne": "18",
  "Mayenne": "17",
  "Meurthe-et-Moselle": "18",
  "Meuse": "18",
  "Morbihan": "17",
  "Moselle": "18",
  "Nièvre": "27",
  "Nord": "19",
  "Oise": "19",
  "Orne": "23",
  "Pas-de-Calais": "19",
  "Puy-de-Dôme": "22",
  "Pyrénées-Atlantiques": "16",
  "Hautes-Pyrénées": "20",
  "Pyrénées-Orientales": "20",
  "Bas-Rhin": "18",
  "Haut-Rhin": "18",
  "Rhône": "22",
  "Haute-Saône": "27",
  "Saône-et-Loire": "27",
  "Sarthe": "17",
  "Savoie": "22",
  "Haute-Savoie": "22",
  "Paris": "25",
  "Seine-Maritime": "23",
  "Seine-et-Marne": "25",
  "Yvelines": "25",
  "Deux-Sèvres": "17",
  "Somme": "19",
  "Tarn": "20",
  "Tarn-et-Garonne": "20",
  "Var": "21",
  "Vaucluse": "21",
  "Vendée": "17",
  "Vienne": "17",
  "Haute-Vienne": "19",
  "Vosges": "18",
  "Yonne": "27",
  "Territoire de Belfort": "27",
  "Essonne": "25",
  "Hauts-de-Seine": "25",
  "Seine-Saint-Denis": "25",
  "Val-de-Marne": "25",
  "Val-d'Oise": "25",
};


const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function computeViability(pricePerM2, region) {
  const median = MEDIANS[region] || 3000;
  const ratio = pricePerM2 / median;
  const score = 10 - (ratio - 1) * 10;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
}

function extractFromText(text = "") {
  const prixMatch = text.match(/(\d{2,3}(?:[\s.,]?\d{3})*)\s*€/) || [];
  const surfMatch = text.match(/(\d{1,3})\s*(m2|m²)/i) || [];
  const prix = prixMatch[1] ? Number(prixMatch[1].replace(/[^\d]/g, "")) : 0;
  const surface = surfMatch[1] ? Number(surfMatch[1].replace(/[^\d]/g, "")) : 0;
  return { prix, surface };
}

function normalizeAnnonce(item, departement, source = "Autre") {
  const title = item.title || item.name || "Annonce immobilière";
  const desc = item.description || item.snippet || "";
  const { prix, surface } = extractFromText(`${title} ${desc}`);
  const prixM2 = surface > 0 ? Math.round(prix / surface) : 0;
  return {
    titre: title,
    departement,
    prix,
    surface,
    prixM2,
    viabilite: computeViability(prixM2, departement),
    lien: item.link || item.url || "#",
    source,
  };
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Essonne";
    const serpKey = process.env.SERPAPI_KEY;
    const annonces = [];

    // === 1️⃣ LEBONCOIN DIRECT ===
    try {
      const lbcRes = await fetch("https://api.leboncoin.fr/finder/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {
            category: { id: "9" }, // ventes immobilières
            enums: { ad_type: ["offer"] },
            keywords: { text: departement },
          },
          limit: 20,
          offset: 0,
          sort_by: "price",
        }),
      });
      const lbcJson = await lbcRes.json();
      if (Array.isArray(lbcJson.ads)) {
        lbcJson.ads.forEach((ad) => {
          const prix = ad.price || 0;
          const surface = ad.attributes?.find((a) => a.key === "square")?.value || 0;
          const prixM2 = surface > 0 ? Math.round(prix / surface) : 0;
          annonces.push({
            titre: ad.subject || "Annonce LeBonCoin",
            departement,
            prix,
            surface,
            prixM2,
            viabilite: computeViability(prixM2, departement),
            lien: `https://www.leboncoin.fr/${ad.category_id}/${ad.list_id}.htm`,
            source: "LeBonCoin",
          });
        });
      }
    } catch (err) {
      console.warn("⚠️ Erreur LeBonCoin:", err.message);
    }

    // === 2️⃣ SERPAPI (SeLoger + PAP) ===
    if (serpKey) {
      const query = `immobilier à vendre ${departement} site:seloger.com OR site:pap.fr`;
      const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
        query
      )}&api_key=${serpKey}&google_domain=google.fr&hl=fr&num=30`;

      const serpRes = await fetch(serpUrl);
      const serpJson = await serpRes.json();

      let rawItems = [];
      if (Array.isArray(serpJson.organic_results))
        rawItems = serpJson.organic_results;
      else if (Array.isArray(serpJson.inline_images))
        rawItems = serpJson.inline_images;
      else if (Array.isArray(serpJson.local_results))
        rawItems = serpJson.local_results;
      else rawItems = serpJson.results || [];

      rawItems
        .filter((it) => it.link && (it.link.includes("seloger.com") || it.link.includes("pap.fr")))
        .forEach((it) => {
          annonces.push(normalizeAnnonce(it, departement, it.link.includes("seloger") ? "SeLoger" : "PAP"));
        });
    }

    // === 3️⃣ Nettoyage & tri ===
    const clean = annonces
      .filter((a) => a.prix > 0 && a.surface > 0)
      .sort((a, b) => b.viabilite - a.viabilite)
      .slice(0, 40);

    if (!clean.length) {
      throw new Error("Aucune annonce trouvée (LeBonCoin / SeLoger / PAP).");
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json(clean);
  } catch (err) {
    console.error("❌ /api/scrape error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
};
