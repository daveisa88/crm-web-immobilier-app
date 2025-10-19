// /api/scrape.js
import fetch from "node-fetch";

// ================= CONFIG APIFY =================
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_SELOGER_ACTOR_ID = process.env.APIFY_SELOGER_ACTOR_ID || "lexis-solutions/seloger-scraper";
const APIFY_BIENICI_ACTOR_ID = process.env.APIFY_BIENICI_ACTOR_ID || "qpayre/bien-ici-scraper";

// ================= DEPARTEMENTS =================
const DEPARTEMENTS_CODES = {
  "Ain": "01", "Aisne": "02", "Allier": "03", "Alpes-de-Haute-Provence": "04",
  "Hautes-Alpes": "05", "Alpes-Maritimes": "06", "Ardèche": "07", "Ardennes": "08",
  "Ariège": "09", "Aube": "10", "Aude": "11", "Aveyron": "12", "Bouches-du-Rhône": "13",
  "Calvados": "14", "Cantal": "15", "Charente": "16", "Charente-Maritime": "17",
  "Cher": "18", "Corrèze": "19", "Corse-du-Sud": "2A", "Haute-Corse": "2B",
  "Côte-d'Or": "21", "Côtes-d'Armor": "22", "Creuse": "23", "Dordogne": "24",
  "Doubs": "25", "Drôme": "26", "Eure": "27", "Eure-et-Loir": "28", "Finistère": "29",
  "Gard": "30", "Haute-Garonne": "31", "Gers": "32", "Gironde": "33", "Hérault": "34",
  "Ille-et-Vilaine": "35", "Indre": "36", "Indre-et-Loire": "37", "Isère": "38",
  "Jura": "39", "Landes": "40", "Loir-et-Cher": "41", "Loire": "42", "Haute-Loire": "43",
  "Loire-Atlantique": "44", "Loiret": "45", "Lot": "46", "Lot-et-Garonne": "47",
  "Lozère": "48", "Maine-et-Loire": "49", "Manche": "50", "Marne": "51",
  "Haute-Marne": "52", "Mayenne": "53", "Meurthe-et-Moselle": "54", "Meuse": "55",
  "Morbihan": "56", "Moselle": "57", "Nièvre": "58", "Nord": "59", "Oise": "60",
  "Orne": "61", "Pas-de-Calais": "62", "Puy-de-Dôme": "63", "Pyrénées-Atlantiques": "64",
  "Hautes-Pyrénées": "65", "Pyrénées-Orientales": "66", "Bas-Rhin": "67", "Haut-Rhin": "68",
  "Rhône": "69", "Haute-Saône": "70", "Saône-et-Loire": "71", "Sarthe": "72",
  "Savoie": "73", "Haute-Savoie": "74", "Paris": "75", "Seine-Maritime": "76",
  "Seine-et-Marne": "77", "Yvelines": "78", "Deux-Sèvres": "79", "Somme": "80",
  "Tarn": "81", "Tarn-et-Garonne": "82", "Var": "83", "Vaucluse": "84", "Vendée": "85",
  "Vienne": "86", "Haute-Vienne": "87", "Vosges": "88", "Yonne": "89",
  "Territoire de Belfort": "90", "Essonne": "91", "Hauts-de-Seine": "92",
  "Seine-Saint-Denis": "93", "Val-de-Marne": "94", "Val-d'Oise": "95"
};

// ================= UTILITAIRES =================
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const computeViability = (prixM2, refM2) => {
  if (!prixM2 || !refM2) return 0;
  const ratio = prixM2 / refM2;
  const score = 10 - (ratio - 1) * 10;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
};

// ================= API HANDLER =================
export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Rhône";
    const provider = url.searchParams.get("provider") || "seloger";
    const codeDep = DEPARTEMENTS_CODES[departement] || "69";

    // 1️⃣ Prix médian marché DVF
    const median = await getMedian(codeDep);

    // 2️⃣ Récup annonces Apify
    const annonces = await fetchApify(provider, departement, codeDep);

    // 3️⃣ Score viabilité
    const enrichies = annonces.map(a => ({
      ...a,
      viabilite: computeViability(a.prixM2, median)
    }));

    return res.status(200).json({
      medianRef: median,
      annonces: enrichies.sort((a, b) => b.viabilite - a.viabilite)
    });
  } catch (err) {
    console.error("❌ /api/scrape error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}

// ================= DVF =================
async function getMedian(codeDep) {
  const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/demandes-de-valeurs-foncieres/records?where=code_departement="${codeDep}" and valeur_fonciere>20000 and surface_reelle_bati>10&limit=500`;
  const r = await fetch(url);
  const data = await r.json();
  const prixM2 = data.results
    .map(r => r.valeur_fonciere / r.surface_reelle_bati)
    .filter(Boolean)
    .sort((a, b) => a - b);
  return Math.round(prixM2[Math.floor(prixM2.length / 2)]) || 3000;
}

// ================= APIFY =================
async function fetchApify(provider, departement, codeDep) {
  const token = APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN manquant");

  const actorId = provider === "bienici" ? APIFY_BIENICI_ACTOR_ID : APIFY_SELOGER_ACTOR_ID;
  const runUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`;

  const input = {
    search: departement,
    departementCode: codeDep,
    transactionType: "vente",
    maxItems: 20
  };

  const run = await fetch(runUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input })
  });
  const runData = await run.json();
  const runId = runData.data?.id;

  // Attente de complétion
  let datasetId;
  const start = Date.now();
  while (!datasetId) {
    await new Promise(r => setTimeout(r, 1500));
    const st = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
    const json = await st.json();
    if (json.data?.status === "SUCCEEDED") {
      datasetId = json.data.defaultDatasetId;
      break;
    }
    if (Date.now() - start > 120000) throw new Error("Timeout Apify");
  }

  // Lecture dataset
  const dsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`;
  const items = await fetch(dsUrl).then(r => r.json());

  return items
    .filter(x => x.price && x.surface)
    .map(x => ({
      titre: x.title || "Annonce",
      ville: x.city || "",
      prix: x.price,
      surface: x.surface,
      prixM2: Math.round(x.price / x.surface),
      lien: x.url,
      source: provider
    }));
}
