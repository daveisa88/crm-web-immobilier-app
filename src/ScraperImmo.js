import React, { useMemo, useState, useCallback } from "react";

// ===== Helper pour nettoyer les accents / espaces pour Leboncoin =====
const clean = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "+");

// ===== Codes postaux (simplifiés) par département =====
const DEPARTEMENT_CP = {
  "Ain": ["01"],
  "Aisne": ["02"],
  "Allier": ["03"],
  "Alpes-de-Haute-Provence": ["04"],
  "Hautes-Alpes": ["05"],
  "Alpes-Maritimes": ["06"],
  "Ardèche": ["07"],
  "Ardennes": ["08"],
  "Ariège": ["09"],
  "Aube": ["10"],
  "Aude": ["11"],
  "Aveyron": ["12"],
  "Bas-Rhin": ["67"],
  "Haut-Rhin": ["68"],
  "Bouches-du-Rhône": ["13"],
  "Calvados": ["14"],
  "Cantal": ["15"],
  "Charente": ["16"],
  "Charente-Maritime": ["17"],
  "Cher": ["18"],
  "Corrèze": ["19"],
  "Corse-du-Sud": ["2A"],
  "Haute-Corse": ["2B"],
  "Côte-d'Or": ["21"],
  "Côtes-d'Armor": ["22"],
  "Creuse": ["23"],
  "Deux-Sèvres": ["79"],
  "Dordogne": ["24"],
  "Doubs": ["25"],
  "Drôme": ["26"],
  "Eure": ["27"],
  "Eure-et-Loir": ["28"],
  "Finistère": ["29"],
  "Gard": ["30"],
  "Haute-Garonne": ["31"],
  "Gers": ["32"],
  "Gironde": ["33"],
  "Hérault": ["34"],
  "Ille-et-Vilaine": ["35"],
  "Indre": ["36"],
  "Indre-et-Loire": ["37"],
  "Isère": ["38"],
  "Jura": ["39"],
  "Landes": ["40"],
  "Loir-et-Cher": ["41"],
  "Loire": ["42"],
  "Haute-Loire": ["43"],
  "Loire-Atlantique": ["44"],
  "Loiret": ["45"],
  "Lot": ["46"],
  "Lot-et-Garonne": ["47"],
  "Lozère": ["48"],
  "Maine-et-Loire": ["49"],
  "Manche": ["50"],
  "Marne": ["51"],
  "Haute-Marne": ["52"],
  "Mayenne": ["53"],
  "Meurthe-et-Moselle": ["54"],
  "Meuse": ["55"],
  "Morbihan": ["56"],
  "Moselle": ["57"],
  "Nièvre": ["58"],
  "Nord": ["59"],
  "Oise": ["60"],
  "Orne": ["61"],
  "Pas-de-Calais": ["62"],
  "Puy-de-Dôme": ["63"],
  "Pyrénées-Atlantiques": ["64"],
  "Hautes-Pyrénées": ["65"],
  "Pyrénées-Orientales": ["66"],
  "Rhône": ["69"],
  "Haute-Saône": ["70"],
  "Saône-et-Loire": ["71"],
  "Sarthe": ["72"],
  "Savoie": ["73"],
  "Haute-Savoie": ["74"],
  "Paris": ["75"],
  "Seine-Maritime": ["76"],
  "Seine-et-Marne": ["77"],
  "Yvelines": ["78"],
  "Somme": ["80"],
  "Tarn": ["81"],
  "Tarn-et-Garonne": ["82"],
  "Var": ["83"],
  "Vaucluse": ["84"],
  "Vendée": ["85"],
  "Vienne": ["86"],
  "Haute-Vienne": ["87"],
  "Vosges": ["88"],
  "Yonne": ["89"],
  "Territoire de Belfort": ["90"],
  "Essonne": ["91"],
  "Hauts-de-Seine": ["92"],
  "Seine-Saint-Denis": ["93"],
  "Val-de-Marne": ["94"],
  "Val-d'Oise": ["95"]
};

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

  // nouveaux filtres avancés
  const [terrainMin, setTerrainMin] = useState("");
  const [terrainMax, setTerrainMax] = useState("");
  const [orientation, setOrientation] = useState("indifferent");
  const [anneeMin, setAnneeMin] = useState("");
  const [anneeMax, setAnneeMax] = useState("");
  const [dpe, setDpe] = useState("indifferent");

  // ------- Mapping des sites vers URL natives -------
  const buildSiteUrl = useCallback(() => {
    const dptEncoded = encodeURIComponent(departement);

    // ------- Leboncoin -------
    if (site === "leboncoin") {
      const dptClean = clean(departement); // ex : Rhône -> Rhone
      const cpList = DEPARTEMENT_CP[departement] || [];
      const cpString = cpList.join(",");

      const typeMapLbc = {
        maison: "1",
        appartement: "2",
        terrain: "3"
      };

      const pricePart = `${prixMin || 0}-${prixMax || ""}`;
      const roomsPart = `${piecesMin || 1}-${piecesMax || ""}`;
      const squarePart = `${surfaceMin || 0}-`;

      let url =
        "https://www.leboncoin.fr/recherche?" +
        `category=9` +
        `&locations=${dptClean}` +
        `&price=${pricePart}` +
        `&rooms=${roomsPart}` +
        `&square=${squarePart}` +
        `&real_estate_type=${typeMapLbc[typeBien] || "1"}` +
        `&immo_sell_type=old` +
        `&radius=50000`;

      // terrain (jardin / terrasse)
      if (terrain === "oui") {
        url += "&outside_access=terrace,garden";
      }

      // surface de terrain (si renseignée)
      if (terrainMin || terrainMax) {
        const tMin = terrainMin || 0;
        const tMax = terrainMax || "";
        url += `&land_plot_surface=${tMin}-${tMax}`;
      }

      // mots-clés
      const keywords = [];

      // orientation
      if (orientation && orientation !== "indifferent") {
        keywords.push(clean(orientation)); // sud, est, ouest, nord
      }

      // année construction
      if (anneeMin) keywords.push(`construction+apres+${anneeMin}`);
      if (anneeMax) keywords.push(`construction+avant+${anneeMax}`);

      // DPE
      if (dpe && dpe !== "indifferent") {
        if (dpe === "sans") {
          keywords.push("sans+DPE");
        } else {
          keywords.push(`DPE+${dpe}`);
        }
      }

      // chauffage
      if (chauffage !== "indifférent") {
        keywords.push(clean(chauffage));
      }

      // travaux
      if (travaux === "oui") {
        keywords.push("travaux");
      }

      // terrain en mot-clé si coché
      if (terrain === "oui") {
        keywords.push("terrain");
      }

      if (keywords.length > 0) {
        url += `&text=${keywords.join("+")}`;
      }

      // code postal auto
      if (cpString) {
        url += `&postal_code=${cpString}`;
      }

      return url;
    }

    // ------- SeLoger -------
    if (site === "seloger") {
      const typeMap = {
        maison: "1",
        appartement: "2",
        terrain: "3"
      };
      const params = new URLSearchParams({
        idtt: "2", // transaction = vente
        naturebien: typeMap[typeBien] || "1",
        prixmin: prixMin || "",
        prixmax: prixMax || "",
        surfmin: surfaceMin || "",
        nb_pieces_min: piecesMin || "",
        nb_pieces_max: piecesMax || ""
      });
      return `https://www.seloger.com/list.htm?${params.toString()}&localisation=${dptEncoded}`;
    }

    // ------- BienIci -------
    if (site === "bienici") {
      const keywords = [];
      if (chauffage !== "indifférent") keywords.push(chauffage);
      if (travaux === "oui") keywords.push("travaux");
      if (terrain === "oui") keywords.push("terrain");

      const json = encodeURIComponent(
        JSON.stringify({
          filters: {
            category: "buy",
            real_estate_type: typeBien,
            price: { min: prixMin, max: prixMax },
            surface: { min: surfaceMin },
            rooms: { min: piecesMin, max: piecesMax },
            land_plot_surface: {
              min: terrainMin ? Number(terrainMin) : undefined,
              max: terrainMax ? Number(terrainMax) : undefined
            },
            keywords
          },
          zone: { type: "departement", value: departement }
        })
      );
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
        villes: departement
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
        location: departement
      });
      return `https://www.logic-immo.com/${typeBien}/?${params.toString()}`;
    }

    return "#";
  }, [
    site,
    departement,
    prixMin,
    prixMax,
    piecesMin,
    piecesMax,
    surfaceMin,
    terrain,
    chauffage,
    travaux,
    typeBien,
    terrainMin,
    terrainMax,
    orientation,
    anneeMin,
    anneeMax,
    dpe
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
    { label: "Logic-Immo", value: "logic-immo" }
  ];

  // ------- Types de biens -------
  const TYPES_BIEN = [
    { label: "Maison", value: "maison" },
    { label: "Appartement", value: "appartement" },
    { label: "Terrain", value: "terrain" }
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
        {/* Ligne 1 : site, type, département, orientation, DPE */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Site</label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              style={select}
            >
              {SITES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div style={col}>
            <label style={label}>Type de bien</label>
            <select
              value={typeBien}
              onChange={(e) => setTypeBien(e.target.value)}
              style={select}
            >
              {TYPES_BIEN.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
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
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={col}>
            <label style={label}>Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              style={select}
            >
              <option value="indifferent">Indifférent</option>
              <option value="sud">Sud</option>
              <option value="est">Est</option>
              <option value="ouest">Ouest</option>
              <option value="nord">Nord</option>
            </select>
          </div>

          <div style={col}>
            <label style={label}>DPE</label>
            <select
              value={dpe}
              onChange={(e) => setDpe(e.target.value)}
              style={select}
            >
              <option value="indifferent">Indifférent</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="sans">Sans DPE</option>
            </select>
          </div>
        </div>

        {/* Ligne 2 : prix, pièces, surface */}
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
          <div style={col}>
            <label style={label}>Surface min (m²)</label>
            <input
              type="number"
              value={surfaceMin}
              onChange={(e) => setSurfaceMin(Number(e.target.value))}
              style={input}
            />
          </div>
        </div>

        {/* Ligne 3 : terrain, chauffage, travaux, terrain min/max */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Terrain ?</label>
            <select
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
              style={select}
            >
              <option value="indifférent">Indifférent</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          <div style={col}>
            <label style={label}>Chauffage</label>
            <select
              value={chauffage}
              onChange={(e) => setChauffage(e.target.value)}
              style={select}
            >
              <option value="indifférent">Indifférent</option>
              <option value="gaz">Gaz</option>
              <option value="électrique">Électrique</option>
              <option value="bois">Bois</option>
              <option value="pompe à chaleur">Pompe à chaleur</option>
            </select>
          </div>
          <div style={col}>
            <label style={label}>Travaux</label>
            <select
              value={travaux}
              onChange={(e) => setTravaux(e.target.value)}
              style={select}
            >
              <option value="indifférent">Indifférent</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
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
        </div>

        {/* Ligne 4 : années min / max */}
        <div style={row}>
          <div style={col}>
            <label style={label}>Année min</label>
            <input
              type="number"
              value={anneeMin}
              onChange={(e) => setAnneeMin(e.target.value)}
              style={input}
            />
          </div>
          <div style={col}>
            <label style={label}>Année max</label>
            <input
              type="number"
              value={anneeMax}
              onChange={(e) => setAnneeMax(e.target.value)}
              style={input}
            />
          </div>
          <div style={col}></div>
          <div style={col}></div>
          <div style={col}></div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={handleOpenSearch} style={btnRun}>
            🔎 Ouvrir la recherche
          </button>
        </div>

        <div style={{ marginTop: 20, fontSize: 13, opacity: 0.9 }}>
          <div>Aperçu de l’URL générée :</div>
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

/* ===== Styles ===== */
const page = {
  backgroundColor: "#243b55",
  color: "white",
  minHeight: "100vh",
  padding: 40,
  fontFamily: "Segoe UI"
};
const title = {
  textAlign: "center",
  color: "#ffcc00",
  marginBottom: 14
};
const panel = {
  background: "#1e3150",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,.25)",
  maxWidth: 1200,
  margin: "0 auto"
};
const row = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 12,
  marginBottom: 10
};
const col = { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 };
const label = { fontSize: 13, opacity: 0.9 };
const select = {
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  background: "#4fa3f7",
  color: "white",
  border: "none"
};
const input = {
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  background: "#2d446a",
  color: "white",
  border: "1px solid #3b4f7f"
};
const btnRun = {
  padding: "10px 18px",
  borderRadius: 8,
  backgroundColor: "#2d7d46",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold"
};
const link = { color: "#4fa3f7", fontWeight: "bold", textDecoration: "none" };
const codeBox = {
  display: "block",
  background: "#14233d",
  border: "1px solid "#29406a",
  padding: "10px 12px",
  borderRadius: 8,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word"
};
