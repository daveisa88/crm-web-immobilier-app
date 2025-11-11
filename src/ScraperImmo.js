// src/ScraperImmo.js
import React, { useMemo, useState } from "react";

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

  // ------- Données -------
  const [annonces, setAnnonces] = useState([]);
  const [median, setMedian] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tri, setTri] = useState({ key: "viabilite", dir: "desc" });
  const [error, setError] = useState(null);

  // ------- Lancer la recherche -------
  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setAnnonces([]);

    const url =
      `/api/recherche?` +
      new URLSearchParams({
        departement,
        site,
        prixMin,
        prixMax,
        piecesMin,
        piecesMax,
        surfaceMin,
        terrain,
        chauffage,
        travaux,
      }).toString();

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("API indisponible ou quota atteint");
      const data = await res.json();
      setAnnonces(data.annonces || []);
      setMedian(data.medianRef ?? null);
    } catch (e) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // ------- Tri dynamique -------
  const sorted = useMemo(() => {
    const arr = [...annonces];
    const { key, dir } = tri;
    const mul = dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      if (typeof a[key] === "string") return a[key].localeCompare(b[key]) * mul;
      return ((a[key] ?? 0) - (b[key] ?? 0)) * mul;
    });
    return arr;
  }, [annonces, tri]);

  const header = (label, key) => (
    <th
      style={th}
      onClick={() =>
        setTri((t) => ({
          key,
          dir: t.key === key && t.dir === "desc" ? "asc" : "desc",
        }))
      }
    >
      {label} {tri.key === key ? (tri.dir === "asc" ? "▲" : "▼") : ""}
    </th>
  );

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
      <h1 style={title}>🏡 Scraper Immo Pro — France</h1>

      <div style={panel}>
        <div style={row}>
          <div style={col}>
            <label style={label}>Département</label>
            <select
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              style={select}
            >
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

        <div style={row}>
          <div style={col}>
            <label style={label}>Prix min (€)</label>
            <input type="number" min={0} value={prixMin}
              onChange={(e) => setPrixMin(e.target.value)} style={input}
              placeholder="ex: 20000" />
          </div>
          <div style={col}>
            <label style={label}>Prix max (€)</label>
            <input type="number" min={0} value={prixMax}
              onChange={(e) => setPrixMax(e.target.value)} style={input}
              placeholder="ex: 800000" />
          </div>
          <div style={col}>
            <label style={label}>Pièces min</label>
            <input type="number" min={1} value={piecesMin}
              onChange={(e) => setPiecesMin(e.target.value)} style={input}
              placeholder="ex: 1" />
          </div>
          <div style={col}>
            <label style={label}>Pièces max</label>
            <input type="number" min={1} value={piecesMax}
              onChange={(e) => setPiecesMax(e.target.value)} style={input}
              placeholder="ex: 5" />
          </div>
          <div style={col}>
            <label style={label}>Surface min (m²)</label>
            <input type="number" min={0} value={surfaceMin}
              onChange={(e) => setSurfaceMin(e.target.value)} style={input}
              placeholder="ex: 20" />
          </div>
        </div>

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

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={handleScrape} disabled={loading} style={btnRun}>
            {loading ? "🔄 Analyse en cours..." : "🚀 Lancer"}
          </button>
        </div>
      </div>

      {median ? (
        <p style={medianText}>
          📊 Prix médian marché (DVF) pour <b>{departement}</b> : <b>{median.toLocaleString()} €/m²</b>
        </p>
      ) : null}

      {error ? (
        <p style={{ textAlign: "center", color: "#e74c3c", marginTop: 12 }}>
          ❌ {error}
        </p>
      ) : null}

      {sorted.length > 0 ? (
        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={table}>
            <thead style={thead}>
              <tr>
                {header("Titre", "titre")}
                {header("Ville", "ville")}
                {header("Prix (€)", "prix")}
                {header("Surface (m²)", "surface")}
                {header("€/m²", "prixM2")}
                {header("Viabilité", "viabilite")}
                <th style={th}>Lien</th>
                <th style={th}>Source</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a, i) => (
                <tr key={i} style={{ background: i % 2 ? "#2b3f66" : "#334c7a" }}>
                  <td style={td}>{a.titre}</td>
                  <td style={td}>{a.ville}</td>
                  <td style={td}>{a.prix?.toLocaleString()}</td>
                  <td style={td}>{a.surface}</td>
                  <td style={td}>{a.prixM2?.toLocaleString()}</td>
                  <td style={{
                    ...td,
                    color: a.viabilite >= 8 ? "#2ecc71" : a.viabilite >= 5 ? "#f1c40f" : "#e74c3c",
                    fontWeight: "bold",
                  }}>
                    {a.viabilite}
                  </td>
                  <td style={td}>
                    <a href={a.lien} target="_blank" rel="noreferrer" style={link}>🔗 Voir</a>
                  </td>
                  <td style={{ ...td, opacity: 0.85 }}>{a.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading && !error ? (
        <p style={{ textAlign: "center", opacity: 0.8, marginTop: 10 }}>
          ⚠️ Aucun résultat pour l’instant. Choisis tes filtres puis clique “🚀 Lancer”.
        </p>
      ) : null}
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
const btnRun = { padding: "10px 18px", borderRadius: 8, backgroundColor: "#3f6628", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" };
const table = { width: "100%", borderCollapse: "collapse", color: "#fff", marginTop: 16 };
const thead = { background: "#1a2a4f" };
const th = { padding: 10, textAlign: "left", borderBottom: "2px solid #4fa3f7", cursor: "pointer", whiteSpace: "nowrap" };
const td = { padding: 10, borderBottom: "1px solid #3b4f7f", verticalAlign: "top" };
const link = { color: "#4fa3f7", fontWeight: "bold", textDecoration: "none" };
const medianText = { textAlign: "center", color: "#f1c40f", fontWeight: "bold", fontSize: 16, marginTop: 10 };
