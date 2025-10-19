// /api/listings.js
import fetch from "node-fetch";

const CACHE = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

const DEPARTEMENTS_CODES = {
  "Rhône": "69", "Ain": "01", "Aisne": "02", "Allier": "03", "Alpes-Maritimes": "06",
  "Gironde": "33", "Nord": "59", "Pas-de-Calais": "62", "Paris": "75", "Var": "83",
  "Hauts-de-Seine": "92", "Seine-Saint-Denis": "93", "Val-de-Marne": "94", "Val-d'Oise": "95"
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const computeViability = (prixM2, refM2) => {
  if (!prixM2 || !refM2) return 0;
  const ratio = prixM2 / refM2;
  const score = 10 - (ratio - 1) * 10;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
};

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Rhône";
    const provider = url.searchParams.get("provider") || "seloger";

    const codeDep = DEPARTEMENTS_CODES[departement] || "69";
    const cacheKey = `${provider}_${codeDep}`;
    const hit = CACHE.get(cacheKey);
    if (hit && Date.now() - hit.time < CACHE_TTL_MS) {
      return res.status(200).json(hit.data);
    }

    const median = await getMedianDVF(codeDep);
    const annonces = await fetchFromApify(provider, departement, codeDep);

    const enrichies = annonces.map(a => ({
      ...a,
      viabilite: computeViability(a.prixM2, median)
    }));

    const payload = {
      medianRef: median,
      annonces: enrichies.sort((a, b) => b.viabilite - a.viabilite)
    };

    CACHE.set(cacheKey, { data: payload, time: Date.now() });
    res.status(200).json(payload);
  } catch (err) {
    console.error("❌ /api/listings error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}

// === APIFY ===
async function fetchFromApify(provider, departement, codeDep) {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("Missing APIFY_TOKEN");

  const actorId =
    provider === "bienici"
      ? process.env.APIFY_BIENICI_ACTOR_ID
      : process.env.APIFY_SELOGER_ACTOR_ID;

  const url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`;
  const input = {
    search: departement,
    departementCode: codeDep,
    transactionType: "vente",
    maxItems: 10
  };

  const runRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input })
  });
  if (!runRes.ok) throw new Error(`Apify run start failed (${runRes.status})`);

  const run = await runRes.json();
  const runId = run.data?.id;
  let datasetId = run.data?.defaultDatasetId;

  const start = Date.now();
  while (!datasetId) {
    await new Promise(r => setTimeout(r, 1500));
    const st = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const stJson = await st.json();
    if (stJson.data?.status === "SUCCEEDED") {
      datasetId = stJson.data?.defaultDatasetId;
      break;
    }
    if (Date.now() - start > 120000) throw new Error("Apify run timeout");
  }

  const dsUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`;
  const dsRes = await fetch(dsUrl, { headers: { Authorization: `Bearer ${token}` } });
  const items = await dsRes.json();

  return items
    .filter(a => a.price && a.surface)
    .map(a => ({
      titre: a.title || "Annonce",
      ville: a.city || "",
      prix: a.price,
      surface: a.surface,
      prixM2: Math.round(a.price / a.surface),
      lien: a.url || "#",
      source: provider
    }));
}

// === DVF ===
async function getMedianDVF(codeDep) {
  const base = "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/demandes-de-valeurs-foncieres/records";
  const where = encodeURIComponent(`code_departement="${codeDep}" and valeur_fonciere>20000 and surface_reelle_bati>10`);
  const url = `${base}?where=${where}&limit=1000`;

  const r = await fetch(url);
  const data = await r.json();
  const prixM2 = data.results
    .map(x => x.valeur_fonciere / x.surface_reelle_bati)
    .filter(Boolean)
    .sort((a, b) => a - b);

  return Math.round(prixM2[Math.floor(prixM2.length / 2)]) || 3000;
}
