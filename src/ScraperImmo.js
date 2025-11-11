// src/ScraperImmo.js
console.log("Scraper UI version 1.5 Google Search Edition");

import React, { useState } from "react";

export default function ScraperImmo() {
  // ------- Filtres -------
  const [departement, setDepartement] = useState("Haute-Marne");
  const [site, setSite] = useState("leboncoin");
  const [prixMin, setPrixMin] = useState(20000);
  const [prixMax, setPrixMax] = useState(800000);
  const [piecesMin, setPiecesMin] = useState(1);
  const [piecesMax, setPiecesMax] = useState(5);
  const [surfaceMin, setSurfaceMin] = useState(20);
  const [terrain, setTerrain] = useState("indifférent");
  const [chauffage, setChauffage] = useState("indifférent");
  const [travaux, setTravaux] = useState("indifférent");

  // ------- NOUVEAU : Recherche Google -------
  const handleSearchGoogle = () => {
    const tokens = [];

    // Département
    if (departement) tokens.push(`"${departement}"`);

    // Domaine selon le site sélectionné
    const siteDomains = {
      seloger: "site:seloger.com",
      leboncoin: "site:leboncoin.fr",
      bienici: "site:bienici.com",
      pap: "site:pap.fr",
      "logic-immo": "site:logic-immo.com",
    };
    tokens.push(siteDomains[site] || "");

    // Type de bien
    tokens.push("maison");

    // Filtres texte
    tokens.push(`${piecesMin}-${piecesMax} pièces`);
    tokens.push(`${surfaceMin}m²`);
    tokens.push(`${prixMin}-${prixMax}€`);

    if (terrain === "oui") tokens.push("terrain");
    if (travaux === "oui") tokens.push("à rénover");

    const chauffageLabel = {
      gaz: "gaz",
      elec: "électrique",
      bois: "bois",
      pac: "pompe à chaleur",
    };
    if (chauffage !== "indifférent") {
      tokens.push(chauffageLabel[chauffage] || chauffage);
    }

    // Exclusion location / non vente
    tokens.push("-location -louer -colocation");

    const googleQuery = tokens.filter(Boolean).join(" ");
    const url = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;

    window.open(url, "_blank");
  };

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

  return (
    <div style={page}>
      <h1 style={title}>🏡 Recherche Immo Pro — Google</h1>

      <div style={panel}>
        {/* Ligne 1 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Département</label>
            <select value={departement} onChange={(e) => setDepartement(e.target.value)} style={select}>
              {DEPARTEMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={col}>
            <label style={label}>Site</label>
            <select value={site} onChange={(e) => setSite(e.target.value)} style={select}>
              {SITES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Ligne 2 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Prix min (€)</label>
            <input type="number" value={prixMin} onChange={(e) => setPrixMin(e.target.value)} style={input} />
          </div>
          <div style={col}>
            <label style={label}>Prix max (€)</label>
            <input type="number" value={prixMax} onChange={(e) => setPrixMax(e.target.value)} style={input} />
          </div>
          <div style={col}>
            <label style={label}>Pièces min</label>
            <input type="number" value={piecesMin} onChange={(e) => setPiecesMin(e.target.value)} style={input} />
          </div>
          <div style={col}>
            <label style={label}>Pièces max</label>
            <input type="number" value={piecesMax} onChange={(e) => setPiecesMax(e.target.value)} style={input} />
          </div>
          <div style={col}>
            <label style={label}>Surface min (m²)</label>
            <input type="number" value={surfaceMin} onChange={(e) => setSurfaceMin(e.target.value)} style={input} />
          </div>
        </div>

        {/* Ligne 3 */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Terrain</label>
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

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button onClick={handleSearchGoogle} style={btnRun}>🔍 Rechercher sur Google</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const page = { backgroundColor: "#243b55", color: "white", minHeight: "100vh", padding: 40, fontFamily: "Segoe UI" };
const title = { textAlign: "center", color: "#e91e63", marginBottom: 14 };
const panel = { background: "#1e3150", padding: 16, borderRadius: 12, maxWidth: 1200, margin: "0 auto" };
const row = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 10 };
const col = { display: "flex", flexDirection: "column", gap: 6 };
const label = { fontSize: 13, opacity: 0.9 };
const select = { padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "#4fa3f7", color: "white", border: "none" };
const input = { padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "#2d446a", color: "white", border: "1px solid #3b4f7f" };
const btnRun = { padding: "12px 22px", borderRadius: 8, backgroundColor: "#3f6628", color: "white", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 16 };
