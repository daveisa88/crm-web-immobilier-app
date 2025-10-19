// =============================================
// Scraper Immo Pro – Listings (Apify) + Prix (DVF)
// Tech: Next.js (app/pages), TypeScript optional (here: JS), CSR+SSR safe
// Files in one doc. Copy into your Next.js project structure.
// =============================================

/* =========================================================
   1) pages/api/listings.js
   ---------------------------------------------------------
   Aggregates:
   - Live listings via Apify Actors (e.g., SeLoger or Bien'ici scrapers)
   - Market medians via Etalab DVF open API
   Notes:
   - Compliant: uses 3rd‑party scraping platforms (Apify) with their ToS.
   - Robust: async run + polling (avoids 300s sync timeout), in‑memory cache.
   - Configure through environment variables (see bottom of file).
========================================================= */

// pages/api/listings.js
export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Rhône";
    const provider = url.searchParams.get("provider") || process.env.DEFAULT_PROVIDER || "seloger"; // "seloger" | "bienici"
    const type = url.searchParams.get("type") || "vente"; // vente | location (if provider supports)
    const minPrice = parseInt(url.searchParams.get("min")) || 0;
    const maxPrice = parseInt(url.searchParams.get("max")) || 0;
    const roomsMin = parseInt(url.searchParams.get("piecesMin")) || 0;

    // --- Map departement name -> code (fallback to Rhône=69) ---
    const codeDep = DEPARTEMENTS_CODES[departement] || "69";

    // --- Cache key ---
    const cacheKey = `${provider}_${codeDep}_${type}_${minPrice}_${maxPrice}_${roomsMin}`;
    const hit = CACHE.get(cacheKey);
    if (hit && Date.now() - hit.time < CACHE_TTL_MS) {
      return res.status(200).json(hit.data);
    }

    // === Parallel fetch: DVF median + Listings (Apify) ===
    const [medianRef, annonces] = await Promise.all([
      getDvfMedianEuroM2(codeDep),
      fetchListingsFromApify({ provider, departement, codeDep, type, minPrice, maxPrice, roomsMin })
    ]);

    // Enrich + score
    const enriched = (annonces || []).map(a => ({
      ...a,
      prixM2: a.prix && a.surface ? Math.round(a.prix / a.surface) : null,
      viabilite: a.prix && a.surface && medianRef ? computeViability(Math.round(a.prix / a.surface), medianRef) : null,
    }));

    const payload = {
      departement,
      codeDep,
      medianRef,
      provider,
      count: enriched.length,
      annonces: enriched.sort((a,b) => (b.viabilite ?? 0) - (a.viabilite ?? 0))
    };

    CACHE.set(cacheKey, { time: Date.now(), data: payload });
    return res.status(200).json(payload);
  } catch (err) {
    console.error("/api/listings error", err);
    return res.status(500).json({ error: true, message: err.message });
  }
}

// ---------------- In‑memory cache ----------------
const CACHE = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

// ---------------- Departments ----------------
const DEPARTEMENTS_CODES = {
  "Ain":"01","Aisne":"02","Allier":"03","Alpes-de-Haute-Provence":"04","Hautes-Alpes":"05","Alpes-Maritimes":"06","Ardèche":"07","Ardennes":"08","Ariège":"09","Aube":"10","Aude":"11","Aveyron":"12","Bouches-du-Rhône":"13","Calvados":"14","Cantal":"15","Charente":"16","Charente-Maritime":"17","Cher":"18","Corrèze":"19","Corse-du-Sud":"2A","Haute-Corse":"2B","Côte-d'Or":"21","Côtes-d'Armor":"22","Creuse":"23","Dordogne":"24","Doubs":"25","Drôme":"26","Eure":"27","Eure-et-Loir":"28","Finistère":"29","Gard":"30","Haute-Garonne":"31","Gers":"32","Gironde":"33","Hérault":"34","Ille-et-Vilaine":"35","Indre":"36","Indre-et-Loire":"37","Isère":"38","Jura":"39","Landes":"40","Loir-et-Cher":"41","Loire":"42","Haute-Loire":"43","Loire-Atlantique":"44","Loiret":"45","Lot":"46","Lot-et-Garonne":"47","Lozère":"48","Maine-et-Loire":"49","Manche":"50","Marne":"51","Haute-Marne":"52","Mayenne":"53","Meurthe-et-Moselle":"54","Meuse":"55","Morbihan":"56","Moselle":"57","Nièvre":"58","Nord":"59","Oise":"60","Orne":"61","Pas-de-Calais":"62","Puy-de-Dôme":"63","Pyrénées-Atlantiques":"64","Hautes-Pyrénées":"65","Pyrénées-Orientales":"66","Bas-Rhin":"67","Haut-Rhin":"68","Rhône":"69","Haute-Saône":"70","Saône-et-Loire":"71","Sarthe":"72","Savoie":"73","Haute-Savoie":"74","Paris":"75","Seine-Maritime":"76","Seine-et-Marne":"77","Yvelines":"78","Deux-Sèvres":"79","Somme":"80","Tarn":"81","Tarn-et-Garonne":"82","Var":"83","Vaucluse":"84","Vendée":"85","Vienne":"86","Haute-Vienne":"87","Vosges":"88","Yonne":"89","Territoire de Belfort":"90","Essonne":"91","Hauts-de-Seine":"92","Seine-Saint-Denis":"93","Val-de-Marne":"94","Val-d'Oise":"95"
};

