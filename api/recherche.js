// api/recherche.js
// ==========================================================
// 🏡 Recherche Immo – Bing Web Search + DVF Etalab (+ OpenAI si dispo)
// Compatible Vercel serverless (ESM) sans scraping lourd.
// ==========================================================

import OpenAI from "openai";

// fetch dynamique compatible Vercel / Node 18+
const fetchFn = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const cache = new Map();

// --- Bing search ---
const BING_KEY = process.env.BING_SEARCH_KEY;
const BING_ENDPOINT = (process.env.BING_ENDPOINT || "https://api.bing.microsoft.com").replace(/\/+$/, "");

// --- Codes départements France -> DVF ---
const DEPARTEMENTS_CODES = {
  Ain:"01",Aisne:"02",Allier:"03","Alpes-de-Haute-Provence":"04","Hautes-Alpes":"05","Alpes-Maritimes":"06",
  Ardèche:"07",Ardennes:"08",Ariège:"09",Aube:"10",Aude:"11",Aveyron:"12","Bouches-du-Rhône":"13",
  Calvados:"14",Cantal:"15",Charente:"16","Charente-Maritime":"17",Cher:"18","Corrèze":"19","Corse-du-Sud":"2A",
  "Haute-Corse":"2B","Côte-d'Or":"21","Côtes-d'Armor":"22",Creuse:"23",Dordogne:"24",Doubs:"25","Drôme":"26",
  Eure:"27","Eure-et-Loir":"28","Finistère":"29",Gard:"30","Haute-Garonne":"31",Gers:"32",Gironde:"33",
  Hérault:"34","Ille-et-Vilaine":"35",Indre:"36","Indre-et-Loire":"37","Isère":"38",Jura:"39",Landes:"40",
  "Loir-et-Cher":"41",Loire:"42","Haute-Loire":"43","Loire-Atlantique":"44",Loiret:"45",Lot:"46",
  "Lot-et-Garonne":"47","Lozère":"48","Maine-et-Loire":"49",Manche:"50",Marne:"51","Haute-Marne":"52",
  Mayenne:"53","Meurthe-et-Moselle":"54",Meuse:"55",Morbihan:"56",Moselle:"57",Nièvre:"58",Nord:"59",
  Oise:"60",Orne:"61","Pas-de-Calais":"62","Puy-de-Dôme":"63","Pyrénées-Atlantiques":"64","Hautes-Pyrénées":"65",
  "Pyrénées-Orientales":"66","Bas-Rhin":"67","Haut-Rhin":"68","Rhône":"69","Haute-Saône":"70","Saône-et-Loire":"71",
  Sarthe:"72",Savoie:"73","Haute-Savoie":"74",Paris:"75","Seine-Maritime":"76","Seine-et-Marne":"77",
  Yvelines:"78","Deux-Sèvres":"79",Somme:"80",Tarn:"81","Tarn-et-Garonne":"82",Var:"83",Vaucluse:"84",
  Vendée:"85",Vienne:"86","Haute-Vienne":"87",Vosges:"88",Yonne:"89","Territoire de Belfort":"90",
  Essonne:"91","Hauts-de-Seine":"92","Seine-Saint-Denis":"93","Val-de-Marne":"94","Val-d'Oise":"95"
};

// --- Utils ---
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const safeDivide = (a, b) => (b ? a / b : 0);
const round = (n) => Math.round(Number(n) || 0);

const computeViability = (prixM2, refM2) => {
  if (!prixM2 || !refM2) return 0;
  const ratio = prixM2 / refM2; // 1.0 = prix marché
  const score = 10 - (ratio - 1) * 10; // -10 pts par +100% vs marché, +10 pts par -100%
  return Math.round(clamp(score, 0, 10) * 10) / 10;
};

