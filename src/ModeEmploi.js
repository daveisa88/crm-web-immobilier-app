import React from "react";
import { useNavigate } from "react-router-dom";

export default function ModeEmploi() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: "#f4f6fb", minHeight: "100vh", padding: "30px" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: "#e91e63",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
                    }}
                >
                    ⬅ Retour
                </button>
            </div>

            <div style={{
                maxWidth: "900px",
                margin: "auto",
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
            }}>
                <h1 style={{ color: "#1a2a4f", textAlign: "center", marginBottom: "30px" }}>
                    📘 Mode d’emploi – Fiche Client Immobilier
                </h1>

                <h2 style={{ color: "#e91e63" }}>1. Introduction</h2>
                <p>
                    Cet outil permet aux agents et mandataires immobiliers de gérer facilement leurs fiches clients,
                    générer des mails types, comparer des annonces, et accéder rapidement à des ressources utiles
                    (cadastre, simulateur de prêt, calculateur de frais de notaire, etc.).
                </p>

                <h2 style={{ color: "#1a2a4f" }}>2. Fonctionnalités principales</h2>
                <ul>
                    <li>📝 Créer et gérer des fiches clients</li>
                    <li>📧 Générer automatiquement des mails types</li>
                    <li>📊 Comparer plusieurs annonces PDF grâce à l’IA</li>
                    <li>🤖 Analyser une annonce en un clic</li>
                    <li>📂 Sauvegarder et consulter toutes vos fiches</li>
                </ul>

                <h2 style={{ color: "#e91e63" }}>3. Navigation</h2>
                <p>Depuis l’accueil :</p>
                <ul>
                    <li>🔑 <b>Connexion</b> → Login</li>
                    <li>📄 <b>Fiche Client</b> → FeuilleForm</li>
                    <li>📘 <b>Mode d’emploi</b> → Ce guide</li>
                    <li>💳 <b>Abonnement</b> → Page abonnement</li>
                </ul>

                <h2 style={{ color: "#1a2a4f" }}>4. Astuces</h2>
                <p>
                    ✅ Sauvegardez régulièrement vos fiches
                    ✅ Utilisez les modèles de mails pour gagner du temps
                    ✅ Testez l’IA pour vos comparaisons et analyses
                </p>
            </div>
        </div>
    );
}
