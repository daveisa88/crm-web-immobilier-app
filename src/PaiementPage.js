import React from "react";
import { useNavigate } from "react-router-dom";

function PaiementPage() {
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
                💳 Paiement Abonnement
            </h2>

            {/* Conteneur principal */}
            <div
                style={{
                    background: "#7da0e6",
                    padding: "40px",
                    maxWidth: "700px",
                    margin: "auto",
                    borderRadius: "16px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "white", fontSize: "1.2rem", marginBottom: "20px" }}>
                    Merci de finaliser votre abonnement via PayPal :
                </p>

                {/* Formulaire PayPal */}
                <form
                    action="https://www.paypal.com/cgi-bin/webscr"
                    method="post"
                    target="_top"
                    style={{ marginBottom: "30px" }}
                >
                    <input type="hidden" name="cmd" value="_s-xclick" />
                    <input type="hidden" name="hosted_button_id" value="6Q2F9Q7395L2W" />

                    <label style={{ fontWeight: "bold", color: "#243b55", marginBottom: "10px", display: "block" }}>
                        Choisissez votre abonnement :
                    </label>
                    <select name="os0" style={{ padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
                        <option value="Abonnement 1 mois">Abonnement 1 mois - 8,90 €</option>
                        <option value="Abonnement 1 an">Abonnement 1 an - 95 €</option>
                        <option value="gratuit 30 jours">Essai gratuit 30 jours</option>
                    </select>

                    <input type="hidden" name="currency_code" value="EUR" />
                    <input
                        type="image"
                        src="https://www.paypalobjects.com/fr_FR/i/btn/btn_subscribe_LG.gif"
                        border="0"
                        name="submit"
                        title="PayPal, votre réflexe sécurité pour payer en ligne."
                        alt="Souscrire"
                    />
                </form>

                {/* Bouton retour */}
                <button
                    onClick={() => navigate("/abonnement")}
                    style={{
                        background: "#4fa3f7",
                        color: "white",
                        padding: "12px 24px",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "20px",
                    }}
                >
                    ⬅ Retour aux abonnements
                </button>
            </div>
        </div>
    );
}

export default PaiementPage;