// ---------------- Helpers ----------------
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const computeViability = (prixM2, refM2) => {
  if (!prixM2 || !refM2) return 0;
  const ratio = prixM2 / refM2; // 1.0 = dans le marché
  const score = 10 - (ratio - 1) * 10; // 10 si -inf, 0 si ≥ 2x ref
  return Math.round(clamp(score, 0, 10) * 10) / 10;
};

// ---------------- DVF median (Etalab) ----------------
async function getDvfMedianEuroM2(codeDep) {
  // Public API (CKAN v2.1 Explore): filter by departement, exclude small/invalid records
  const base = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/demandes-de-valeurs-foncieres/records';
  const where = encodeURIComponent(`code_departement="${codeDep}" and valeur_fonciere>20000 and surface_reelle_bati>10 and (type_local="Maison" or type_local="Appartement")`);
  const url = `${base}?where=${where}&select=valeur_fonciere,surface_reelle_bati&type_local&limit=5000`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('DVF unreachable');
  const json = await r.json();
  const arr = (json.results || [])
    .map(x => x.valeur_fonciere && x.surface_reelle_bati ? (x.valeur_fonciere / x.surface_reelle_bati) : null)
    .filter(v => v && isFinite(v))
    .sort((a,b) => a - b);
  if (!arr.length) return null;
  const median = arr[Math.floor(arr.length / 2)];
  return Math.round(median);
}

// ---------------- Listings via Apify ----------------
async function fetchListingsFromApify({ provider, departement, codeDep, type, minPrice, maxPrice, roomsMin }) {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('Missing APIFY_TOKEN');

  // Configure input depending on provider. Prefer tasks for preset inputs.
  const taskId = provider === 'bienici' ? (process.env.APIFY_BIENICI_TASK_ID || '') : (process.env.APIFY_SELOGER_TASK_ID || '');
  const actorId = provider === 'bienici' ? (process.env.APIFY_BIENICI_ACTOR_ID || '') : (process.env.APIFY_SELOGER_ACTOR_ID || '');

  const input = buildApifyInput({ provider, departement, codeDep, type, minPrice, maxPrice, roomsMin });

  // Strategy: if TASK_ID is provided, run the task with overridden input; else run ACTOR directly.
  const runEndpoint = taskId
    ? `https://api.apify.com/v2/actor-tasks/${encodeURIComponent(taskId)}/runs`
    : `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs`;

  const runRes = await fetch(runEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input })
  });
  if (!runRes.ok) throw new Error(`Apify run start failed (${runRes.status})`);
  const run = await runRes.json();
  const runId = run.data?.id || run.id || run.runId || run.data?.id; // tolerate different shapes
  const datasetId = run.data?.defaultDatasetId;

  // If dataset already provided (rare), skip polling
  let dsId = datasetId;
  // Poll until SUCCEEDED
  const started = Date.now();
  while (!dsId) {
    await sleep(1500);
    const st = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const stJson = await st.json();
    const status = stJson.data?.status;
    if (status === 'SUCCEEDED') {
      dsId = stJson.data?.defaultDatasetId;
      break;
    }
    if (status === 'FAILED' || status === 'ABORTED' || Date.now() - started > 120000) {
      throw new Error(`Apify run ${status || 'TIMEOUT'}`);
    }
  }

  // Fetch dataset items (select useful fields if actor outputs many)
  const itemsUrl = `https://api.apify.com/v2/datasets/${dsId}/items?format=json`;
  const itemsRes = await fetch(itemsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!itemsRes.ok) throw new Error('Apify dataset fetch failed');
  const items = await itemsRes.json();

  // Normalize to unified schema
  return (items || []).map(normalizeItem(provider));
}

function buildApifyInput({ provider, departement, codeDep, type, minPrice, maxPrice, roomsMin }) {
  // Minimal inputs common to popular community actors (may vary by actor)
  const search = `${departement}`;
  const common = {
    search, // free text or location
    transactionType: type, // 'vente'/'location'
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minRooms: roomsMin || undefined,
    departementCode: codeDep
  };
  return common;
}

function normalizeItem(provider) {
  return function (row) {
    // Try to map known fields; leave fallbacks
    const title = row.title || row.titre || row.name || `${row.propertyType || 'Bien'} ${row.city || ''}`.trim();
    const price = Number(row.price || row.prix || row.priceEur || row.prix_eur || 0);
    const surface = Number(row.surface || row.surfaceHabitable || row.area || row.livingArea || 0);
    const url = row.url || row.link || row.detailUrl || row.permalink || '#';
    const city = row.city || row.ville || row.commune || row.locationLabel || '';
    const source = row.source || (provider === 'bienici' ? 'Bien’ici (Apify)' : 'SeLoger (Apify)');
    return { titre: title, ville: city, prix: price || null, surface: surface || null, lien: url, source };
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

