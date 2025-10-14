// /api/scrape.js
// Scraper immobilier optimisé par département (Vercel + SerpAPI)

const MEDIANS = {
  "Paris": 11000,
  "Yvelines": 5000,
  "Essonne": 3700,
  "Seine-et-Marne": 3500,
  "Hauts-de-Seine": 8700,
  "Val-de-Marne": 6700,
  "Seine-Saint-Denis": 4600,
  "Nord": 2500,
  "Pas-de-Calais": 2300,
  "Loire-Atlantique": 4300,
  "Gironde": 4200,
  "Rhône": 4500,
  "Var": 4800,
  "Bouches-du-Rhône": 5000,
  "Haute-Garonne": 3800,
  "Hérault": 4100,
  "Bas-Rhin": 2900,
  "Isère": 3600,
  "Ain": 3300,
  "Savoie": 4200,
  "Haute-Savoie": 4800,
  "Vaucluse": 3600,
  "Charente-Maritime": 3900,
  "Côte-d’Or": 3100,
  "Dordogne": 2600,
  "Pyrénées-Atlantiques": 3900,
  "Aude": 2800,
  "Gard": 3500,
  "Vienne": 2300,
  "Haute-Loire": 2100,
  "Indre-et-Loire": 2800,
  "Loir-et-Cher": 2400,
  "Corrèze": 2200,
  "Ardèche": 2600,
  "Aube": 2300,
  "Somme": 2400,
  "Moselle": 2500,
  "Haute-Saône": 2100,
  "Aisne": 2000,
  "Marne": 2600,
  "Nièvre": 1900,
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function computeViability(pricePerM2, departement) {
  const median = MEDIANS[departement] || 3000;
  const ratio = pricePerM2 / median;
  const score = 10 - (ratio - 1) * 10;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
}

// 🔍 Extraction du prix et de la surface dans le texte
function extractFromText(text = "") {
  const prixMatch = text.match(/(\d{2,3}(?:[\s.,]?\d{3})*)\s*€/) || [];
  const surfMatch = text.match(/(\d{1,3})\s*(m2|m²)/i) || [];
  const prix = prixMatch[1] ? Number(prixMatch[1].replace(/[^\d]/g, "")) : 0;
  const surface = surfMatch[1] ? Number(surfMatch[1].replace(/[^\d]/g, "")) : 0;
  return { prix, surface };
}

function normalizeAnnonce(item, departement) {
  const title = item.title || "";
  const desc = item.snippet || "";
  const { prix, surface } = extractFromText(`${title} ${desc}`);
  const prixM2 = surface > 0 ? Math.round(prix / surface) : 0;

  // ✅ Détection de la source
  let source = "Autre";
  if (item.link.includes("leboncoin.fr")) source = "LeBonCoin";
  else if (item.link.includes("pap.fr")) source = "PAP";
  else if (item.link.includes("seloger.com")) source = "SeLoger";

  return {
    titre: title || "Annonce immobilière",
    departement,
    prix,
    surface,
    prixM2,
    viabilite: computeViability(prixM2, departement),
    lien: item.link,
    source,
  };
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Rhône";
    const serpKey = process.env.SERPAPI_KEY;

    if (!serpKey) throw new Error("❌ SERPAPI_KEY non défini.");

    // 🧠 Requête ciblée sur LeBonCoin par département
    const query = `site:leboncoin.fr/ventes_immobilieres immobilier à vendre ${departement}`;
    const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
      query
    )}&api_key=${encodeURIComponent(serpKey)}&google_domain=google.fr&hl=fr&num=50`;

    console.log("🚀 Requête envoyée :", serpUrl);

    const fetchRes = await fetch(serpUrl);
    const json = await fetchRes.json();

    let rawItems = json.organic_results || [];

    // ⚙️ Filtrage : uniquement les vrais liens d’annonces
    rawItems = rawItems.filter(
      (it) => it.link && it.link.includes("leboncoin.fr/ventes_immobilieres/")
    );

    console.log(`📊 ${rawItems.length} annonces filtrées pour ${departement}.`);

    if (!rawItems.length) {
      console.log("⚠️ Aucun résultat valide → fallback DEMO");
      const base = MEDIANS[departement] || 3000;
      const rand = (min, max) => Math.round(min + Math.random() * (max - min));
      const demo = Array.from({ length: 8 }).map((_, i) => {
        const surface = rand(25, 100);
        const prixM2 = rand(Math.round(base * 0.7), Math.round(base * 1.2));
        const prix = surface * prixM2;
        return {
          titre: `${surface} m² — ${["T2", "T3", "Maison"][i % 3]} ${departement}`,
          departement,
          prix,
          surface,
          prixM2,
          viabilite: computeViability(prixM2, departement),
          lien: `https://exemple.com/${departement}/${i + 1}`,
          source: "DEMO",
        };
      });
      return res.status(200).json(demo);
    }

    // 🔧 Normalisation
    const annonces = rawItems
      .map((it) => normalizeAnnonce(it, departement))
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
