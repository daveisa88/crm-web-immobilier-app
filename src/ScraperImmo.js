import React, { useMemo, useState, useCallback } from "react";

export default function ScraperImmo() {
  // ------- États des filtres -------
  const [departement, setDepartement] = useState("Rhône");
  const [site, setSite] = useState("leboncoin");
  const [prixMin, setPrixMin] = useState(100000);
  const [prixMax, setPrixMax] = useState(400000);
  const [piecesMin, setPiecesMin] = useState(3);
  const [piecesMax, setPiecesMax] = useState(5);
  const [surfaceMin, setSurfaceMin] = useState(50);
  const [terrain, setTerrain] = useState("indifférent");
  const [chauffage, setChauffage] = useState("indifférent");
  const [travaux, setTravaux] = useState("indifférent");
  const [typeBien, setTypeBien] = useState("maison");

  // ------- Mapping des sites vers URL natives -------
  const buildSiteUrl = useCallback(() => {
    const dpt = encodeURIComponent(departement);
    const text = encodeURIComponent([
      terrain === "oui" ? "terrain" : "",
      chauffage !== "indifférent" ? chauffage : "",
      travaux === "oui" ? "travaux" : "",
    ].filter(Boolean).join(" "));

    // ------- Leboncoin -------
    if (site === "leboncoin") {
      const params = new URLSearchParams({
        category: "9", // ventes immobilières
        locations: dpt,
        price: `${prixMin || 0}-${prixMax || ""}`,
        rooms: `${piecesMin || 1}-${piecesMax || ""}`,
        square: `${surfaceMin || 0}-`,
        real_estate_type: typeBien === "maison" ? "1" : typeBien === "appartement" ? "2" : "3",
        immo_sell_type: "old",
        radius: "50000",
      });
      if (terrain === "oui") params.set("outside_access", "terrace,garden");
      if (text) params.set("text", text);
      return `https://www.leboncoin.fr/recherche?${params.toString()}`;
    }

    // ------- SeLoger -------
    if (site === "seloger") {
      const typeMap = {
        maison: "1",
        appartement: "2",
        terrain: "3",
      };
      const params = new URLSearchParams({
        idtt: "2", // transaction = vente
        naturebien: typeMap[typeBien] || "1",
        prixmin: prixMin || "",
        prixmax: prixMax || "",
        surfmin: surfaceMin || "",
        nb_pieces_min: piecesMin || "",
        nb_pieces_max: piecesMax || "",
      });
      return `https://www.seloger.com/list.htm?${params.toString()}&localisation=${dpt}`;
    }

    // ------- BienIci -------
    if (site === "bienici") {
      const json = encodeURIComponent(JSON.stringify({
        filters: {
          category: "buy",
          real_estate_type: typeBien,
          price: { min: prixMin, max: prixMax },
          surface: { min: surfaceMin },
          rooms: { min: piecesMin, max: piecesMax },
          keywords: text ? [text] : [],
        },
        zone: { type: "departement", value: dpt },
      }));
      return `https://www.bienici.com/recherche/${json}`;
    }

    // ------- PAP -------
    if (site === "pap") {
      const params = new URLSearchParams({
        typebien: typeBien,
        prixmin: prixMin || "",
        prixmax: prixMax || "",
        nb_pieces: piecesMin || "",
        surface: surfaceMin || "",
        villes: dpt,
      });
      return `https://www.pap.fr/annonce/vente-${typeBien}?${params.toString()}`;
    }

    // ------- Logic-Immo -------
    if (site === "logic-immo") {
      const params = new URLSearchParams({
        transaction: "vente",
        prixmin: prixMin || "",
        prixmax: prixMax || "",
        surfacemin: surfaceMin || "",
        piecesmin: piecesMin || "",
        piecesmax: piecesMax || "",
        type: typeBien,
        location: dpt,
      });
      return `https://www.logic-immo.com/${typeBien}/?${params.toString()}`;
    }

    return "#";
  }, [
    site, departement, prixMin, prixMax, piecesMin, piecesMax,
    surfaceMin, terrain, chauffage, travaux, typeBien
  ]);

  // ------- Action : ouvrir la recherche -------
  const handleOpenSearch = () => {
    const url = buildSiteUrl();
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) alert("Pop-up bloquée, autorisez l’ouverture d’un nouvel onglet.");
  };

  // ------- Liste des sites -------
  const SITES = [
    { label: "Leboncoin", value: "leboncoin" },
    { label: "SeLoger", value: "seloger" },
    { label: "BienIci", value: "bienici" },
    { label: "PAP", value: "pap" },
    { label: "Logic-Immo", value: "logic-immo" },
  ];

  // ------- Types de biens -------
  const TYPES_BIEN = [
    { label: "Maison", value: "maison" },
    { label: "Appartement", value: "appartement" },
    { label: "Terrain", value: "terrain" },
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

  // ------- Aperçu de l’URL -------
  const previewUrl = useMemo(() => buildSiteUrl(), [buildSiteUrl]);

  // ------- Interface -------
  return (
    <div style={page}>
      <h1 style={title}>🏡 Multi-Site Immo Finder</h1>

      <div style={panel}>
        <div style={row}>
          <div style={col}>
            <label style={label}>Site</label>
            <select value={site} onChange={(e) => setSite(e.target.value)} style={select}>
              {SITES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div style={col}>
            <label style={label}>Type de bien</label>
            <select value={typeBien} onChange={(e) => setTypeBien(e.target.value)} style={select}>
              {TYPES_BIEN.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div style={col}>
            <label style={label}>Département</label>
            <select value={departement} onChange={(e) => setDepartement(e.target.value)} style={select}>
              {DEPARTEMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div style={row}>
          <div style={col}><label style={label}>Prix min (€)</label>
            <input type="number" value={prixMin} onChange={(e) => setPrixMin(Number(e.target.value))} style={input}/></div>
          <div style={col}><label style={label}>Prix max (€)</label>
            <input type="number" value={prixMax} onChange={(e) => setPrixMax(Number(e.target.value))} style={input}/></div>
          <div style={col}><label style={label}>Pièces min</label>
            <input type="number" value={piecesMin} onChange={(e) => setPiecesMin(Number(e.target.value))} style={input}/></div>
          <div style={col}><label style={label}>Pièces max</label>
            <input type="number" value={piecesMax} onChange={(e) => setPiecesMax(Number(e.target.value))} style={input}/></div>
          <div style={col}><label style={label}>Surface min (m²)</label>
            <input type="number" value={surfaceMin} onChange={(e) => setSurfaceMin(Number(e.target.value))} style={input}/></div>
        </div>

        <div style={row}>
          <div style={col}><label style={label}>Terrain ?</label>
            <select value={terrain} onChange={(e) => setTerrain(e.target.value)} style={select}>
              <option value="indifférent">Indifférent</option><option value="oui">Oui</option><option value="non">Non</option>
            </select></div>
          <div style={col}><label style={label}>Chauffage</label>
            <select value={chauffage} onChange={(e) => setChauffage(e.target.value)} style={select}>
              <option value="indifférent">Indifférent</option><option value="gaz">Gaz</option><option value="électrique">Électrique</option><option value="bois">Bois</option><option value="pompe à chaleur">Pompe à chaleur</option>
            </select></div>
          <div style={col}><label style={label}>Travaux</label>
            <select value={travaux} onChange={(e) => setTravaux(e.target.value)} style={select}>
              <option value="indifférent">Indifférent</option><option value="oui">Oui</option><option value="non">Non</option>
            </select></div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={handleOpenSearch} style={btnRun}>🔎 Ouvrir la recherche</button>
        </div>

        <div style={{ marginTop: 20, fontSize: 13, opacity: 0.9 }}>
          <div>Aperçu de l’URL générée :</div>
          <code style={codeBox}>{previewUrl}</code>
          <div style={{ marginTop: 10 }}>
            <a href={previewUrl} target="_blank" rel="noreferrer" style={link}>🔗 Ouvrir dans un nouvel onglet</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const page = { backgroundColor: "#243b55", color: "white", minHeight: "100vh", padding: 40, fontFamily: "Segoe UI" };
const title = { textAlign: "center", color: "#ffcc00", marginBottom: 14 };
const panel = { background: "#1e3150", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.25)", maxWidth: 1200, margin: "0 auto" };
const row = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 10 };
const col = { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 };
const label = { fontSize: 13, opacity: 0.9 };
const select = { padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "#4fa3f7", color: "white", border: "none" };
const input = { padding: "10px 12px", borderRadius: 8, fontSize: 14, background: "#2d446a", color: "white", border: "1px solid #3b4f7f" };
const btnRun = { padding: "10px 18px", borderRadius: 8, backgroundColor: "#2d7d46", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" };
const link = { color: "#4fa3f7", fontWeight: "bold", textDecoration: "none" };
const codeBox = { display: "block", background: "#14233d", border: "1px solid #29406a", padding: "10px 12px", borderRadius: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" };
