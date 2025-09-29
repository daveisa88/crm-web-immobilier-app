import React from "react";
import { useNavigate } from "react-router-dom";

export default function FicheClientPreview() {
    const navigate = useNavigate();

    const buttonStyle = (color) => ({
        background: color,
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    });

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #1a2a4f, #243b55)",
                padding: "40px 20px",
            }}
        >
            {/* Titre */}
            <h2
                style={{
                    background: "#e91e63",
                    display: "inline-block",
                    padding: "10px 25px",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    marginBottom: "30px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                }}
            >
                📄 Aperçu - Fiche Client Immobilier
            </h2>

            {/* Conteneur previews */}
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "auto",
                    background: "#f5f7fa",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                }}
            >
                {/* Image preview 1 */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <img
                        src="/preview1.png"
                        alt="Preview fiche client"
                        style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }}
                    />
                </div>

                {/* Image preview 2 */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <img
                        src="/preview2.png"
                        alt="Preview analyse IA"
                        style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }}
                    />
                </div>

                {/* Vidéo (optionnel, si tu mets ton .mp4 dans /public) */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <video
                        src="/demo.mp4"
                        controls
                        style={{ width: "100%", borderRadius: "10px" }}
                    />
                </div>

                {/* Boutons */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginTop: "30px",
                    }}
                >
                    <button
                        onClick={() => navigate("/abonnement")}
                        style={buttonStyle("#ff9800")}
                    >
                        🔓 Débloquer avec abonnement
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        style={buttonStyle("#4fa3f7")}
                    >
                        ⬅ Retour à l’accueil
                    </button>
                </div>
            </div>
        </div>
    );
}
