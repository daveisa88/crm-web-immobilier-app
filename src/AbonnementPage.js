import React from "react";
import { useNavigate } from "react-router-dom";

export default function AbonnementPage() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: "#243b55", minHeight: "100vh", padding: "40px" }}>
            {/* Titre */}
            <h2
                style={{
                    textAlign: "center",
                    background: "linear-gradient(90deg, #e91e63, #ff4081)",
                    color: "white",
                    padding: "15px 25px",
                    borderRadius: "10px",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    marginBottom: "40px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
            >
                💳 Abonnements - Agent Immobilier
            </h2>

            {/* Conteneur principal */}
            <div
                style={{
                    background: "#7da0e6",
                    padding: "40px",
                    maxWidth: "900px",
                    margin: "auto",
                    borderRadius: "16px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                }}
            >
                {/* Offres */}
                <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
                    {/* Abonnement mensuel */}
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "30px",
                            width: "280px",
                            textAlign: "center",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                        }}
                    >
                        <h3 style={{ color: "#243b55", fontSize: "1.4rem", marginBottom: "15px" }}>
                            📅 Mensuel
                        </h3>
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "10px 0", color: "#e91e63" }}>
                            8,90 € / mois
                        </p>
                        <p style={{ color: "green", fontWeight: "500" }}>✅ Essai gratuit 30 jours</p>
                        <button
                            onClick={() => navigate("/paiement", { state: { abonnement: "mensuel" } })}
                            style={{
                                background: "#4fa3f7",
                                color: "white",
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginTop: "15px",
                            }}
                        >
                            S’abonner
                        </button>
                    </div>

                    {/* Abonnement annuel */}
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "30px",
                            width: "280px",
                            textAlign: "center",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                        }}
                    >
                        <h3 style={{ color: "#243b55", fontSize: "1.4rem", marginBottom: "15px" }}>
                            📅 Annuel
                        </h3>
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "10px 0", color: "#e91e63" }}>
                            95 € / an
                        </p>
                        <p style={{ color: "green", fontWeight: "500" }}>✅ Soit 2 mois offerts</p>
                        <button
                            onClick={() => navigate("/paiement", { state: { abonnement: "annuel" } })}
                            style={{
                                background: "#e91e63",
                                color: "white",
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginTop: "15px",
                            }}
                        >
                            S’abonner
                        </button>
                    </div>
                </div>

                {/* Vidéo présentation */}
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <h3 style={{ color: "#243b55", marginBottom: "20px", fontSize: "1.4rem" }}>
                        🎬 Découvrez notre outil
                    </h3>
                    <video
                        controls
                        style={{ width: "80%", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                    >
                        <source src="demo.mp4" type="video/mp4" />
                        Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                </div>

                {/* Bouton retour */}
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: "#4fa3f7",
                            color: "white",
                            padding: "12px 24px",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        ⬅ Retour à l’accueil
                    </button>
                </div>
            </div>
        </div>
    );
}