// --- DVF (médiane €/m² par département) ---
async function getMedian(codeDep) {
  try {
    const url =
      `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/` +
      `demandes-de-valeurs-foncieres/records?where=code_departement="${codeDep}" ` +
      `and valeur_fonciere>20000 and surface_reelle_bati>10&limit=500`;
    const r = await fetchFn(url);
    const data = await r.json();
    const prixM2 = (data.results || [])
      .map((it) =>
        it.valeur_fonciere && it.surface_reelle_bati
          ? it.valeur_fonciere / it.surface_reelle_bati
          : null
      )
      .filter(Boolean)
      .sort((a, b) => a - b);
    if (!prixM2.length) return 3000;
    return Math.round(prixM2[Math.floor(prixM2.length / 2)]) || 3000;
  } catch {
    return 3000;
  }
}

// --- Mapping sites -> domaines pour filtrer Bing ---
const SITE_DOMAINS = {
  seloger: ["seloger.com"],
  leboncoin: ["leboncoin.fr"],
  bienici: ["bienici.com"],
  pap: ["pap.fr"],
  "logic-immo": ["logic-immo.com"],
};

function buildQuery({ departement, site, prixMin, prixMax, piecesMin, piecesMax, surfaceMin, terrain, chauffage, travaux }) {
  const tokens = [];
  const domains = SITE_DOMAINS[site] || [];
  if (domains.length) tokens.push(domains.map((d) => `site:${d}`).join(" OR "));
  tokens.push(`"${departement}"`);

  if (prixMin) tokens.push(`prix >= ${prixMin}`);
  if (prixMax) tokens.push(`prix <= ${prixMax}`);
  if (piecesMin || piecesMax) tokens.push(`${piecesMin || 1}-${piecesMax || ""} pièces`);
  if (surfaceMin) tokens.push(`${surfaceMin}m² minimum`);

  if (terrain === "oui") tokens.push("(terrain OR parcelle)");
  if (terrain === "non") tokens.push("-terrain");

  if (chauffage && chauffage !== "indifférent") {
    const label = { gaz: "gaz", elec: "électrique", bois: "bois", pac: "\"pompe à chaleur\"" }[chauffage] || chauffage;
    tokens.push(`(${label})`);
  }

  if (travaux === "oui") tokens.push("(travaux OR à rénover OR rafraîchir)");
  if (travaux === "non") tokens.push("-(travaux OR rénover)");

  tokens.push("(vente OR à vendre) -location -louer"); // éviter la location

  return tokens.join(" ");
}

async function bingSearch(query, limit = 8) {
  if (!BING_KEY) throw new Error("BING_SEARCH_KEY manquant");
  const url = new URL(`${BING_ENDPOINT}/v7.0/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(limit));
  url.searchParams.set("responseFilter", "Webpages");

  const r = await fetchFn(url.toString(), {
    headers: {
      "Ocp-Apim-Subscription-Key": BING_KEY,
      Accept: "application/json",
    },
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Bing error ${r.status}: ${t}`);
  }

  const json = await r.json();
  const items = json.webPages?.value || [];
  return items.map((it) => ({ title: it.name, url: it.url, snippet: it.snippet }));
}

async function fetchHtml(url) {
  try {
    const r = await fetchFn(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ImmoBot/1.0)" },
    });
    return (await r.text()).slice(0, 120000);
  } catch {
    return "";
  }
}

