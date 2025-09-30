import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AccueilPage() {
    const navigate = useNavigate();

    // ✅ Messages marketing dynamiques
    const messages = [
        "🚀 Gérez vos fiches clients immobiliers facilement !",
        "📊 Comparez les annonces grâce à l’IA.",
        "🔐 Profitez de 30 jours gratuits avant abonnement.",
        "💼 Outil pensé pour agents et mandataires.",
        "💶 Moins de 10 € par mois pour simplifier ton quotidien.",
        "📑 Documents toujours mis à jour selon les nouvelles règles immobilières.",
        "🤖 Analyse automatique des annonces en un clic.",
        "🗂️ Classement intelligent de vos clients et biens.",
        "📅 Gagnez du temps avec la planification intelligente.",
        "📈 Suivez vos performances avec nos tableaux de bord.",
        "☁️ Tout est sauvegardé et accessible depuis n’importe où.",
        "✅ Une solution simple, rapide et sans prise de tête."
    ];

    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [messages.length]);

    // ✅ Style générique pour les boutons
    const buttonStyle = (bgColor) => ({
        background: bgColor,
        color: "white",
        padding: "14px 28px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "16px",
        width: "240px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        transition: "0.3s",
    });

    return (
        <div style={{
            background: "linear-gradient(135deg, #1a2a4f, #243b55)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
            padding: "0"
        }}>
            {/* ✅ Bannière pub dynamique en full width */}
            <div style={{
                background: "#e91e63",
                width: "100%",
                padding: "15px 0",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "20px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                marginBottom: "40px",
            }}>
                {messages[currentMessage]}
            </div>

            {/* Logo + titre */}
            <h1 style={{ fontSize: "32px", marginBottom: "30px", maxWidth: "900px" }}>
                🏡 Bienvenue sur notre CRM simple et fun, conçu pour vous libérer des tâches répétitives et rendre votre travail plus fluide.
            </h1>

            {/* ✅ Boutons navigation */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                <button
                    onClick={() => navigate("/mode-emploi")}
                    style={{
                        backgroundColor: "#4fa3f7",
                        color: "#fff",
                        padding: "12px 22px",   // ✅ plus petit que 12px 22px
                        borderRadius: 6,
                        fontWeight: "bold",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",      // ✅ texte plus petit
                        width: "300px",        // ✅ largeur réduite
                    }}
                >
                    📘 Mode d'emploi
                </button>

                <button onClick={() => navigate("/login")} style={buttonStyle("#e91e63")}>🔑 Connexion</button>
                <button onClick={() => navigate("/fiche-preview")} style={buttonStyle("#1a2a4f")}>📄 Fiche Client</button>
                <button onClick={() => navigate("/abonnement")} style={buttonStyle("#ff9800")}>💳 Abonnement</button>
            </div>
        </div>
    );
}

export default AccueilPage;
