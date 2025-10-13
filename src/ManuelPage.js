// src/ManuelPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManuelPage() {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const toggleSection = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // 🌍 Sites de recherche immobilière
    const immobilierSites = [
        {
            title: "🏠🇫🇷 France",
            links: [
                { text: "🏠 Leboncoin", url: "https://www.leboncoin.fr" },
                { text: "🏠 SeLoger", url: "https://www.seloger.com" },
                { text: "🏠 Bien'ici", url: "https://www.bienici.com" },
                { text: "🏠 PAP", url: "https://www.pap.fr" },
                { text: "🏠 Logic-Immo", url: "https://www.logic-immo.com" },
                { text: "🏠 ParuVendu", url: "https://www.paruvendu.fr" },
                { text: "🏠 EntreParticuliers", url: "https://www.entreparticuliers.com" },
            ],
        },
        {
            title: "🏡🇧🇪 Belgique",
            links: [
                { text: "🏡 Immoweb", url: "https://www.immoweb.be" },
                { text: "🏡 Zimmo", url: "https://www.zimmo.be" },
                { text: "🏡 Immoscoop", url: "https://www.immoscoop.be" },
                { text: "🏡 Realo", url: "https://www.realo.be" },
                { text: "🏡 Dewaele", url: "https://www.dewaele.com" },
                { text: "🏡 ERA Belgique", url: "https://www.era.be" },
                { text: "🏡 Rentola Belgique", url: "https://www.rentola.be" },
            ],
        },
        {
            title: "💵🇨🇭 Suisse",
            links: [
                { text: "💵 ImmoScout24", url: "https://www.immoscout24.ch" },
                { text: "💵 Homegate", url: "https://www.homegate.ch" },
                { text: "💵 Anibis Immobilier", url: "https://www.anibis.ch" },
                { text: "💵 Comparis Immobilier", url: "https://fr.comparis.ch/immobilien" },
                { text: "💵 ImmoStreet", url: "https://www.immostreet.ch" },
                { text: "💵 Immobilier.ch", url: "https://www.immobilier.ch" },
            ],
        },
        {
            title: "🏰🇱🇺 Luxembourg",
            links: [
                { text: "🏰 atHome", url: "https://www.athome.lu" },
                { text: "🏰 Immotop", url: "https://www.immotop.lu" },
                { text: "🏰 Wortimmo", url: "https://www.wortimmo.lu" },
                { text: "🏰 Habiter", url: "https://www.habiter.lu" },
                { text: "🏰 Selfhome", url: "https://www.selfhome.lu" },
            ],
        },
    ];

    // 🧰 Toutes les autres sections
    const sections = [
        {
            title: "📘 Déontologie & Cadre légal",
            links: [
                { text: "📄 Enquête accès aux droits", url: "https://www.dropbox.com/scl/fi/j1zhrcmqu5mwnm8x14uks/Enquete-acces-aux-droits-Les-discriminations-dans-lacces-au-logement.pdf?dl=0" },
                { text: "📘 Résumé Déontologie", url: "https://www.dropbox.com/scl/fi/ey399diiav6ovzz8qr94j/Latelier-immo-RESUME-DEONTOLOGIE.pdf?dl=0" },
                { text: "💬 Défense des honoraires", url: "https://www.dropbox.com/scl/fi/50aayn9cum1zvp9luo0jk/Texte-de-defense-des-honoraires.pdf?dl=0" },
            ],
        },
        {
            title: "🗂️ Procédures & Rendez-vous",
            links: [
                { text: "🗓️ Procédure RDV", url: "https://www.dropbox.com/scl/fi/50aayn9cum1zvp9luo0jk/Texte-de-defense-des-honoraires.pdf?dl=0" },
                { text: "📄 Résumé RDV Client R1", url: "https://www.dropbox.com/scl/fi/91l6pxguzzgwraqk5mdrc/Resume-premier-rdv-client-R1.pdf?dl=0" },
                { text: "🧾 Résumé R2", url: "https://www.dropbox.com/scl/fi/2t6whljq1ynrgp8oxig0c/Latelier-immo-RESUME-R2-1.pdf?dl=0" },
                { text: "📋 Résumé Offre", url: "https://www.dropbox.com/scl/fi/f3pddt8dsvorgw0cplm54/Resume-OFFRE-Latelier-immo.pdf?dl=0" },
            ],
        },
        {
            title: "📑 Documents de transaction",
            links: [
                { text: "📄 Mandat non exclusif", url: "https://www.dropbox.com/scl/fi/7bs7igpu0x9w9vg6sk5m1/2-Modele-mandat-vente-non-exclusif-format-PDF.pdf?dl=0" },
                { text: "🏡 Fiche bien", url: "https://www.dropbox.com/scl/fi/sqya93wtwwsebua66193m/Fiche-decouverte-du-bien.pdf?dl=0" },
                { text: "🧑‍💼 Fiche vendeur", url: "https://www.dropbox.com/scl/fi/hlprclzdzf6j533cwyp60/Fiche-decouverte-vendeur.pdf?dl=0" },
                { text: "🧍 Fiche acquéreur", url: "https://www.dropbox.com/scl/fi/mrmbu66p7cac0xlne33cm/fiche-decouverte-acquereur.pdf?dl=0" },
            ],
        },
        {
            title: "📊 Études & Outils stratégiques",
            links: [
                { text: "📊 Étude marché agence", url: "https://www.dropbox.com/scl/fi/2eu1iyhjr0e0ssepov9my/etude-marche-agence-immobiliere.pdf?dl=0" },
                { text: "📷 Checklist Photos", url: "https://example.com/checklist-photos.pdf" },
            ],
        },
        {
            title: "💰 Outils d’analyse de prix immobilier",
            links: [
                { text: "📍 Quel Prix Immo", url: "https://app.quelpriximmo.fr/" },
                { text: "📊 Etalab Transactions", url: "https://datafoncier.cerema.fr/" },
                { text: "📑 PERVAL Notaires", url: "https://www.perval.fr/" },
                { text: "📈 Sector", url: "https://www.sector.immo/" },
                { text: "📐 Cadastre.com", url: "https://www.cadastre.com/" },
            ],
        },
        {
            title: "🗺️ Données cadastrales et foncières",
            links: [
                { text: "📌 Cadastre officiel", url: "https://cadastre.data.gouv.fr/" },
                { text: "💶 Impots.gouv (Valeurs foncières)", url: "https://www.impots.gouv.fr/portail/" },
                { text: "🌍 Etalab DVF", url: "https://datafoncier.cerema.fr/dvf" },
            ],
        },
        {
            title: "🔄 Entre RDV 1 & RDV 2",
            links: [
                { text: "🔍 Reprise estimation", url: "https://app.quelpriximmo.fr/" },
                { text: "📊 Données notariales", url: "https://www.perval.fr/" },
                { text: "🗺️ Surface / bornage", url: "https://www.cadastre.com/" },
                { text: "📥 Transactions DVF", url: "https://data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/" },
                { text: "📇 CRM interne", url: "#" },
            ],
        },
        {
            title: "🧾 Frais & Mandats",
            links: [
                { text: "💰 CAFPI – Frais de notaire", url: "https://www.cafpi.fr/" },
                { text: "🆔 PROTEXA – Mandats & registre", url: "https://www.protexa.fr/" },
                { text: "📥 DataFoncier – Transactions", url: "https://datafoncier.cerema.fr/" },
            ],
        },
        {
            title: "🌐 Prospection intelligente",
            links: [
                { text: "Urban-Ease", url: "https://urbanease.io/" },
                { text: "Telesco", url: "https://www.telesco.fr" },
                { text: "Prospectis", url: "https://prospectis.immo/" },
                { text: "Geo Prospect", url: "https://www.geoprospect.fr" },
            ],
        },
        {
            title: "🧠 Bases de données",
            links: [
                { text: "Ideabase", url: "https://www.ideactif-md.com/" },
                { text: "Cartegie", url: "https://www.cartegie.com" },
                { text: "Zecible", url: "https://www.zecible.fr" },
                { text: "AllMySMS", url: "https://www.allmysms.com" },
            ],
        },
        {
            title: "💬 Envois SMS & Emails",
            links: [
                { text: "Mailing Vox", url: "https://www.mailingvox.com" },
                { text: "Octopush", url: "https://www.octopush.com" },
                { text: "AllMySMS", url: "https://www.allmysms.com" },
            ],
        },
        {
            title: "📣 Marketing immobilier",
            links: [
                { text: "Marketing Immo", url: "https://www.marketing-immo.fr/" },
                { text: "Taktik Immo", url: "https://www.taktikimmo.com" },
                { text: "Direct Mandat", url: "https://www.directmandat.com/" },
                { text: "Pige Online", url: "https://www.pige-online.fr/" },
            ],
        },
        {
            title: "🏠 Estimation assistée",
            links: [
                { text: "Casafari", url: "https://fr.casafari.com/" },
                { text: "Pricehubble", url: "https://www.pricehubble.com" },
                { text: "ImmoData", url: "https://www.immo-data.fr" },
                { text: "Meilleurs Agents", url: "https://www.meilleursagents.com" },
                { text: "Pappers", url: "https://www.pappers.fr" },
            ],
        },
        {
            title: "🏡 Home Staging (IA)",
            links: [
                { text: "Hoqi", url: "https://www.hoqi.app" },
                { text: "Gepetto AI", url: "https://www.gepetto.ai" },
                { text: "Flaash", url: "https://flaash.ai/" },
                { text: "Interieur AI", url: "https://www.interieur.ai" },
            ],
        },
        {
            title: "🚪 Visites virtuelles",
            links: [
                { text: "Matterport", url: "https://www.matterport.com" },
                { text: "EyeSpy360", url: "https://www.eyespy360.com" },
                { text: "Klapty", url: "https://www.klapty.com" },
                { text: "Giraffe360", url: "https://www.giraffe360.com" },
            ],
        },
        {
            title: "📚 Lecture PDF & IA",
            links: [
                { text: "ILovePDF", url: "https://www.ilovepdf.com" },
                { text: "AskYourPDF", url: "https://askyourpdf.com" },
                { text: "UPDF AI", url: "https://updf.com/fr/ai" },
                { text: "ChatDOC", url: "https://www.chatdoc.com" },
            ],
        },
        {
            title: "📱 Réseaux & contenus",
            links: [
                { text: "Canva", url: "https://www.canva.com" },
                { text: "Cocoon Immo", url: "https://cocoon.immo" },
                { text: "Adobe Express", url: "https://www.adobe.com/express" },
                { text: "Metricool", url: "https://metricool.com" },
                { text: "Meta Business Suite", url: "https://business.facebook.com" },
            ],
        },
    ];

    // 🧩 Regroupement principal
    const allSections = [
        { title: "🌍 Sites de recherche immobilière", children: immobilierSites },
        { title: "🧰 Outils & Documents", children: sections },
    ];

    return (
        <div style={{ padding: "30px", backgroundColor: "#243b55", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
            {/* 🏷️ Titre */}
            <h1 style={{
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
                marginBottom: "24px",
                padding: "12px 16px",
                border: "2px solid #e91e63",
                borderRadius: "10px",
                background: "#e91e63",
                boxShadow: "0 3px 8px rgba(233,30,99,0.35)"
            }}>
                🧰 Boîte à outils – Tous les liens utiles pour une bonne vente
            </h1>

            {/* 🔙 Retour */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: "#e91e63",
                        color: "white",
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 3px 8px rgba(233,30,99,0.35)",
                    }}
                >
                    🔙 Retour à la feuille
                </button>
            </div>

            {/* Accordéons */}
            <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                {allSections.map((block, blockIndex) => (
                    <div
                        key={blockIndex}
                        style={{
                            backgroundColor: "#f0f6ff",
                            borderLeft: "6px solid #1a2a4f",
                            border: "1px solid #d0d8e6",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            overflow: "hidden",
                        }}
                    >
                        <button
                            onClick={() => toggleSection(blockIndex)}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                background: "#1a2a4f",
                                color: "white",
                                padding: "14px 18px",
                                border: "none",
                                fontSize: "18px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>{block.title}</span>
                            <span style={{ fontSize: "18px", transition: "transform 0.3s", transform: openIndex === blockIndex ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                        </button>

                        {/* Sous-sections */}
                        <div
                            style={{
                                maxHeight: openIndex === blockIndex ? "2000px" : "0px",
                                opacity: openIndex === blockIndex ? 1 : 0,
                                transition: "max-height 0.4s ease, opacity 0.4s ease",
                                overflow: "hidden",
                                background: "white",
                                padding: openIndex === blockIndex ? "14px 18px 20px" : "0 18px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "14px",
                            }}
                        >
                            {block.children.map((section, idx) => (
                                <div key={idx}>
                                    <h3 style={{ color: "#1a2a4f", fontSize: "17px", marginBottom: "10px" }}>{section.title}</h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                        {section.links.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    backgroundColor: "#4fa3f7",
                                                    color: "white",
                                                    padding: "8px 12px",
                                                    borderRadius: "8px",
                                                    textDecoration: "none",
                                                    fontWeight: 500,
                                                    fontSize: "14px",
                                                    boxShadow: "0 2px 4px rgba(79,163,247,0.35)",
                                                    transition: "all 0.15s ease-in-out",
                                                }}
                                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1a2a4f")}
                                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4fa3f7")}
                                            >
                                                {link.text}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