async function extractWithOpenAI(html, fallback) {
  if (!client || !html) return null;

  const sys = `Tu es un extracteur JSON strict pour annonces immobilières en France.
Retourne UNIQUEMENT un objet JSON avec ces clés exactes:
{
  "titre": string,
  "ville": string,
  "prix": number,
  "surface": number,
  "lien": string,
  "source": string
}
Ne mets pas d'autres champs.`;

  const user = `HTML (peut être tronqué) :
${html}

Rappels:
- "prix": entier en euros (245000)
- "surface": nombre en m2 (52)
- "ville": court (ex: Lyon 7)
- "source": nom du site (SeLoger, LeBonCoin, BienIci, PAP, Logic-Immo)
- "lien": si absent dans HTML, prends "${fallback?.url || ""}"`;

  try {
    const resp = await client.chat.completions.create({
      // Choisis un modèle qui existe vraiment sur ton compte (ex: "gpt-4o-mini" ou "gpt-4o")
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    });

    const txt = resp.choices?.[0]?.message?.content?.trim() || "";
    const s = txt.indexOf("{");
    const e = txt.lastIndexOf("}");
    if (s < 0 || e < 0) return null;
    const raw = JSON.parse(txt.slice(s, e + 1));

    const prix =
      typeof raw.prix === "number"
        ? raw.prix
        : Number(String(raw.prix || "").replace(/[^0-9]/g, "")) || null;

    const surface =
      typeof raw.surface === "number"
        ? raw.surface
        : Number(String(raw.surface || "").replace(/[^0-9.,]/g, "").replace(",", ".")) || null;

    return {
      titre: raw.titre || fallback?.title || "Annonce",
      ville: raw.ville || null,
      prix,
      surface,
      lien: raw.lien || fallback?.url || "",
      source: raw.source || fallback?.source || "",
    };
  } catch {
    return null;
  }
}

// --- Handler principal ---
export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const qp = Object.fromEntries(url.searchParams.entries());

    const departement = qp.departement || "Rhône";
    const site = qp.site || "seloger";
    const prixMin = Number(qp.prixMin || 20000);
    const prixMax = Number(qp.prixMax || 800000);
    const piecesMin = Number(qp.piecesMin || 1);
    const piecesMax = Number(qp.piecesMax || 8);
    const surfaceMin = Number(qp.surfaceMin || 20);
    const terrain = qp.terrain || "indifférent";
    const chauffage = qp.chauffage || "indifférent";
    const travaux = qp.travaux || "indifférent";

    const ckey = JSON.stringify({ departement, site, prixMin, prixMax, piecesMin, piecesMax, surfaceMin, terrain, chauffage, travaux });
    const cached = cache.get(ckey);
    if (cached && Date.now() - cached.time < 5 * 60 * 1000) {
      return res.status(200).json(cached.payload);
    }

    const codeDep = DEPARTEMENTS_CODES[departement] || "69";
    const medianRef = await getMedian(codeDep);

    const query = buildQuery({ departement, site, prixMin, prixMax, piecesMin, piecesMax, surfaceMin, terrain, chauffage, travaux });
    const results = await bingSearch(query, 8);

    const extracted = [];
    for (const item of results.slice(0, 8)) {
      let e = null;

      if (client) {
        const html = await fetchHtml(item.url);
        e = await extractWithOpenAI(html, { url: item.url, title: item.title, source: site });
      }

      // Fallback si pas d'OpenAI ou extraction impossible
      if (!e) {
        e = {
          titre: item.title,
          ville: null,
          prix: null,
          surface: null,
          lien: item.url,
          source: site,
        };
      }

      if (e) {
        const prixM2 = e.prix && e.surface ? round(safeDivide(e.prix, e.surface)) : null;
        extracted.push({
          ...e,
          prixM2,
          prixM2_marche: medianRef,
          viabilite: prixM2 ? computeViability(prixM2, medianRef) : 0,
        });
      }
    }

    // Post-filtrage basique
    const annonces = extracted
      .filter((a) => (a.prix == null ? true : a.prix >= prixMin))
      .filter((a) => (a.prix == null ? true : a.prix <= prixMax))
      .filter((a) => (a.surface == null ? true : a.surface >= surfaceMin))
      .sort((a, b) => (b.viabilite ?? 0) - (a.viabilite ?? 0));

    const payload = { medianRef, annonces };
    cache.set(ckey, { time: Date.now(), payload });

    return res.status(200).json(payload);
  } catch (err) {
    console.error("❌ /api/recherche error:", err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
