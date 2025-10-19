import React, { useMemo, useState } from "react";

// ======================================================
// 🏡 Scraper Immo Pro — Front (React) + Back (/api/scrape)
// ======================================================

export default function ScraperImmo() {
    const [departement, setDepartement] = useState("Rhône");
    const [annonces, setAnnonces] = useState([]);
    const [median, setMedian] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tri, setTri] = useState({ key: "viabilite", dir: "desc" });
    const [error, setError] = useState(null);

    // === Nouvelle constante provider ===
    const [provider] = useState("seloger");

    // === Lancer la recherche ===
    const handleScrape = async () => {
        setLoading(true);
        setAnnonces([]);
        setError(null);

        try {
            const res = await fetch(
                `/api/scrape?departement=${encodeURIComponent(departement)}&provider=${provider}`
            );
            if (!res.ok) throw new Error("API indisponible ou quota atteint");
            const data = await res.json();
            if (data.error) throw new Error(data.message);
            setAnnonces(data.annonces || []);
            setMedian(data.medianRef || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // === Tri dynamique ===
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

    // === Liste des départements ===
    const DEPARTEMENTS = [
        "Ain", "Aisne", "Allier", "Alpes-de-Haute-Provence", "Hautes-Alpes", "Alpes-Maritimes",
        "Ardèche", "Ardennes", "Ariège", "Aube", "Aude", "Aveyron", "Bas-Rhin", "Haut-Rhin",
        "Bouches-du-Rhône", "Calvados", "Cantal", "Charente", "Charente-Maritime", "Cher",
        "Corrèze", "Corse-du-Sud", "Haute-Corse", "Côte-d'Or", "Côtes-d'Armor", "Creuse",
        "Deux-Sèvres", "Dordogne", "Doubs", "Drôme", "Eure", "Eure-et-Loir", "Finistère",
        "Gard", "Haute-Garonne", "Gers", "Gironde", "Hérault", "Ille-et-Vilaine", "Indre",
        "Indre-et-Loire", "Isère", "Jura", "Landes", "Loir-et-Cher", "Loire", "Haute-Loire",
        "Loire-Atlantique", "Loiret", "Lot", "Lot-et-Garonne", "Lozère", "Maine-et-Loire",
        "Manche", "Marne", "Haute-Marne", "Mayenne", "Meurthe-et-Moselle", "Meuse",
        "Morbihan", "Moselle", "Nièvre", "Nord", "Oise", "Orne", "Pas-de-Calais", "Puy-de-Dôme",
        "Pyrénées-Atlantiques", "Hautes-Pyrénées", "Pyrénées-Orientales", "Rhône",
        "Haute-Saône", "Saône-et-Loire", "Sarthe", "Savoie", "Haute-Savoie", "Paris",
        "Seine-Maritime", "Seine-et-Marne", "Yvelines", "Somme", "Tarn", "Tarn-et-Garonne",
        "Var", "Vaucluse", "Vendée", "Vienne", "Haute-Vienne", "Vosges", "Yonne",
        "Territoire de Belfort", "Essonne", "Hauts-de-Seine", "Seine-Saint-Denis",
        "Val-de-Marne", "Val-d'Oise"
    ];

    return (
        <div style={page}>
            {/* === Titre principal === */}
            <h1 style={title}>
                🏡 Scraper Immo Pro — France
            </h1>

            {/* === Zone de recherche === */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <select
                    value={departement}
                    onChange={(e) => setDepartement(e.target.value)}
                    style={select}
                >
                    {DEPARTEMENTS.map((dep) => (
                        <option key={dep} value={dep}>
                            {dep}
                        </option>
                    ))}
                </select>

                <button onClick={handleScrape} disabled={loading} style={btnRun}>
                    {loading ? "🔄 Analyse en cours..." : "🚀 Lancer"}
                </button>
            </div>

            {/* === Prix médian marché === */}
            {median && (
                <p style={medianText}>
                    📊 Prix médian marché (Etalab) pour <b>{departement}</b> :{" "}
                    <b>{median.toLocaleString()} €/m²</b>
                </p>
            )}

            {/* === Message d’erreur === */}
            {error && (
                <p style={{ textAlign: "center", color: "#e74c3c", marginBottom: 20 }}>
                    ❌ {error}
                </p>
            )}

            {/* === Tableau des résultats === */}
            {sorted.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
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
                                <tr
                                    key={i}
                                    style={{
                                        background: i % 2 ? "#2b3f66" : "#334c7a",
                                    }}
                                >
                                    <td style={td}>{a.titre}</td>
                                    <td style={td}>{a.ville}</td>
                                    <td style={td}>{a.prix?.toLocaleString()}</td>
                                    <td style={td}>{a.surface}</td>
                                    <td style={td}>{a.prixM2?.toLocaleString()}</td>
                                    <td
                                        style={{
                                            ...td,
                                            color:
                                                a.viabilite >= 8
                                                    ? "#2ecc71"
                                                    : a.viabilite >= 5
                                                        ? "#f1c40f"
                                                        : "#e74c3c",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {a.viabilite}
                                    </td>
                                    <td style={td}>
                                        <a
                                            href={a.lien}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={link}
                                        >
                                            🔗 Voir
                                        </a>
                                    </td>
                                    <td style={{ ...td, opacity: 0.85 }}>{a.source}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading &&
                !error && (
                    <p style={{ textAlign: "center", opacity: 0.8 }}>
                        ⚠️ Aucun résultat pour l’instant. Choisis un département puis clique “🚀 Lancer”.
                    </p>
                )
            )}
        </div>
    );
}

// === Styles ===
const page = {
    backgroundColor: "#243b55",
    color: "white",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Segoe UI",
};
const title = {
    textAlign: "center",
    color: "#e91e63",
    marginBottom: 20,
};
const select = {
    padding: "10px 16px",
    borderRadius: 8,
    fontSize: 16,
    background: "#4fa3f7",
    color: "white",
    border: "none",
};
const btnRun = {
    marginLeft: 12,
    padding: "10px 18px",
    borderRadius: 8,
    backgroundColor: "#3f6628",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
};
const table = {
    width: "100%",
    borderCollapse: "collapse",
    color: "#fff",
    marginTop: 20,
};
const thead = { background: "#1a2a4f" };
const th = {
    padding: 10,
    textAlign: "left",
    borderBottom: "2px solid #4fa3f7",
    cursor: "pointer",
};
const td = {
    padding: 10,
    borderBottom: "1px solid #3b4f7f",
    verticalAlign: "top",
};
const link = {
    color: "#4fa3f7",
    fontWeight: "bold",
    textDecoration: "none",
};
const medianText = {
    textAlign: "center",
    color: "#f1c40f",
    fontWeight: "bold",
    fontSize: 18,
};
