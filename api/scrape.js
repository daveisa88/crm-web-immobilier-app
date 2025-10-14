// /api/scrape.js
// Scraper mixte : LeBonCoin (API), SeLoger, PAP
// Utilise ta clé SERPAPI_KEY et combine les résultats réels



// === Table de correspondance département → ID région LBC
// === Table de correspondance département (code officiel) → ID région LeBonCoin ===
const REGION_IDS = {
  "01 Ain": "22",
  "02 Aisne": "19",
  "03 Allier": "22",
  "04 Alpes-de-Haute-Provence": "21",
  "05 Hautes-Alpes": "21",
  "06 Alpes-Maritimes": "21",
  "07 Ardèche": "22",
  "08 Ardennes": "18",
  "09 Ariège": "20",
  "10 Aube": "18",
  "11 Aude": "20",
  "12 Aveyron": "20",
  "13 Bouches-du-Rhône": "21",
  "14 Calvados": "23",
  "15 Cantal": "22",
  "16 Charente": "16",
  "17 Charente-Maritime": "16",
  "18 Cher": "24",
  "19 Corrèze": "19",
  "2A Corse-du-Sud": "26",
  "2B Haute-Corse": "26",
  "21 Côte-d'Or": "27",
  "22 Côtes-d'Armor": "17",
  "23 Creuse": "19",
  "24 Dordogne": "16",
  "25 Doubs": "27",
  "26 Drôme": "22",
  "27 Eure": "23",
  "28 Eure-et-Loir": "24",
  "29 Finistère": "17",
  "30 Gard": "20",
  "31 Haute-Garonne": "20",
  "32 Gers": "20",
  "33 Gironde": "16",
  "34 Hérault": "20",
  "35 Ille-et-Vilaine": "17",
  "36 Indre": "24",
  "37 Indre-et-Loire": "24",
  "38 Isère": "22",
  "39 Jura": "27",
  "40 Landes": "16",
  "41 Loir-et-Cher": "24",
  "42 Loire": "22",
  "43 Haute-Loire": "22",
  "44 Loire-Atlantique": "17",
  "45 Loiret": "24",
  "46 Lot": "20",
  "47 Lot-et-Garonne": "16",
  "48 Lozère": "20",
  "49 Maine-et-Loire": "17",
  "50 Manche": "23",
  "51 Marne": "18",
  "52 Haute-Marne": "18",
  "53 Mayenne": "17",
  "54 Meurthe-et-Moselle": "18",
  "55 Meuse": "18",
  "56 Morbihan": "17",
  "57 Moselle": "18",
  "58 Nièvre": "27",
  "59 Nord": "19",
  "60 Oise": "19",
  "61 Orne": "23",
  "62 Pas-de-Calais": "19",
  "63 Puy-de-Dôme": "22",
  "64 Pyrénées-Atlantiques": "16",
  "65 Hautes-Pyrénées": "20",
  "66 Pyrénées-Orientales": "20",
  "67 Bas-Rhin": "18",
  "68 Haut-Rhin": "18",
  "69 Rhône": "22",
  "70 Haute-Saône": "27",
  "71 Saône-et-Loire": "27",
  "72 Sarthe": "17",
  "73 Savoie": "22",
  "74 Haute-Savoie": "22",
  "75 Paris": "25",
  "76 Seine-Maritime": "23",
  "77 Seine-et-Marne": "25",
  "78 Yvelines": "25",
  "79 Deux-Sèvres": "17",
  "80 Somme": "19",
  "81 Tarn": "20",
  "82 Tarn-et-Garonne": "20",
  "83 Var": "21",
  "84 Vaucluse": "21",
  "85 Vendée": "17",
  "86 Vienne": "17",
  "87 Haute-Vienne": "19",
  "88 Vosges": "18",
  "89 Yonne": "27",
  "90 Territoire de Belfort": "27",
  "91 Essonne": "25",
  "92 Hauts-de-Seine": "25",
  "93 Seine-Saint-Denis": "25",
  "94 Val-de-Marne": "25",
  "95 Val-d'Oise": "25",
};


// === Région correspondante pour le calcul de viabilité
const DEPT_TO_REGION = {
  "Essonne": "Île-de-France",
  "Paris": "Île-de-France",
  "Seine-et-Marne": "Île-de-France",
  "Yvelines": "Île-de-France",
  "Nord": "Hauts-de-France",
  "Pas-de-Calais": "Hauts-de-France",
  "Rhône": "Auvergne-Rhône-Alpes",
  "Haute-Savoie": "Auvergne-Rhône-Alpes",
  "Isère": "Auvergne-Rhône-Alpes",
  "Var": "Provence-Alpes-Côte d’Azur",
  "Vaucluse": "Provence-Alpes-Côte d’Azur",
  "Bouches-du-Rhône": "Provence-Alpes-Côte d’Azur",
  "Haute-Garonne": "Occitanie",
  "Hérault": "Occitanie",
  "Gironde": "Nouvelle-Aquitaine",
  "Pyrénées-Atlantiques": "Nouvelle-Aquitaine",
  "Loire-Atlantique": "Pays de la Loire",
  "Maine-et-Loire": "Pays de la Loire",
  "Ille-et-Vilaine": "Bretagne",
  "Finistère": "Bretagne",
  "Bas-Rhin": "Grand Est",
  "Haut-Rhin": "Grand Est",
  "Eure": "Normandie",
  "Calvados": "Normandie",
};

// === Fonctions utilitaires ===
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function computeViability(pricePerM2, departement) {
  const region = DEPT_TO_REGION[departement] || "Nouvelle-Aquitaine";
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

// === HANDLER PRINCIPAL ===
module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Essonne";
    const serpKey = process.env.SERPAPI_KEY;
    const annonces = [];

    // === 1️⃣ LEBONCOIN DIRECT ===
    try {
      const regionId = REGION_IDS[departement] || "25";
      const lbcRes = await fetch("https://api.leboncoin.fr/finder/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {
            category: { id: "9" },
            enums: { ad_type: ["offer"] },
            location: { regions: [regionId] },
            keywords: { text: departement },
          },
          limit: 25,
          offset: 0,
          sort_by: "time",
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
      .slice(0, 50);

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
