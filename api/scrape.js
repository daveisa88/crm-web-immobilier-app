// /api/scrape.js
// =============================================================
// 🏡 Scraper immobilier complet (Bien’ici + Etalab DVF)
// Filtrage strict + fallback DVF réel si aucune annonce exploitable
// =============================================================

const cache = new Map();

const DEPARTEMENTS_CODES = {
  "Vosges": "88","Ain": "01","Aisne": "02","Allier": "03","Alpes-de-Haute-Provence": "04","Hautes-Alpes": "05",
  "Alpes-Maritimes": "06","Ardèche": "07","Ardennes": "08","Ariège": "09","Aube": "10","Aude": "11",
  "Aveyron": "12","Bouches-du-Rhône": "13","Calvados": "14","Cantal": "15","Charente": "16",
  "Charente-Maritime": "17","Cher": "18","Corrèze": "19","Corse-du-Sud": "2A","Haute-Corse": "2B",
  "Côte-d'Or": "21","Côtes-d'Armor": "22","Creuse": "23","Dordogne": "24","Doubs": "25","Drôme": "26",
  "Eure": "27","Eure-et-Loir": "28","Finistère": "29","Gard": "30","Haute-Garonne": "31","Gers": "32",
  "Gironde": "33","Hérault": "34","Ille-et-Vilaine": "35","Indre": "36","Indre-et-Loire": "37",
  "Isère": "38","Jura": "39","Landes": "40","Loir-et-Cher": "41","Loire": "42","Haute-Loire": "43",
  "Loire-Atlantique": "44","Loiret": "45","Lot": "46","Lot-et-Garonne": "47","Lozère": "48",
  "Maine-et-Loire": "49","Manche": "50","Marne": "51","Haute-Marne": "52","Mayenne": "53",
  "Meurthe-et-Moselle": "54","Meuse": "55","Morbihan": "56","Moselle": "57","Nièvre": "58",
  "Nord": "59","Oise": "60","Orne": "61","Pas-de-Calais": "62","Puy-de-Dôme": "63",
  "Pyrénées-Atlantiques": "64","Hautes-Pyrénées": "65","Pyrénées-Orientales": "66","Bas-Rhin": "67",
  "Haut-Rhin": "68","Rhône": "69","Haute-Saône": "70","Saône-et-Loire": "71","Sarthe": "72",
  "Savoie": "73","Haute-Savoie": "74","Paris": "75","Seine-Maritime": "76","Seine-et-Marne": "77",
  "Yvelines": "78","Var": "83","Vaucluse": "84","Vienne": "86","Haute-Vienne": "87","Yonne": "89",
  "Territoire de Belfort": "90","Essonne": "91","Hauts-de-Seine": "92","Seine-Saint-Denis": "93",
  "Val-de-Marne": "94","Val-d'Oise": "95"
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const safeDivide = (a, b) => (b ? a / b : 0);
const computeViability = (prixM2, refM2) => {
  if (!prixM2 || !refM2) return 0;
  const ratio = prixM2 / refM2;
  const score = 10 - (ratio - 1) * 10;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
};

// ⚙️ Récupère le prix médian par département depuis Etalab (DVF)
async function getDVF(departementCode) {
  try {
    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/demandes-de-valeurs-foncieres/records?where=code_departement="${departementCode}" and valeur_fonciere>5000 and surface_reelle_bati>10&limit=100`;
    const r = await fetch(url);
    const data = await r.json();
    const results = data.results || [];
    const prixM2 = results.map((r) => r.valeur_fonciere / r.surface_reelle_bati).filter(Boolean).sort((a, b) => a - b);
    const median = Math.round(prixM2[Math.floor(prixM2.length / 2)]) || 3000;

    // On retourne un échantillon de données DVF lisibles
    const annonces = results.slice(0, 20).map((r) => {
      const prix = Math.round(r.valeur_fonciere);
      const surf = Math.round(r.surface_reelle_bati);
      const prixM2 = safeDivide(prix, surf);
      return {
        titre: `${r.type_local || "Bien"} à ${r.commune}`,
        departement: r.nom_departement || "—",
        prix,
        surface: surf,
        prixM2,
        viabilite: computeViability(prixM2, median),
        lien: `https://app.dvf.etalab.gouv.fr/transaction/${r.id_mutation}`,
        source: "Etalab DVF",
      };
    });
    return { median, annonces };
  } catch (err) {
    console.warn("⚠️ Erreur DVF:", err.message);
    return { median: 3000, annonces: [] };
  }
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Vosges";
    const prixMin = Number(url.searchParams.get("prixMin") || 0);
    const prixMax = Number(url.searchParams.get("prixMax") || 2000000);
    const codeDep = DEPARTEMENTS_CODES[departement] || "88";

    // Cache 1h
    const cacheKey = `${codeDep}_${prixMin}_${prixMax}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < 3600 * 1000)
      return res.status(200).json(cached.value);

    let annonces = [];

    // 1️⃣ Tente Bien’ici
    try {
      const filters = {
        size: 40,
        from: 0,
        transactionType: "buy",
        propertyType: ["house", "apartment"],
        filters: {
          location: { departmentCode: codeDep },
          price: { min: prixMin, max: prixMax },
        },
      };
      const apiUrl = `https://www.bienici.com/realEstateAds.json?filters=${encodeURIComponent(
        JSON.stringify(filters)
      )}`;

      const r = await fetch(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.bienici.com" },
      });
      const json = await r.json();

      if (Array.isArray(json.realEstateAds)) {
        annonces = json.realEstateAds
          .filter((a) => a.price && a.surface)
          .map((a) => {
            const prixM2 = safeDivide(a.price, a.surface);
            return {
              titre: a.title || `${a.propertyTypeLabel} à ${a.city}`,
              departement,
              prix: a.price,
              surface: a.surface,
              prixM2: Math.round(prixM2),
              viabilite: 0,
              lien: `https://www.bienici.com/annonce/${a.id}`,
              source: "Bienici",
            };
          });
      }
    } catch (e) {
      console.warn("⚠️ Bienici HS:", e.message);
    }

    // 2️⃣ Si aucune annonce Bien’ici valide, fallback DVF réel
    if (!annonces.length) {
      const { median, annonces: annoncesDVF } = await getDVF(codeDep);
      annonces = annoncesDVF;
      console.log(`📊 Fallback DVF pour ${departement} : ${annonces.length} ventes réelles`);
      const payload = { medianRef: median, annonces };
      cache.set(cacheKey, { value: payload, time: Date.now() });
      return res.status(200).json(payload);
    }

    // 3️⃣ Si Bien’ici OK → calcul viabilité par rapport DVF
    const { median } = await getDVF(codeDep);
    annonces = annonces.map((a) => ({
      ...a,
      viabilite: computeViability(a.prixM2, median),
    }));

    const payload = { medianRef: median, annonces: annonces.slice(0, 40) };
    cache.set(cacheKey, { value: payload, time: Date.now() });
    res.status(200).json(payload);
  } catch (err) {
    console.error("❌ /api/scrape error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}
