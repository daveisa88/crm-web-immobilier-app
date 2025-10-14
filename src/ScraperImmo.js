// src/ScraperImmo.js
import React, { useMemo, useState } from "react";

export default function ScraperImmo() {
    const [departement, setDepartement] = useState("Rhône");
    const [prixMin, setPrixMin] = useState("");
    const [prixMax, setPrixMax] = useState("");
    const [medianRef, setMedianRef] = useState(null);
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tri, setTri] = useState({ key: "viabilite", dir: "desc" });

    // Lancement de la recherche
    const handleScrape = async () => {
        setLoading(true);
        setAnnonces([]);
        setMedianRef(null);
        try {
            const params = new URLSearchParams({
                departement,
                prixMin: prixMin || 0,
                prixMax: prixMax || 10000000,
            });
            const res = await fetch(`/api/scrape?${params.toString()}`);
            if (!res.ok) throw new Error("API indisponible ou quota atteint");

            const data = await res.json();

            // On récupère la référence médiane si renvoyée (Etalab)
            if (data.medianRef) setMedianRef(data.medianRef);
            else if (data[0]?.refM2) setMedianRef(data[0].refM2);

            setAnnonces(data.annonces || data);
        } catch (err) {
            alert("❌ " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Tri dynamique
    const sorted = useMemo(() => {
        const arr = [...annonces];
        const { key, dir } = tri;
        const mul = dir === "asc" ? 1 : -1;
        arr.sort((a, b) => {
            if (typeof a[key] === "string") return a[key].localeCompare(b[key]) * mul;
            return (a[key] - b[key]) * mul;
        });
        return arr;
    }, [annonces, tri]);

    // Sélection meilleures opportunités
    const meilleursPlans = useMemo(
        () => sorted.filter((a) => a.viabilite >= 8).slice(0, 6),
        [sorted]
    );

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

    const DEPARTEMENTS = [
        "Ain","Aisne","Allier","Alpes-de-Haute-Provence","Hautes-Alpes","Alpes-Maritimes","Ardèche","Ardennes",
        "Ariège","Aube","Aude","Aveyron","Bas-Rhin","Haut-Rhin","Bouches-du-Rhône","Calvados","Cantal","Charente",
        "Charente-Maritime","Cher","Corrèze","Corse-du-Sud","Haute-Corse","Côte-d'Or","Côtes-d'Armor","Creuse",
        "Deux-Sèvres","Dordogne","Doubs","Drôme","Eure","Eure-et-Loir","Finistère","Gard","Haute-Garonne","Gers",
        "Gironde","Hérault","Ille-et-Vilaine","Indre","Indre-et-Loire","Isère","Jura","Landes","Loir-et-Cher",
        "Loire","Haute-Loire","Loire-Atlantique","Loiret","Lot","Lot-et-Garonne","Lozère","Maine-et-Loire","Manche",
        "Marne","Haute-Marne","Mayenne","Meurthe-et-Moselle","Meuse","Morbihan","Moselle","Nièvre","Nord","Oise",
        "Orne","Pas-de-Calais","Puy-de-Dôme","Pyrénées-Atlantiques","Hautes-Pyrénées","Pyrénées-Orientales","Rhône",
        "Haute-Saône","Saône-et-Loire","Sarthe","Savoie","Haute-Savoie","Paris","Seine-Maritime","Seine-et-Marne",
        "Yvelines","Somme","Tarn","Tarn-et-Garonne","Var","Vaucluse","Vendée","Vienne","Haute-Vienne","Vosges",
        "Yonne","Territoire de Belfort","Essonne","Hauts-de-Seine","Seine-Saint-Denis","Val-de-Marne","Val-d'Oise"
    ];

    return (
        <div style={page}>
            <h1 style={title}>🏡 Scraper Immo — Annonces & Opportunités (par Département)</h1>

            {/* Contrôles */}
            <div style={controls}>
                <select value={departement} onChange={(e) => setDepartement(e.target.value)} style={select}>
                    {DEPARTEMENTS.map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Prix min €"
                    value={prixMin}
                    onChange={(e) => setPrixMin(e.target.value)}
                    style={input}
                />
                <input
                    type="number"
                    placeholder="Prix max €"
                    value={prixMax}
                    onChange={(e) => setPrixMax(e.target.value)}
                    style={input}
                />
                <button onClick={handleScrape} disabled={loading} style={btnRun}>
                    {loading ? "🔄 Analyse..." : "🚀 Lancer la recherche"}
                </button>
            </div>

            {/* Prix marché */}
            {medianRef && (
                <p style={{ textAlign: "center", color: "#f39c12", fontWeight: "bold" }}>
                    📊 Prix médian marché (Etalab) pour {departement} : {medianRef.toLocaleString()} €/m²
                </p>
            )}

            {/* Meilleurs plans */}
            {meilleursPlans.length > 0 && (
                <div style={bestBlock}>
                    <h2 style={{ margin: 0, color: "#2ecc71" }}>💎 Opportunités viables (≥ 8/10)</h2>
                    <div style={grid}>
                        {meilleursPlans.map((a, i) => (
                            <div key={i} style={card}>
                                <div style={{ fontWeight: "bold" }}>{a.titre}</div>
                                <div style={{ opacity: 0.9 }}>{a.departement}</div>
                                <div style={{ marginTop: 6 }}>
                                    <b>{a.prix.toLocaleString()} €</b> — {a.surface} m² —{" "}
                                    <b>{a.prixM2.toLocaleString()} €/m²</b>
                                </div>
                                <div
                                    style={{
                                        marginTop: 6,
                                        color: a.viabilite >= 8 ? "#2ecc71" : "#f1c40f",
                                    }}
                                >
                                    Viabilité : {a.viabilite}/10
                                </div>
                                <a href={a.lien} target="_blank" rel="noreferrer" style={link}>
                                    Ouvrir l’annonce →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tableau complet */}
            {sorted.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                    <table style={table}>
                        <thead style={{ background: "#1a2a4f" }}>
                            <tr>
                                {header("Titre", "titre")}
                                {header("Département", "departement")}
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
                                    <td style={td}>{a.departement}</td>
                                    <td style={td}>{a.prix.toLocaleString()}</td>
                                    <td style={td}>{a.surface}</td>
                                    <td style={td}>{a.prixM2.toLocaleString()}</td>
                                    <td style={{ ...td, color: a.viabilite >= 8 ? "#2ecc71" : "#f1c40f" }}>
                                        {a.viabilite}
                                    </td>
                                    <td style={td}><a href={a.lien} target="_blank" rel="noreferrer" style={link}>Voir</a></td>
                                    <td style={{ ...td, opacity: 0.85 }}>{a.source}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {sorted.length === 0 && !loading && (
                <p style={{ textAlign: "center", opacity: 0.85 }}>
                    ⚠️ Aucun résultat pour l’instant. Choisis un département puis clique “🚀 Lancer la recherche”.
                </p>
            )}
        </div>
    );
}

// === Styles ===
const page = { backgroundColor: "#243b55", color: "white", minHeight: "100vh", padding: "40px", fontFamily: "Segoe UI" };
const title = { textAlign: "center", color: "#e91e63", marginBottom: 20 };
const controls = { textAlign: "center", marginBottom: 24, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10 };
const select = { padding: "10px 16px", borderRadius: 8, fontSize: 16, background: "#4fa3f7", color: "white", border: "none" };
const input = { padding: "10px 12px", borderRadius: 8, border: "none", width: 120, fontSize: 15 };
const btnRun = { padding: "10px 18px", borderRadius: 8, backgroundColor: "#3f6628", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" };
const th = { padding: 10, textAlign: "left", borderBottom: "2px solid #4fa3f7", cursor: "pointer" };
const td = { padding: 10, borderBottom: "1px solid #3b4f7f", verticalAlign: "top" };
const table = { width: "100%", borderCollapse: "collapse", color: "#fff" };
const bestBlock = { background: "#1a2a4f", borderRadius: 12, padding: 16, marginBottom: 24 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginTop: 12 };
const card = { background: "#243b55", border: "1px solid #2e4a7d", borderRadius: 10, padding: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" };
const link = { color: "#4fa3f7", fontWeight: "bold", display: "inline-block", marginTop: 8 };
