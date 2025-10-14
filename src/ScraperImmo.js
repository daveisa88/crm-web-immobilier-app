// src/ScraperImmo.js
import React, { useMemo, useState } from "react";

export default function ScraperImmo() {
    const [region, setRegion] = useState("Île-de-France");
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tri, setTri] = useState({ key: "viabilite", dir: "desc" });

    const handleScrape = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/scrape?region=${encodeURIComponent(region)}`);
            if (!res.ok) throw new Error("API indisponible");
            const data = await res.json();
            setAnnonces(data);
        } catch (err) {
            alert("❌ " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const sorted = useMemo(() => {
        const arr = [...annonces];
        arr.sort((a, b) => {
            const { key, dir } = tri;
            const mul = dir === "asc" ? 1 : -1;
            return (a[key] - b[key]) * mul;
        });
        return arr;
    }, [annonces, tri]);

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

    return (
        <div
            style={{
                backgroundColor: "#243b55",
                color: "white",
                minHeight: "100vh",
                padding: "40px",
                fontFamily: "Segoe UI",
            }}
        >
            <h1 style={{ textAlign: "center", color: "#e91e63", marginBottom: 20 }}>
                🏡 Scraper Immo — Annonces & Opportunités
            </h1>

            {/* Contrôles */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={select}
                >
                    <option>Île-de-France</option>
                    <option>Auvergne-Rhône-Alpes</option>
                    <option>Provence-Alpes-Côte d’Azur</option>
                    <option>Centre-Val de Loire</option>
                    <option>Grand Est</option>
                    <option>Normandie</option>
                </select>
                <button onClick={handleScrape} disabled={loading} style={btnRun}>
                    {loading ? "🔄 Analyse..." : "🚀 Lancer la recherche"}
                </button>
            </div>

            {/* Meilleurs plans */}
            {meilleursPlans.length > 0 && (
                <div
                    style={{
                        background: "#1a2a4f",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 24,
                    }}
                >
                    <h2 style={{ margin: 0, color: "#2ecc71" }}>💎 Opportunités viables (≥ 8/10)</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginTop: 12 }}>
                        {meilleursPlans.map((a, i) => (
                            <div key={i} style={card}>
                                <div style={{ fontWeight: "bold" }}>{a.titre}</div>
                                <div style={{ opacity: 0.9 }}>{a.ville}</div>
                                <div style={{ marginTop: 6 }}>
                                    <b>{a.prix.toLocaleString()} €</b> — {a.surface} m² —{" "}
                                    <b>{a.prixM2.toLocaleString()} €/m²</b>
                                </div>
                                <div style={{ marginTop: 6, color: a.viabilite >= 8 ? "#2ecc71" : "#f1c40f" }}>
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
                    <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
                        <thead style={{ background: "#1a2a4f" }}>
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
                                    <td style={td}>{a.prix.toLocaleString()}</td>
                                    <td style={td}>{a.surface}</td>
                                    <td style={td}>{a.prixM2.toLocaleString()}</td>
                                    <td style={{ ...td, color: a.viabilite >= 8 ? "#2ecc71" : "#f1c40f" }}>
                                        {a.viabilite}
                                    </td>
                                    <td style={td}>
                                        <a href={a.lien} target="_blank" rel="noreferrer" style={link}>
                                            Voir
                                        </a>
                                    </td>
                                    <td style={{ ...td, opacity: 0.85 }}>{a.source}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Aide */}
            {sorted.length === 0 && !loading && (
                <p style={{ textAlign: "center", opacity: 0.85 }}>
                    ⚠️ Aucun résultat pour l’instant. Choisis une région puis clique “🚀 Lancer la recherche”.
                </p>
            )}
        </div>
    );
}

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
const card = {
    background: "#243b55",
    border: "1px solid #2e4a7d",
    borderRadius: 10,
    padding: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
};
const link = { color: "#4fa3f7", fontWeight: "bold", display: "inline-block", marginTop: 8 };
