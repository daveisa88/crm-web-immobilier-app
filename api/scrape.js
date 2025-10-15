// /api/scrape.js
// =======================================================================
// 🏡 Scraper Immo Pro — LeBonCoin (RapidAPI) + Prix Médians Etalab DVF
// =======================================================================

const cache = new Map();
const RAPID_KEY = process.env.RAPIDAPI_KEY;

// ============================================================
// 1️⃣ Liste complète des départements français (nom → code INSEE)
// ============================================================

const DEPARTEMENTS_CODES = {
  "Ain": "01", "Aisne": "02", "Allier": "03", "Alpes-de-Haute-Provence": "04",
  "Hautes-Alpes": "05", "Alpes-Maritimes": "06", "Ardèche": "07", "Ardennes": "08",
  "Ariège": "09", "Aube": "10", "Aude": "11", "Aveyron": "12", "Bouches-du-Rhône": "13",
  "Calvados": "14", "Cantal": "15", "Charente": "16", "Charente-Maritime": "17",
  "Cher": "18", "Corrèze": "19", "Corse-du-Sud": "2A", "Haute-Corse": "2B",
  "Côte-d'Or": "21", "Côtes-d'Armor": "22", "Creuse": "23", "Dordogne": "24",
  "Doubs": "25", "Drôme": "26", "Eure": "27", "Eure-et-Loir": "28",
  "Finistère": "29", "Gard": "30", "Haute-Garonne": "31", "Gers": "32",
  "Gironde": "33", "Hérault": "34", "Ille-et-Vilaine": "35", "Indre": "36",
  "Indre-et-Loire": "37", "Isère": "38", "Jura": "39", "Landes": "40",
  "Loir-et-Cher": "41", "Loire": "42", "Haute-Loire": "43", "Loire-Atlantique": "44",
  "Loiret": "45", "Lot": "46", "Lot-et-Garonne": "47", "Lozère": "48",
  "Maine-et-Loire": "49", "Manche": "50", "Marne": "51", "Haute-Marne": "52",
  "Mayenne": "53", "Meurthe-et-Moselle": "54", "Meuse": "55", "Morbihan": "56",
  "Moselle": "57", "Nièvre": "58", "Nord": "59", "Oise": "60",
  "Orne": "61", "Pas-de-Calais": "62", "Puy-de-Dôme": "63", "Pyrénées-Atlantiques": "64",
  "Hautes-Pyrénées": "65", "Pyrénées-Orientales": "66", "Bas-Rhin": "67", "Haut-Rhin": "68",
  "Rhône": "69", "Haute-Saône": "70", "Saône-et-Loire": "71", "Sarthe": "72",
  "Savoie": "73", "Haute-Savoie": "74", "Paris": "75", "Seine-Maritime": "76",
  "Seine-et-Marne": "77", "Yvelines": "78", "Deux-Sèvres": "79", "Somme": "80",
  "Tarn": "81", "Tarn-et-Garonne": "82", "Var": "83", "Vaucluse": "84",
  "Vendée": "85", "Vienne": "86", "Haute-Vienne": "87", "Vosges": "88",
  "Yonne": "89", "Territoire de Belfort": "90", "Essonne": "91", "Hauts-de-Seine": "92",
  "Seine-Saint-Denis": "93", "Val-de-Marne": "94", "Val-d'Oise": "95"
};

// ============================================================
// 2️⃣ Fonctions utilitaires
// ============================================================

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const safeDivide = (a, b) => (b ? a / b : 0);
const computeViability = (prixM2, refM2) => {
  if (!prixM2 || !refM2) return 0;
  const ratio = prixM2 / refM2;
  const score = 10 - (ratio - 1) * 10;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
};

// ============================================================
// 3️⃣ Prix médian par département (Etalab DVF)
// ============================================================

async function getMedian(codeDep) {
  try {
    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/demandes-de-valeurs-foncieres/records?where=code_departement="${codeDep}" and valeur_fonciere>20000 and surface_reelle_bati>10&limit=200`;
    const r = await fetch(url);
    const data = await r.json();
    const prixM2 = data.results
      .map(r => r.valeur_fonciere / r.surface_reelle_bati)
      .filter(Boolean)
      .sort((a, b) => a - b);
    return Math.round(prixM2[Math.floor(prixM2.length / 2)]) || 3000;
  } catch {
    return 3000;
  }
}

// ============================================================
// 4️⃣ Récupération des annonces LeBonCoin (via RapidAPI)
// ============================================================

async function fetchLeBonCoin(depName) {
  try {
    const query = encodeURIComponent(`immobilier à vendre ${depName}`);
    const url = `https://leboncoin1.p.rapidapi.com/v2/leboncoin/search?query=${query}`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPID_KEY,
        "x-rapidapi-host": "leboncoin1.p.rapidapi.com"
      }
    });

    const json = await res.json();
    if (!json || !json.data) return [];

    return json.data
      .filter(a => a.price && a.surface && a.link)
      .map(a => ({
        titre: a.title || "Annonce LeBonCoin",
        departement: depName,
        prix: a.price,
        surface: a.surface,
        prixM2: Math.round(safeDivide(a.price, a.surface)),
        ville: a.location || "",
        lien: a.link,
        source: "LeBonCoin"
      }));
  } catch (err) {
    console.warn("⚠️ Erreur LBC:", err.message);
    return [];
  }
}

// ============================================================
// 5️⃣ Gestion du handler principal
// ============================================================

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Rhône";
    const codeDep = DEPARTEMENTS_CODES[departement] || "69";

    // Cache 1 heure
    const key = `lbc_${codeDep}`;
    if (cache.has(key) && Date.now() - cache.get(key).time < 3600 * 1000)
      return res.status(200).json(cache.get(key).data);

    // Appels parallèles
    const [median, annonces] = await Promise.all([
      getMedian(codeDep),
      fetchLeBonCoin(departement)
    ]);

    if (!annonces.length) throw new Error("Aucune annonce trouvée sur LeBonCoin");

    const enrichies = annonces
      .map(a => ({
        ...a,
        viabilite: computeViability(a.prixM2, median)
      }))
      .sort((a, b) => b.viabilite - a.viabilite)
      .slice(0, 50);

    const payload = { medianRef: median, annonces: enrichies };
    cache.set(key, { data: payload, time: Date.now() });

    res.status(200).json(payload);
  } catch (err) {
    console.error("❌ /api/scrape error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}
