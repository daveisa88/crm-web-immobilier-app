import React, { useMemo, useState, useCallback } from "react";

export default function ScraperImmo() {
  // ------- Filtres -------
  const [departement, setDepartement] = useState("Rhône");
  const [site, setSite] = useState("seloger");
  const [prixMin, setPrixMin] = useState(20000);
  const [prixMax, setPrixMax] = useState(800000);
  const [piecesMin, setPiecesMin] = useState(1);
  const [piecesMax, setPiecesMax] = useState(5);
  const [surfaceMin, setSurfaceMin] = useState(20);
  const [terrain, setTerrain] = useState("indifférent");
  const [chauffage, setChauffage] = useState("indifférent");
  const [travaux, setTravaux] = useState("indifférent");

  // ------- Mapping sites -> domaines Google "site:..."
  const DOMAINS = {
    seloger: ["seloger.com"],
    leboncoin: ["leboncoin.fr"],
    bienici: ["bienici.com"],
    pap: ["pap.fr"],
    "logic-immo": ["logic-immo.com"],
  };

  // ------- Construction de la requête Google (mémoïsée) -------
  const buildGoogleQuery = useCallback(() => {
    const tokens = [];

    // Domaine(s)
    const domains = DOMAINS[site] || [];
    if (domains.length) tokens.push(`(${domains.map((d) => `site:${d}`).join(" OR ")})`);

    // Localisation
    tokens.push(`"${departement}"`);

    // Prix
    if (prixMin) tokens.push(`${prixMin}€..`);
    if (prixMax) tokens.push(`..${prixMax}€`);
    tokens.push("(prix OR €)");

    // Pièces
    if (piecesMin || piecesMax) {
      if (piecesMin && piecesMax) tokens.push(`"${piecesMin}-${piecesMax} pièces"`);
      else if (piecesMin) tokens.push(`"${piecesMin} pièces"`);
      else if (piecesMax) tokens.push(`"${piecesMax} pièces"`);
    }

    // Surface
    if (surfaceMin) {
      tokens.push(
        `(${surfaceMin}m² OR "surface ${surfaceMin}m²" OR ">= ${surfaceMin} m²")`
      );
    }

    // Terrain ?
    if (terrain === "oui") tokens.push("(terrain OR parcelle OR jardin)");
    if (terrain === "non") tokens.push("-(terrain OR jardin)");

    // Chauffage
    if (chauffage !== "indifférent") {
      const map = { gaz: "gaz", elec: "électrique", bois: "bois", pac: `"pompe à chaleur"` };
      tokens.push(`(${map[chauffage] || chauffage})`);
    }

    // Travaux ?
    if (travaux === "oui") tokens.push("(travaux OR rénover OR rafraîchir)");
    if (travaux === "non") tokens.push("-(travaux OR rénover)");

    // Vente uniquement
    tokens.push('(vente OR "à vendre") -location -louer');

    return tokens.join(" ");
  }, [
    departement, site, prixMin, prixMax,
    piecesMin, piecesMax, surfaceMin,
    terrain, chauffage, travaux
  ]);

  // ------- Open Google -------
  const handleOpenGoogle = () => {
    const q = buildGoogleQuery();
    const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) alert("Votre navigateur a bloqué l’ouverture de l’onglet. Autorisez les pop-ups.");
  };

  // ------- Données UI -------
  const SITES = [
    { label: "SeLoger", value: "seloger" },
    { label: "LeBonCoin", value: "leboncoin" },
    { label: "BienIci", value: "bienici" },
    { label: "PAP", value: "pap" },
    { label: "Logic-Immo", value: "logic-immo" },
  ];

  const DEPARTEMENTS = [
    "Ain","Aisne","Allier","Alpes-de-Haute-Provence","Hautes-Alpes","Alpes-Maritimes",
    "Ardèche","Ardennes","Ariège","Aube","Aude","Aveyron","Bas-Rhin","Haut-Rhin",
    "Bouches-du-Rhône","Calvados","Cantal","Charente","Charente-Maritime","Cher",
    "Corrèze","Corse-du-Sud","Haute-Corse","Côte-d'Or","Côtes-d'Armor","Creuse",
    "Deux-Sèvres","Dordogne","Doubs","Drôme","Eure","Eure-et-Loir","Finistère",
    "Gard","Haute-Garonne","Gers","Gironde","Hérault","Ille-et-Vilaine","Indre",
    "Indre-et-Loire","Isère","Jura","Landes","Loir-et-Cher","Loire","Haute-Loire",
    "Loire-Atlantique","Loiret","Lot","Lot-et-Garonne","Lozère","Maine-et-Loire",
    "Manche","Marne","Haute-Marne","Mayenne","Meurthe-et-Moselle","Meuse",
    "Morbihan","Moselle","Nièvre","Nord","Oise","Orne","Pas-de-Calais","Puy-de-Dôme",
    "Pyrénées-Atlantiques","Hautes-Pyrénées","Pyrénées-Orientales","Rhône",
    "Haute-Saône","Saône-et-Loire","Sarthe","Savoie","Haute-Savoie","Paris",
    "Seine-Maritime","Seine-et-Marne","Yvelines","Somme","Tarn","Tarn-et-Garonne",
    "Var","Vaucluse","Vendée","Vienne","Haute-Vienne","Vosges","Yonne",
    "Territoire de Belfort","Essonne","Hauts-de-Seine","Seine-Saint-Denis",
    "Val-de-Marne","Val-d'Oise"
  ];

  // ------- Aperçu de la requête -------
  const previewQuery = useMemo(() => buildGoogleQuery(), [buildGoogleQuery]);

  return (
    <div style={page}>
      <h1 style={title}>🏡 Scraper Immo Pro — France</h1>

      <div style={panel}>
        {/* Ligne 1 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Département</label>
            <select value={departement} onChange={(e) => setDepartement(e.target.value)} style={select}>
              {DEPARTEMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={col}>
            <label style={label}>Site</label>
            <select value={site} onChange={(e) => setSite(e.target.value)} style={select}>
              {SITES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ligne 2 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Prix min (€)</label>
            <input type="number" min={0} value={prixMin}
              onChange={(e) => setPrixMin(Number(e.target.value))}
              style={input} placeholder="ex: 20000" />
          </div>
          <div style={col}>
            <label style={label}>Prix max (€)</label>
            <input type="number" min={0} value={prixMax}
              onChange={(e) => setPrixMax(Number(e.target.value))}
              style={input} placeholder="ex: 800000" />
          </div>
          <div style={col}>
            <label style={label}>Pièces min</label>
            <input type="number" min={1} value={piecesMin}
              onChange={(e) => setPiecesMin(Number(e.target.value))}
              style={input} placeholder="ex: 1" />
          </div>
          <div style={col}>
            <label style={label}>Pièces max</label>
            <input type="number" min={1} value={piecesMax}
              onChange={(e) => setPiecesMax(Number(e.target.value))}
              style={input} placeholder="ex: 5" />
          </div>
          <div style={col}>
            <label style={label}>Surface min (m²)</label>
            <input type="number" min={0} value={surfaceMin}
              onChange={(e) => setSurfaceMin(Number(e.target.value))}
              style={input} placeholder="ex: 20" />
          </div>
        </div>

        {/* Ligne 3 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Terrain ?</label>
            <select value={terrain} onChange={(e) => setTerrain(e.target.value)} style={select}>
              <option value="indifférent">Indifférent</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div style={col}>
            <label style={label}>Chauffage</label>
            <select value={chauffage} onChange={(e) => setChauffage(e.target.value)} style={select}>
              <option value="indifférent">Indifférent</option>
              <option value="gaz">Gaz</option>
              <option value="elec">Électrique</option>
              <option value="bois">Bois</option>
              <option value="pac">Pompe à chaleur</option>
            </select>
          </div>
          <div style={col}>
            <label style={label}>Travaux</label>
            <select value={travaux} onChange={(e) => setTravaux(e.target.value)} style={select}>
              <option value="indifférent">Indifférent</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={handleOpenGoogle} style={btnRun}>🔎 Lancer la recherche Google</button>
        </div>

        {/* Preview */}
        <div style={{ marginTop: 14, fontSize: 13, opacity: 0.9 }}>
          <div style={{ marginBottom: 6 }}>Aperçu requête :</div>
          <code style={codeBox}>{previewQuery}</code>
          <div style={{ marginTop: 10 }}>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(previewQuery)}`}
               target="_blank" rel="noreferrer" style={link}>
              🔗 Ouvrir la recherche dans un nouvel onglet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const page = { backgroundColor: "#243b55", color: "white", minHeight: "100vh", padding: 40, fontFamily: "Segoe UI" };
const title = { textAlign: "center", color: "#e91e63", marginBottom: 14 };
const panel = { background: "#1e3150", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.25)", maxWidth: 1200, margin: "0 auto" };
const row = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 10 };
const col = { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 };
const label = { fontSize: 13, opacity: 0.9 };
const select = { padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "#4fa3f7", color: "white", border: "none" };
const input = { padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "#2d446a", color: "white", border: "1px solid #3b4f7f" };
const btnRun = { padding: "10px 18px", borderRadius: 8, backgroundColor: "#2d7d46", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" };
const link = { color: "#4fa3f7", fontWeight: "bold", textDecoration: "none" };
const codeBox = { display: "block", background: "#14233d", border: "1px solid #29406a", padding: "10px 12px", borderRadius: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" };
