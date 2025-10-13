import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    LabelList,
    Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function StatsPage() {
    const [fiches, setFiches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const snapshot = await getDocs(collection(db, "fiches"));
            const data = snapshot.docs.map((doc) => doc.data());
            setFiches(data);
        };
        fetchData();
    }, []);

    // 🧮 Statistiques globales
    const total = fiches.length;
    const aFaire = fiches.filter((f) => f.statut === "À faire").length;
    const enCours = fiches.filter((f) => f.statut === "En cours").length;
    const fait = fiches.filter((f) => f.statut === "Fait").length;

    // 📊 Répartition par statut
    const dataStatut = [
        { name: "À faire", value: aFaire, color: "#e74c3c" },
        { name: "En cours", value: enCours, color: "#f1c40f" },
        { name: "Fait", value: fait, color: "#2ecc71" },
    ];

    // 📆 Répartition par mois
    const mois = [
        "janv.",
        "févr.",
        "mars",
        "avr.",
        "mai",
        "juin",
        "juil.",
        "août",
        "sept.",
        "oct.",
        "nov.",
        "déc.",
    ];

    const dataMois = mois.map((m, i) => {
        const count = fiches.filter((f) => {
            const d = new Date(f.dateCreation || f.dateRDV);
            return d.getMonth() === i;
        }).length;
        return { mois: m, value: count };
    });

    // 🏆 Fiches “ventes réalisées” (Fait + Acte authentique)
    const ventesParMois = mois.map((m, i) => {
        const related = fiches.filter((f) => {
            const d = new Date(f.dateCreation || f.dateRDV);
            return (
                d.getMonth() === i &&
                f.statut === "Fait" &&
                f.etape?.toLowerCase().includes("acte")
            );
        });
        return { mois: m, value: related.length, details: related };
    });

    // 🔢 Total des ventes réalisées
    const totalVentes = ventesParMois.reduce((sum, item) => sum + item.value, 0);
    const ventesMoisActuel =
        ventesParMois[new Date().getMonth()]?.value || 0;

    // 🏅 Message motivation dynamique
    const messageVentes =
        ventesMoisActuel > 3
            ? {
                texte: `🏆 Excellent mois ! ${ventesMoisActuel} ventes déjà réalisées 🔥`,
                couleur: "#2ecc71",
                emoji: "🥇",
            }
            : ventesMoisActuel === 0
                ? {
                    texte: "💡 Aucune vente ce mois-ci, reste motivé ! Les opportunités arrivent 💪",
                    couleur: "#e67e22",
                    emoji: "🚀",
                }
                : {
                    texte: `📈 ${ventesMoisActuel} vente${ventesMoisActuel > 1 ? "s" : ""
                        } ce mois-ci, continue comme ça ! 💪`,
                    couleur: "#3498db",
                    emoji: "👏",
                };

    // 🎨 Tooltip Statut
    const CustomTooltipStatut = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const statut = payload[0].payload.name;
            const related = fiches.filter((f) => f.statut === statut);

            return (
                <div
                    style={{
                        background: "rgba(255,255,255,0.95)",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                        color: "#333",
                        fontSize: "13px",
                        maxWidth: "260px",
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    <strong style={{ color: "#e91e63", fontSize: "14px" }}>
                        {statut} – {related.length} fiche{related.length > 1 ? "s" : ""}
                    </strong>
                    <hr style={{ margin: "6px 0", border: "0.5px solid #ddd" }} />
                    {related.length > 0 ? (
                        related.map((f, i) => (
                            <div key={i} style={{ marginBottom: "6px" }}>
                                <span style={{ fontWeight: "bold" }}>
                                    {f.numeroContrat || "Sans ID"}
                                </span>
                                <br />
                                <span style={{ color: "#555" }}>
                                    {f.client || f.nomClient || "Client inconnu"}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>Aucune fiche</p>
                    )}
                </div>
            );
        }
        return null;
    };

    // 🎨 Tooltip Ventes
    const CustomTooltipVentes = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const mois = payload[0].payload.mois;
            const related = payload[0].payload.details || [];

            return (
                <div
                    style={{
                        background: "rgba(255,255,255,0.95)",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                        color: "#333",
                        fontSize: "13px",
                        maxWidth: "260px",
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    <strong style={{ color: "#2ecc71", fontSize: "14px" }}>
                        {mois} – {related.length} vente{related.length > 1 ? "s" : ""}
                    </strong>
                    <hr style={{ margin: "6px 0", border: "0.5px solid #ddd" }} />
                    {related.length > 0 ? (
                        related.map((f, i) => (
                            <div key={i} style={{ marginBottom: "6px" }}>
                                <span style={{ fontWeight: "bold" }}>
                                    {f.numeroContrat || "Sans ID"}
                                </span>
                                <br />
                                <span style={{ color: "#555" }}>
                                    {f.client || f.nomClient || "Client inconnu"}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>Aucune vente</p>
                    )}
                </div>
            );
        }
        return null;
    };

    const tileStyle = {
        flex: 1,
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        color: "white",
        fontWeight: "bold",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    };

    return (
        <div
            style={{
                backgroundColor: "#243b55",
                minHeight: "100vh",
                padding: "40px",
                color: "white",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            {/* 🔙 Retour */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    backgroundColor: "#4fa3f7",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginBottom: "30px",
                    boxShadow: "0 3px 6px rgba(79,163,247,0.4)",
                }}
            >
                🔙 Retour
            </button>

            {/* 🏆 Encadré synthèse ventes */}
            <div
                style={{
                    background: messageVentes.couleur,
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "white",
                    fontSize: "18px",
                    marginBottom: "30px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                }}
            >
                {messageVentes.emoji} {messageVentes.texte}
                <div style={{ marginTop: "8px", fontSize: "15px", opacity: 0.9 }}>
                    Total des ventes : {totalVentes}
                </div>
            </div>

            {/* 🧱 Pavés */}
            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                <div style={{ ...tileStyle, backgroundColor: "#3498db" }}>
                    <h3>Total fiches</h3>
                    <p style={{ fontSize: "28px" }}>{total}</p>
                </div>
                <div style={{ ...tileStyle, backgroundColor: "#e74c3c" }}>
                    <h3>À faire</h3>
                    <p style={{ fontSize: "28px" }}>{aFaire}</p>
                </div>
                <div style={{ ...tileStyle, backgroundColor: "#f1c40f" }}>
                    <h3>En cours</h3>
                    <p style={{ fontSize: "28px" }}>{enCours}</p>
                </div>
                <div style={{ ...tileStyle, backgroundColor: "#2ecc71" }}>
                    <h3>Fait</h3>
                    <p style={{ fontSize: "28px" }}>{fait}</p>
                </div>
            </div>

            {/* 📊 Statut */}
            <h3
                style={{
                    textAlign: "center",
                    color: "#e91e63",
                    marginTop: "50px",
                    marginBottom: "20px",
                }}
            >
                Répartition par Statut
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataStatut}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4f" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltipStatut />} />
                    <Legend />
                    <Bar dataKey="value" name="Nombre de fiches">
                        {dataStatut.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="insideTop"
                            style={{ fill: "white", fontWeight: "bold" }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* 📆 Fiches créées */}
            <h3
                style={{
                    textAlign: "center",
                    color: "#e91e63",
                    marginTop: "40px",
                    marginBottom: "10px",
                }}
            >
                Nombre de fiches enregistrées par mois
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataMois}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4f" />
                    <XAxis dataKey="mois" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Fiches créées" fill="#4fa3f7">
                        <LabelList
                            dataKey="value"
                            position="insideTop"
                            style={{ fill: "white", fontWeight: "bold" }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* 🏆 Ventes réalisées */}
            <h3
                style={{
                    textAlign: "center",
                    color: "#e91e63",
                    marginTop: "50px",
                    marginBottom: "10px",
                }}
            >
                Ventes réalisées par mois (Actes authentiques)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ventesParMois}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4f" />
                    <XAxis dataKey="mois" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltipVentes />} />
                    <Bar dataKey="value" name="Actes authentiques" fill="#2ecc71">
                        <LabelList
                            dataKey="value"
                            position="insideTop"
                            style={{ fill: "white", fontWeight: "bold" }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
