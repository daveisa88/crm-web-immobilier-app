import React, { useMemo, useState, useCallback } from "react";

// ======================================================
// CLEAN STRING
// ======================================================
const clean = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "+")
    .replace(/'/g, "");


// ======================================================
// CP PAR DÉPARTEMENT (CLEFS INTERNES SAFE)
// ======================================================
const DEPARTEMENT_CP = {
  Ain:["01"], Aisne:["02"], Allier:["03"],
  Alpes_de_Haute_Provence:["04"], Hautes_Alpes:["05"], Alpes_Maritimes:["06"],
  Ardeche:["07"], Ardennes:["08"], Ariege:["09"],
  Aube:["10"], Aude:["11"], Aveyron:["12"],
  Bas_Rhin:["67"], Haut_Rhin:["68"],
  Bouches_du_Rhone:["13"],
  Calvados:["14"], Cantal:["15"],
  Charente:["16"], Charente_Maritime:["17"],
  Cher:["18"], Correze:["19"],
  Corse_du_Sud:["2A"], Haute_Corse:["2B"],
  Cote_d_Or:["21"], Cotes_d_Armor:["22"],
  Creuse:["23"], Deux_Sevres:["79"],
  Dordogne:["24"], Doubs:["25"], Drome:["26"],
  Eure:["27"], Eure_et_Loir:["28"],
  Finistere:["29"],
  Gard:["30"], Haute_Garonne:["31"], Gers:["32"], Gironde:["33"], Herault:["34"],
  Ille_et_Vilaine:["35"], Indre:["36"], Indre_et_Loire:["37"], Isere:["38"], Jura:["39"],
  Landes:["40"], Loir_et_Cher:["41"], Loire:["42"], Haute_Loire:["43"], Loire_Atlantique:["44"],
  Loiret:["45"], Lot:["46"], Lot_et_Garonne:["47"], Lozere:["48"],
  Maine_et_Loire:["49"], Manche:["50"], Marne:["51"], Haute_Marne:["52"], Mayenne:["53"],
  Meurthe_et_Moselle:["54"], Meuse:["55"], Morbihan:["56"], Moselle:["57"], Nievre:["58"],
  Nord:["59"], Oise:["60"], Orne:["61"], Pas_de_Calais:["62"], Puy_de_Dome:["63"],
  Pyrenees_Atlantiques:["64"], Hautes_Pyrenees:["65"], Pyrenees_Orientales:["66"],
  Rhone:["69"], Haute_Saone:["70"], Saone_et_Loire:["71"], Sarthe:["72"],
  Savoie:["73"], Haute_Savoie:["74"],
  Paris:["75"], Seine_Maritime:["76"], Seine_et_Marne:["77"], Yvelines:["78"],
  Somme:["80"], Tarn:["81"], Tarn_et_Garonne:["82"],
  Var:["83"], Vaucluse:["84"], Vendee:["85"], Vienne:["86"], Haute_Vienne:["87"],
  Vosges:["88"], Yonne:["89"], Territoire_de_Belfort:["90"],
  Essonne:["91"], Hauts_de_Seine:["92"], Seine_Saint_Denis:["93"], Val_de_Marne:["94"], Val_d_Oise:["95"]
};


// ======================================================
// LIBELLÉS POUR UI
// ======================================================
const DEPARTEMENTS_UI = {};
Object.keys(DEPARTEMENT_CP).forEach(k => {
  DEPARTEMENTS_UI[k] =
    k
    .replace(/_/g," ")
    .replace(/Rhone/,"Rhône")
    .replace(/Herault/,"Hérault")
    .replace(/Pyrenees/,"Pyrénées")
    .replace(/Lozere/,"Lozère")
    .replace(/Correze/,"Corrèze")
});


// ======================================================
// composant
// ======================================================
export default function ScraperImmo() {

  const DEPARTEMENTS = Object.keys(DEPARTEMENT_CP);

  // ------- États des filtres -------
  const [departement, setDepartement] = useState("Rhone");
  const [site, setSite] = useState("leboncoin");
  const [prixMin, setPrixMin] = useState(100000);
  const [prixMax, setPrixMax] = useState(400000);
  const [piecesMin, setPiecesMin] = useState(3);
  const [piecesMax, setPiecesMax] = useState(5);
  const [surfaceMin, setSurfaceMin] = useState(50);
  const [terrain, setTerrain] = useState("indifferent");
  const [chauffage, setChauffage] = useState("indifferent");
  const [travaux, setTravaux] = useState("indifferent");
  const [typeBien, setTypeBien] = useState("maison");

  const [terrainMin, setTerrainMin] = useState("");
  const [terrainMax, setTerrainMax] = useState("");
  const [orientation, setOrientation] = useState("indifferent");
  const [anneeMin, setAnneeMin] = useState("");
  const [anneeMax, setAnneeMax] = useState("");
  const [dpe, setDpe] = useState("indifferent");


  const buildSiteUrl = useCallback(() => {

    const cp = DEPARTEMENT_CP[departement] ?? [];
    const cpString = cp.join(",");

    const dptClean = clean(departement);

    // ici ton code URL LBC inchangé
    // …

    return "#";

  }, [departement, prixMin, prixMax, piecesMin, piecesMax, surfaceMin, terrain, chauffage, travaux, typeBien, terrainMin, terrainMax, orientation, anneeMin, anneeMax, dpe]);


  const handleOpenSearch = () => {
    const url = buildSiteUrl();
    window.open(url,"_blank","noopener,noreferrer");
  };


  const previewUrl = useMemo(() => buildSiteUrl(), [buildSiteUrl]);


  return (
    <div>
      <select value={departement} onChange={(e)=>setDepartement(e.target.value)}>
        {DEPARTEMENTS.map(d => (
          <option key={d} value={d}>
            {DEPARTEMENTS_UI[d] || d}
          </option>
        ))}
      </select>

      <button onClick={handleOpenSearch}>Ouvrir</button>

      <div>{previewUrl}</div>
    </div>
  );
}
