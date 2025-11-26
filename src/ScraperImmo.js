import React, { useMemo, useState, useCallback } from "react";

/* ==========================================================
   🔵 CLEAN STRING
   ========================================================== */
const clean = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "+")
    .replace(/'/g, "");

/* ==========================================================
   🔵 TABLE DÉPARTEMENTS (COMPLÈTE)
   ========================================================== */
const DEPARTEMENT_CP = {
  Ain: ["01"],
  Aisne: ["02"],
  Allier: ["03"],
  Alpes_de_Haute_Provence: ["04"],
  Hautes_Alpes: ["05"],
  Alpes_Maritimes: ["06"],
  Ardeche: ["07"],
  Ardennes: ["08"],
  Ariege: ["09"],
  Aube: ["10"],
  Aude: ["11"],
  Aveyron: ["12"],
  Bas_Rhin: ["67"],
  Haut_Rhin: ["68"],
  Bouches_du_Rhone: ["13"],
  Calvados: ["14"],
  Cantal: ["15"],
  Charente: ["16"],
  Charente_Maritime: ["17"],
  Cher: ["18"],
  Correze: ["19"],
  Corse_du_Sud: ["2A"],
  Haute_Corse: ["2B"],
  Cote_d_Or: ["21"],
  Cotes_d_Armor: ["22"],
  Creuse: ["23"],
  Deux_Sevres: ["79"],
  Dordogne: ["24"],
  Doubs: ["25"],
  Drome: ["26"],
  Eure: ["27"],
  Eure_et_Loir: ["28"],
  Finistere: ["29"],
  Gard: ["30"],
  Haute_Garonne: ["31"],
  Gers: ["32"],
  Gironde: ["33"],
  Herault: ["34"],
  Ille_et_Vilaine: ["35"],
  Indre: ["36"],
  Indre_et_Loire: ["37"],
  Isere: ["38"],
  Jura: ["39"],
  Landes: ["40"],
  Loir_et_Cher: ["41"],
  Loire: ["42"],
  Haute_Loire: ["43"],
  Loire_Atlantique: ["44"],
  Loiret: ["45"],
  Lot: ["46"],
  Lot_et_Garonne: ["47"],
  Lozere: ["48"],
  Maine_et_Loire: ["49"],
  Manche: ["50"],
  Marne: ["51"],
  Haute_Marne: ["52"],
  Mayenne: ["53"],
  Meurthe_et_Moselle: ["54"],
  Meuse: ["55"],
  Morbihan: ["56"],
  Moselle: ["57"],
  Nievre: ["58"],
  Nord: ["59"],
  Oise: ["60"],
  Orne: ["61"],
  Pas_de_Calais: ["62"],
  Puy_de_Dome: ["63"],
  Pyrenees_Atlantiques: ["64"],
  Hautes_Pyrenees: ["65"],
  Pyrenees_Orientales: ["66"],
  Rhone: ["69"],
  Haute_Saone: ["70"],
  Saone_et_Loire: ["71"],
  Sarthe: ["72"],
  Savoie: ["73"],
  Haute_Savoie: ["74"],
  Paris: ["75"],
  Seine_Maritime: ["76"],
  Seine_et_Marne: ["77"],
  Yvelines: ["78"],
  Somme: ["80"],
  Tarn: ["81"],
  Tarn_et_Garonne: ["82"],
  Var: ["83"],
  Vaucluse: ["84"],
  Vendee: ["85"],
  Vienne: ["86"],
  Haute_Vienne: ["87"],
  Vosges: ["88"],
  Yonne: ["89"],
  Territoire_de_Belfort: ["90"],
  Essonne: ["91"],
  Hauts_de_Seine: ["92"],
  Seine_Saint_Denis: ["93"],
  Val_de_Marne: ["94"],
  Val_d_Oise: ["95"],
};

/* ==========================================================
   🔵 UI DES DÉPARTEMENTS (libellés jolis)
   ========================================================== */
const DEPARTEMENTS_UI = Object.fromEntries(
  Object.keys(DEPARTEMENT_CP).map((d) => [d, d.replace(/_/g, "-")])
);

/* ==========================================================
   🔵 COMPOSANT PRINCIPAL
   ========================================================== */
export default function ScraperImmo() {
  const DEPARTEMENTS = Object.keys(DEPARTEMENT_CP);

  /* ------------------ ÉTATS ------------------ */
  const [site, setSite] = useState("leboncoin");
  const [departement, setDepartement] = useState("Rhone");
  const [prixMin, setPrixMin] = useState(100000);
  const [prixMax, setPrixMax] = useState(400000);
  const [piecesMin, setPiecesMin] = useState(3);
  const [piecesMax, setPiecesMax] = useState(6);
  const [surfaceMin, setSurfaceMin] = useState(50);
  const [terrainMin, setTerrainMin] = useState("");
  const [terrainMax, setTerrainMax] = useState("");
  const [dpe, setDpe] = useState("indifferent");

  /* ==========================================================
     🔵 Génération URL LEBONCOIN EXACTE & MINIMALISTE
     ========================================================== */
  const buildLeboncoinUrl = useCallback(() => {
    const cp = DEPARTEMENT_CP[departement]?.[0] || "";
    const dptLBC = "d_" + cp;

    const roomsPart = `${piecesMin}-${piecesMax}`;
    const squarePart = `${surfaceMin}-`;

    let url =
      "https://www.leboncoin.fr/recherche?" +
      "category=9" +
      `&locations=${dptLBC}` +
      `&price=${prixMin}-${prixMax}` +
      `&rooms=${roomsPart}` +
      `&square=${squarePart}`;

    if (terrainMin || terrainMax) {
      url += `&land_plot_surface=${terrainMin || ""}-${terrainMax || ""}`;
    }
    if (dpe !== "indifferent") {
      url += `&energy_rate=${dpe.toLowerCase()}`;
    }

    return url;
  }, [
    departement,
    prixMin,
    prixMax,
    piecesMin,
    piecesMax,
    surfaceMin,
    terrainMin,
    terrainMax,
    dpe,
  ]);

  /* ==========================================================
     🔵 URL AUTRES SITES
     ========================================================== */
  const buildSelogerUrl = useCallback(() => {
    const label = DEPARTEMENTS_UI[departement];
    const params = new URLSearchParams({
      idtt: "2",
      prixmin: prixMin,
      prixmax: prixMax,
      nb_pieces_min: piecesMin,
      nb_pieces_max: piecesMax,
      surfmin: surfaceMin,
    });
    return `https://www.seloger.com/list.htm?${params.toString()}&localisation=${label}`;
  }, [departement, prixMin, prixMax, piecesMin, piecesMax, surfaceMin]);

  const buildBienIciUrl = useCallback(() => {
    const json = JSON.stringify({
      filters: {
        category: "buy",
        price: { min: prixMin, max: prixMax },
        rooms: { min: piecesMin, max: piecesMax },
        surface: { min: surfaceMin },
        land_plot_surface: {
          min: terrainMin ? Number(terrainMin) : undefined,
          max: terrainMax ? Number(terrainMax) : undefined,
        },
      },
      zone: { type: "departement", value: DEPARTEMENTS_UI[departement] },
    });
    return "https://www.bienici.com/recherche/" + encodeURIComponent(json);
  }, [
    departement,
    prixMin,
    prixMax,
    piecesMin,
    piecesMax,
    surfaceMin,
    terrainMin,
    terrainMax,
  ]);

  const buildPAPUrl = useCallback(() => {
    const params = new URLSearchParams({
      prixmin: prixMin || "",
      prixmax: prixMax || "",
      nb_pieces: piecesMin || "",
      surface: surfaceMin || "",
      villes: DEPARTEMENTS_UI[departement],
    });
    return `https://www.pap.fr/annonce?${params.toString()}`;
  }, [departement, prixMin, prixMax, piecesMin, surfaceMin]);

  const buildLogicImmoUrl = useCallback(() => {
    const params = new URLSearchParams({
      transaction: "vente",
      prixmin: prixMin,
      prixmax: prixMax,
      piecesmin: piecesMin,
      piecesmax: piecesMax,
      surfacemin: surfaceMin,
      location: DEPARTEMENTS_UI[departement],
    });
    return `https://www.logic-immo.com/?${params.toString()}`;
  }, [departement, prixMin, prixMax, piecesMin, piecesMax, surfaceMin]);

  /* ==========================================================
     🔵 SELECT SITE
     ========================================================== */
  const previewUrl = useMemo(() => {
    switch (site) {
      case "seloger":
        return buildSelogerUrl();
      case "bienici":
        return buildBienIciUrl();
      case "pap":
        return buildPAPUrl();
      case "logic-immo":
        return buildLogicImmoUrl();
      default:
        return buildLeboncoinUrl();
    }
  }, [
    site,
    buildLeboncoinUrl,
    buildSelogerUrl,
    buildBienIciUrl,
    buildPAPUrl,
    buildLogicImmoUrl,
  ]);

  const handleOpenSearch = () => {
    const w = window.open(previewUrl, "_blank");
    if (!w) alert("Pop-up bloquée, autorisez l’ouverture.");
  };

  /* ==========================================================
     🔵 INTERFACE (STYLE IDENTIQUE À TON APP)
     ========================================================== */
  return (
    <div style={page}>
      <h1 style={title}>🏡 Multi-Site Immo Finder</h1>

      <div style={panel}>
        {/* Ligne 1 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Site</label>
            <select value={site} onChange={(e) => setSite(e.target.value)} style={select}>
              <option value="leboncoin">Leboncoin</option>
              <option value="seloger">SeLoger</option>
              <option value="bienici">BienIci</option>
              <option value="pap">PAP</option>
              <option value="logic-immo">Logic-Immo</option>
            </select>
          </div>

          <div style={col}>
            <label style={label}>Département</label>
            <select
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              style={select}
            >
              {DEPARTEMENTS.map((d) => (
                <option key={d} value={d}>
                  {DEPARTEMENTS_UI[d]}
                </option>
              ))}
            </select>
          </div>

          <div style={col}>
            <label style={label}>DPE</label>
            <select value={dpe} onChange={(e) => setDpe(e.target.value)} style={select}>
              <option value="indifferent">Indifférent</option>
              {["A", "B", "C", "D", "E", "F", "G"].map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>
          </div>

          <div style={col}></div>
          <div style={col}></div>
        </div>

        {/* Ligne 2 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Prix min (€)</label>
            <input
              type="number"
              value={prixMin}
              onChange={(e) => setPrixMin(Number(e.target.value))}
              style={input}
            />
          </div>

          <div style={col}>
            <label style={label}>Prix max (€)</label>
            <input
              type="number"
              value={prixMax}
              onChange={(e) => setPrixMax(Number(e.target.value))}
              style={input}
            />
          </div>

          <div style={col}>
            <label style={label}>Pièces min</label>
            <input
              type="number"
              value={piecesMin}
              onChange={(e) => setPiecesMin(Number(e.target.value))}
              style={input}
            />
          </div>

          <div style={col}>
            <label style={label}>Pièces max</label>
            <input
              type="number"
              value={piecesMax}
              onChange={(e) => setPiecesMax(Number(e.target.value))}
              style={input}
            />
          </div>

          <div style={col}></div>
        </div>

        {/* Ligne 3 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Surface min (m²)</label>
            <input
              type="number"
              value={surfaceMin}
              onChange={(e) => setSurfaceMin(Number(e.target.value))}
              style={input}
            />
          </div>

          <div style={col}>
            <label style={label}>Terrain min (m²)</label>
            <input
              type="number"
              value={terrainMin}
              onChange={(e) => setTerrainMin(e.target.value)}
              style={input}
            />
          </div>

          <div style={col}>
            <label style={label}>Terrain max (m²)</label>
            <input
              type="number"
              value={terrainMax}
              onChange={(e) => setTerrainMax(e.target.value)}
              style={input}
            />
          </div>

          <div style={col}></div>
          <div style={col}></div>
        </div>

        {/* Bouton */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={handleOpenSearch} style={btnRun}>
            🔎 Ouvrir la recherche
          </button>
        </div>

        {/* Preview URL */}
        <div style={{ marginTop: 20, fontSize: 13, opacity: 0.9 }}>
          <div>Aperçu de l’URL :</div>
          <code style={codeBox}>{previewUrl}</code>

          <div style={{ marginTop: 10 }}>
            <a href={previewUrl} target="_blank" rel="noreferrer" style={link}>
              🔗 Ouvrir dans un nouvel onglet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   🔵 Styles (identique à ton interface)
   ========================================================== */
const page = {
  backgroundColor: "#243b55",
  color: "white",
  minHeight: "100vh",
  padding: 40,
  fontFamily: "Segoe UI",
};

const title = {
  textAlign: "center",
  color: "#ffcc00",
  marginBottom: 14,
};

const panel = {
  background: "#1e3150",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,.25)",
  maxWidth: 1200,
  margin: "0 auto",
};

const row = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 12,
  marginBottom: 10,
};

const col = { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 };
const label = { fontSize: 13, opacity: 0.9 };

const select = {
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  background: "#4fa3f7",
  color: "white",
  border: "none",
};

const input = {
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  background: "#2d446a",
  color: "white",
  border: "1px solid #3b4f7f",
};

const btnRun = {
  padding: "10px 18px",
  borderRadius: 8,
  backgroundColor: "#2d7d46",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

const link = {
  color: "#4fa3f7",
  fontWeight: "bold",
  textDecoration: "none",
};

const codeBox = {
  display: "block",
  background: "#14233d",
  border: "1px solid #29406a",
  padding: "10px 12px",
  borderRadius: 8,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};
