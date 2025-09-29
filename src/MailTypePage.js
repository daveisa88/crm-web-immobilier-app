import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./MailTypePage.css"; // 👉 ton CSS externe
import { Link } from "react-router-dom"; // ✅ importer Link

export default function MailTypePage() {
    const [client, setClient] = useState("");
    const [adresse, setAdresse] = useState("");
    const [typeMail, setTypeMail] = useState("R0 - Contact");
    const [date, setDate] = useState("");
    const [heure, setHeure] = useState("10h");
    const [objet, setObjet] = useState("");
    const [corps, setCorps] = useState("");

    const modeles = {
        "R0 - Contact": {
            objet: "Prise de contact avec {CLIENT} – {DATE}",
            corps: `Bonjour {CLIENT},

Suite à votre demande concernant le bien situé au {ADRESSE}, je me permets de vous contacter afin d’échanger sur votre projet immobilier.

Je reste à votre disposition pour convenir d’un premier rendez-vous téléphonique ou physique selon vos disponibilités.

Bien cordialement,
[Votre Nom / Agence]`
        },
        "R1 - Visite découverte": {
            objet: "Confirmation de la visite – {ADRESSE} le {DATE}",
            corps: `Bonjour {CLIENT},

Comme convenu, la visite du bien situé au {ADRESSE} est programmée le {DATE} à {HEURE}.

Merci de bien vouloir me confirmer votre présence ou de me prévenir en cas d’empêchement.

Dans l’attente de notre rencontre, je reste à votre disposition.

Bien à vous,
[Votre Nom / Agence]`
        },
        "R2 - Estimation & Mandat": {
            objet: "Estimation du bien et proposition de mandat – {ADRESSE}",
            corps: `Bonjour {CLIENT},

Veuillez trouver ci-joint l’estimation réalisée pour le bien situé au {ADRESSE}.

Nous pourrons échanger ensemble sur cette évaluation et, si vous le souhaitez, formaliser un mandat de vente afin de mettre votre bien sur le marché dans les meilleures conditions.

Je reste à votre disposition pour toute question.

Bien cordialement,
[Votre Nom / Agence]`
        },
        "Commercialisation": {
            objet: "Mise en commercialisation – {ADRESSE}",
            corps: `Bonjour {CLIENT},

Votre bien situé au {ADRESSE} est désormais en ligne et visible sur nos plateformes partenaires.

Nous ne manquerons pas de vous informer régulièrement des retours des acquéreurs potentiels ainsi que des visites planifiées.

Merci pour votre confiance.

Bien cordialement,
[Votre Nom / Agence]`
        },
        "Qualification acquéreur": {
            objet: "Qualification d’un acquéreur potentiel – {ADRESSE}",
            corps: `Bonjour {CLIENT},

Un acquéreur intéressé par votre bien situé au {ADRESSE} a été identifié.

Nous allons organiser un entretien afin de qualifier son projet et de vérifier sa capacité de financement avant toute proposition d’achat.

Je ne manquerai pas de revenir vers vous avec davantage de détails.

Bien à vous,
[Votre Nom / Agence]`
        },
        "Visites organisées": {
            objet: "Organisation des visites – {ADRESSE} le {DATE}",
            corps: `Bonjour {CLIENT},

Les visites du bien situé au {ADRESSE} sont prévues le {DATE} à partir de {HEURE}.

Nous mettrons tout en œuvre pour valoriser votre bien et recueillir des retours constructifs des acquéreurs potentiels.

Je vous ferai un compte rendu détaillé à l’issue des visites.

Bien cordialement,
[Votre Nom / Agence]`
        },
        "Offre reçue": {
            objet: "Réception d’une offre d’achat – {ADRESSE}",
            corps: `Bonjour {CLIENT},

Nous avons le plaisir de vous informer qu’une offre d’achat a été reçue pour votre bien situé au {ADRESSE}.

Nous reviendrons rapidement vers vous pour en discuter ensemble et analyser les conditions proposées.

Bien à vous,
[Votre Nom / Agence]`
        },
        "Compromis signé": {
            objet: "Signature du compromis – {ADRESSE}",
            corps: `Bonjour {CLIENT},

Le compromis de vente concernant votre bien situé au {ADRESSE} a été signé le {DATE}.

Nous allons désormais préparer les prochaines étapes administratives en vue de l’acte authentique.

Je reste disponible pour toute question.

Bien cordialement,
[Votre Nom / Agence]`
        },
        "Acte authentique": {
            objet: "Signature de l’acte authentique – {ADRESSE}",
            corps: `Bonjour {CLIENT},

Nous vous confirmons que la signature de l’acte authentique pour le bien situé au {ADRESSE} est prévue le {DATE} à {HEURE}.

Toutes nos félicitations pour la concrétisation de cette vente.

Merci pour votre confiance tout au long de ce projet.

Bien à vous,
[Votre Nom / Agence]`
        }
    };

    const getFormattedDate = (date) => {
        if (!date) return "JJ/MM/AAAA";
        const d = new Date(date);
        return isNaN(d) ? "JJ/MM/AAAA" : d.toLocaleDateString("fr-FR");
    };

    const genererMail = () => {
        const dateStr = getFormattedDate(date);
        let objetTpl = modeles[typeMail]?.objet || "{TYPE} – {ADRESSE}";
        let corpsTpl = modeles[typeMail]?.corps || "Message auto";

        const replacements = {
            "{CLIENT}": client,
            "{ADRESSE}": adresse,
            "{DATE}": dateStr,
            "{HEURE}": heure,
            "{TYPE}": typeMail
        };

        for (const token in replacements) {
            objetTpl = objetTpl.replaceAll(token, replacements[token]);
            corpsTpl = corpsTpl.replaceAll(token, replacements[token]);
        }

        setObjet(objetTpl.trim());
        setCorps(corpsTpl.trim());
    };

    const ouvrirOutlook = () => {
        const subject = objet.trim();
        let bodyText = corps.trim();
        bodyText = bodyText.replace(/\n/g, "\r\n");
        const mailto = `mailto:?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailto;
    };

    const exporterPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text("Objet :", 10, 20);
        doc.setFont("helvetica", "normal");
        doc.text(objet, 30, 20);
        doc.setFont("helvetica", "bold");
        doc.text("Corps :", 10, 40);
        doc.setFont("helvetica", "normal");
        const lignes = doc.splitTextToSize(corps, 180);
        doc.text(lignes, 10, 50);
        doc.save("mail_immobilier.pdf");
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("client")) setClient(params.get("client"));
        if (params.get("adresse")) setAdresse(params.get("adresse"));
    }, []);

    return (
        <div style={{ backgroundColor: "#243b55", minHeight: "100vh", padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
            {/* Titre principal */}
            <h1
                style={{
                    textAlign: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "20px",
                    padding: "10px 20px",
                    border: "2px solid #e91e63",
                    borderRadius: "10px",
                    display: "inline-block",
                    background: "#e91e63",
                    boxShadow: "0 4px 10px rgba(233,30,99,0.4)"
                }}
            >
                📧 Générateur de mails - Agent Immobilier
            </h1>

            {/* Bouton retour */}
            <div style={{ textAlign: "center", marginBottom: 30 }}>
                <Link
                    to="/Feuille"
                    style={{
                        backgroundColor: "#e91e63",
                        color: "#fff",
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 3px 8px rgba(233,30,99,0.4)",
                        textDecoration: "none",
                    }}
                >
                    ⬅ Retour à la feuille
                </Link>
            </div>

            {/* Cadre principal */}
            <div
                style={{
                    background: "#2f3e56", // bleu nuit plus clair
                    padding: 40,
                    maxWidth: 1200,
                    margin: "auto",
                    borderRadius: 16,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
                }}
            >
                {/* Formulaire client */}
                <section style={{ marginBottom: 30 }}>
                    {/* Nom du client */}
                    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                        <label style={{ background: "#6c757d", color: "white", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold" }}>
                            👤 Nom du client
                        </label>
                        <input
                            type="text"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "white", color: "#333" }}
                        />
                    </div>

                    {/* Adresse du bien */}
                    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                        <label style={{ background: "#6c757d", color: "white", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold" }}>
                            🏠 Adresse du bien
                        </label>
                        <input
                            type="text"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "white", color: "#333" }}
                        />
                    </div>

                    {/* Étape / Date / Heure */}
                    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr 1fr", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                        <label style={{ background: "#6c757d", color: "white", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold" }}>
                            🔄 Étape
                        </label>
                        <select
                            value={typeMail}
                            onChange={(e) => setTypeMail(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "white", color: "#333" }}
                        >
                            {Object.keys(modeles).map((key) => (
                                <option key={key}>{key}</option>
                            ))}
                        </select>

                        <label style={{ background: "#6c757d", color: "white", padding: "8px 10px", borderRadius: "6px", fontWeight: "bold" }}>
                            📅 Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ width: "90%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "white", color: "#333" }}
                        />

                        <label style={{ background: "#6c757d", color: "white", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold" }}>
                            ⏰ Heure
                        </label>
                        <select
                            value={heure}
                            onChange={(e) => setHeure(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ccc", background: "white", color: "#333" }}
                        >
                            <option>10h</option>
                            <option>12h</option>
                            <option>14h</option>
                            <option>15h30</option>
                            <option>16h</option>
                            <option>18h</option>
                        </select>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "25px" }}>
                        <button
                            onClick={genererMail}
                            style={{
                                backgroundColor: "#4fa3f7",
                                color: "white",
                                padding: "12px 22px",
                                borderRadius: 8,
                                fontWeight: "bold",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 3px 8px rgba(79,163,247,0.4)"
                            }}
                        >
                            📧 Générer le mail
                        </button>
                    </div>
                </section>

                {/* Résultats */}
                <section>
                    {/* Objet */}
                    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                        <label style={{ background: "#6c757d", color: "white", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold" }}>
                            📌 Objet
                        </label>
                        <textarea
                            value={objet}
                            readOnly
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: 8,
                                border: "1px solid #ccc",
                                background: "white",
                                color: "#333",
                                minHeight: "60px"
                            }}
                        />
                    </div>

                    {/* Corps */}
                    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                        <label style={{ background: "#6c757d", color: "white", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold" }}>
                            📝 Corps
                        </label>
                        <textarea
                            value={corps}
                            readOnly
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: 8,
                                border: "1px solid #ccc",
                                background: "white",
                                color: "#333",
                                minHeight: "120px"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                        <button
                            onClick={ouvrirOutlook}
                            style={{
                                backgroundColor: "#1a2a4f",
                                color: "white",
                                padding: "12px 22px",
                                borderRadius: 8,
                                fontWeight: "bold",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 3px 8px rgba(26,42,79,0.4)"
                            }}
                        >
                            📤 Ouvrir dans Outlook
                        </button>
                        <button
                            onClick={exporterPDF}
                            style={{
                                backgroundColor: "#e91e63",
                                color: "white",
                                padding: "12px 22px",
                                borderRadius: 8,
                                fontWeight: "bold",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 3px 8px rgba(233,30,99,0.4)"
                            }}
                        >
                            📄 Exporter PDF
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );



}
