// /api/scrape.js
// =============================================================
// 🏡 Scraper immobilier fiable
// Sources : Bien’ici + Etalab DVF (prix marché) + fallback PAP.fr
// =============================================================

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
  "Hautes-Pyrénées": "65", "Pyrénées-Orientales": "66", "Bas-Rhin": "67",
  "Haut-Rhin": "68", "Rhône": "69", "Haute-Saône": "70", "Saône-et-Loire": "71",
  "Sarthe": "72", "Savoie": "73", "Haute-Savoie": "74", "Paris": "75",
  "Seine-Maritime": "76", "Seine-et-Marne": "77", "Yvelines": "78",
  "Deux-Sèvres": "79", "Somme": "80", "Tarn": "81", "Tarn-et-Garonne": "82",
  "Var": "83", "Vaucluse": "84", "Vendée": "85", "Vienne": "86", "Haute-Vienne": "87",
  "Vosges": "88", "Yonne": "89", "Territoire de Belfort": "90", "Essonne": "91",
  "Hauts-de-Seine": "92", "Seine-Saint-Denis": "93", "Val-de-Marne": "94",
  "Val-d'Oise": "95",
};

// Utilitaires
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const safeDivide = (a, b) => (b ? a / b : 0);

// Calcul viabilité basé sur écart au prix marché
const computeViability = (prixM2, refM2) => {
  if (!prixM2 || !refM2) return 0;
  const ratio = prixM2 / refM2;
  const score = 10 - (ratio - 1) * 10;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
};

// Fonction pour récupérer le prix médian Etalab (via data.economie.gouv.fr)
async function getDVFMedian(departementCode) {
  try {
    const dvfUrl = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/demandes-de-valeurs-foncieres/records?where=code_departement="${departementCode}" and type_local="Appartement"&limit=100`;
    const res = await fetch(dvfUrl);
    const data = await res.json();
    const results = data.results || [];
    if (!results.length) return 3000;

    const prixM2 = results
      .filter((r) => r.valeur_fonciere && r.surface_reelle_bati)
      .map((r) => r.valeur_fonciere / r.surface_reelle_bati)
      .sort((a, b) => a - b);

    const median = Math.round(prixM2[Math.floor(prixM2.length / 2)]);
    return median || 3000;
  } catch (err) {
    console.warn("⚠️ Erreur DVF:", err.message);
    return 3000;
  }
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const departement = url.searchParams.get("departement") || "Rhône";
    const prixMin = Number(url.searchParams.get("prixMin") || 0);
    const prixMax = Number(url.searchParams.get("prixMax") || 10000000);
    const codeDep = DEPARTEMENTS_CODES[departement] || "69";

    // 1️⃣ Prix médian marché Etalab
    const medianRef = await getDVFMedian(codeDep);
    console.log(`📊 Prix médian Etalab ${departement} (${codeDep}) = ${medianRef} €/m²`);

    let annonces = [];

    // 2️⃣ Source principale : Bien’ici
    try {
      const filters = {
        size: 40,
        from: 0,
        transactionType: "buy",
        propertyType: ["house", "apartment"],
        filterType: "departement",
        filters: {
          location: { departmentCode: codeDep },
          price: { min: prixMin, max: prixMax },
        },
      };

      const apiUrl = `https://www.bienici.com/realEstateAds.json?filters=${encodeURIComponent(
        JSON.stringify(filters)
      )}`;

      const r = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://www.bienici.com",
        },
      });

      const json = await r.json();

      if (Array.isArray(json.realEstateAds)) {
        annonces = json.realEstateAds.map((a) => {
          const prixM2 = safeDivide(a.price, a.surface);
          return {
            titre: a.title || `${a.propertyTypeLabel} à ${a.city}`,
            departement,
            prix: a.price,
            surface: a.surface,
            prixM2: Math.round(prixM2),
            viabilite: computeViability(prixM2, medianRef),
            lien: `https://www.bienici.com/annonce/${a.id}`,
            source: "Bienici",
          };
        });
      }
    } catch (err) {
      console.warn("⚠️ Erreur Bienici:", err.message);
    }

    // 3️⃣ Fallback : si Bienici vide → tentative PAP
    if (!annonces.length) {
      console.log(`📉 Aucune donnée Bienici → tentative PAP.fr`);
      const papUrl = `https://www.pap.fr/api/annonce/search?typesbien=appartement,maison&transaction=vente&departement=${codeDep}`;
      const papRes = await fetch(papUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      const papText = await papRes.text();

      try {
        const papJson = JSON.parse(papText);
        if (Array.isArray(papJson.annonces)) {
          annonces = papJson.annonces.map((a) => {
            const prixM2 = safeDivide(a.prix, a.surface);
            return {
              titre: a.titre || `${a.titreAnnonce} à ${a.ville}`,
              departement,
              prix: a.prix,
              surface: a.surface,
              prixM2: Math.round(prixM2),
              viabilite: computeViability(prixM2, medianRef),
              lien: `https://www.pap.fr/annonce/${a.id}`,
              source: "PAP",
            };
          });
        }
      } catch {
        console.warn("⚠️ PAP a renvoyé du HTML (probablement bloqué sans proxy).");
      }
    }

    // 4️⃣ Nettoyage & sortie
    const clean = annonces
      .filter((a) => a.prix > 0 && a.surface > 0)
      .sort((a, b) => b.viabilite - a.viabilite)
      .slice(0, 40);

    if (!clean.length)
      throw new Error(`Aucune annonce trouvée sur Bienici ni PAP pour ${departement}.`);

    res.status(200).json({ medianRef, annonces: clean });
  } catch (err) {
    console.error("❌ /api/scrape error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}
