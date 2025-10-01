import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ManuelPage() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "📘 Déontologie & Cadre légal",
            links: [
                { text: "📄 Enquête accès aux droits", url: "https://www.dropbox.com/scl/fi/j1zhrcmqu5mwnm8x14uks/Enquete-acces-aux-droits-Les-discriminations-dans-lacces-au-logement.pdf?rlkey=oedrb05su090l96ny8dflh2bx&st=1vspxaub&dl=0" },
                { text: "📘 Résumé Déontologie", url: "https://www.dropbox.com/scl/fi/ey399diiav6ovzz8qr94j/Latelier-immo-RESUME-DEONTOLOGIE.pdf?rlkey=ae25pl2mk2yyaz13l0w8wfyt0&st=pc3recnq&dl=0" },
                { text: "💬 Défense des honoraires", url: "https://www.dropbox.com/scl/fi/50aayn9cum1zvp9luo0jk/Texte-de-defense-des-honoraires.pdf?rlkey=f9mc9u847lktdt8m7hgovzovs&st=z0l96sad&dl=0" },
            ],
        },
        {
            title: "🗂️ Procédures & Rendez-vous",
            links: [
                { text: "🗓️ Procédure RDV", url: "https://www.dropbox.com/scl/fi/50aayn9cum1zvp9luo0jk/Texte-de-defense-des-honoraires.pdf?rlkey=f9mc9u847lktdt8m7hgovzovs&st=z0l96sad&dl=0" },
                { text: "📄 Résumé RDV Client R1", url: "https://www.dropbox.com/scl/fi/91l6pxguzzgwraqk5mdrc/Resume-premier-rdv-client-R1.pdf?rlkey=hxnahn23xab2n7tcr6b4hn41u&st=6hou7mpf&dl=0" },
                { text: "🧾 Résumé R2", url: "https://www.dropbox.com/scl/fi/2t6whljq1ynrgp8oxig0c/Latelier-immo-RESUME-R2-1.pdf?rlkey=0753htkv687r7injg6dr2ou50&st=fpkfzd59&dl=0" },
                { text: "📋 Résumé Offre", url: "https://www.dropbox.com/scl/fi/f3pddt8dsvorgw0cplm54/Resume-OFFRE-Latelier-immo.pdf?rlkey=1lzxz6p9rkqcg6mg4d08l0cq0&st=90vumuh4&dl=0" },
            ],
        },
        {
            title: "📑 Documents de transaction",
            links: [
                { text: "📄 Mandat non exclusif", url: "https://www.dropbox.com/scl/fi/7bs7igpu0x9w9vg6sk5m1/2-Modele-mandat-vente-non-exclusif-format-PDF.pdf?rlkey=stb74m211j1gvm1xbfln0qeuh&st=vdxwwnzr&dl=0" },
                { text: "🏡 Fiche bien", url: "https://www.dropbox.com/scl/fi/sqya93wtwwsebua66193m/Fiche-decouverte-du-bien.pdf?rlkey=g14lsh3fhtfu4tstodd5qnlo3&st=0qcsgxqo&dl=0" },
                { text: "🧑‍💼 Fiche vendeur", url: "https://www.dropbox.com/scl/fi/hlprclzdzf6j533cwyp60/Fiche-decouverte-vendeur.pdf?rlkey=xxzspj1h4rhfmz18nh7kzbjxy&st=ed2kfmf5&dl=0" },
                { text: "🧍 Fiche acquéreur", url: "https://www.dropbox.com/scl/fi/mrmbu66p7cac0xlne33cm/fiche-decouverte-acquereur.pdf?rlkey=zrr6wg4lm4yvkov56n5h6p7wf&st=8gkhgwzi&dl=0" },
            ],
        },
        {
            title: "📊 Études & Outils stratégiques",
            links: [
                { text: "📊 Étude marché agence", url: "https://www.dropbox.com/scl/fi/2eu1iyhjr0e0ssepov9my/etude-marche-agence-immobiliere.pdf?rlkey=7ukqzj2v5pw76w7a0iaffttvs&st=rfsiz5dz&dl=0" },
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

    return (
        <div style={{ padding: "30px", backgroundColor: "#243b55", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" }}>

            {/* Titre principal (plus petit) */}
            <h1
                style={{
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "16px",
                    padding: "10px 16px",
                    border: "2px solid #e91e63",
                    borderRadius: "10px",
                    display: "inline-block",
                    background: "#e91e63",
                    boxShadow: "0 3px 8px rgba(233,30,99,0.35)",
                }}
            >
                🧰 Boîte à outils - Tout les liens utile pour faire une bonne vente 
            </h1>

            {/* Retour placé en dessous du titre */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: "#e91e63",
                        color: "#ffffff",
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

            {/* GRILLE DES SECTIONS EN 2 COLONNES, LARGEUR ÉTENDUE */}
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "24px",
                }}
            >
                {sections.map((section, idx) => (
                    <div
                        key={idx}
                        style={{
                            backgroundColor: "#f0f6ff",
                            borderLeft: "6px solid #1a2a4f",
                            border: "1px solid #d0d8e6",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                            padding: "18px 20px",
                            borderRadius: "12px",
                        }}
                    >
                        <h2
                            style={{
                                color: "#1a2a4f",
                                marginBottom: "12px",
                                fontSize: "18px",
                                fontWeight: 600,
                            }}
                        >
                            {section.title}
                        </h2>

                        {/* Boutons plus petits, alignés à gauche */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "flex-start" }}>
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
    );


}
