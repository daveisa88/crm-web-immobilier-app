// src/AddFakeData.js
import React from "react";
import { db } from "./firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

export default function AddFakeData() {
    const fakeFiches = [
        {
            client: "Jean Dupont",
            adresse: "12 rue des Lilas, Lyon",
            notes: "Client chaud, veut vendre rapidement.",
            etape: "R1 - Visite découverte",
            dateRDV: "2025-01-03",
            statut: "À faire",
            dateCreation: "2025-01-03T09:45:00Z"
        },
        {
            client: "Marie Lefevre",
            adresse: "88 avenue de la République, Nantes",
            notes: "Estimation demandée pour un T3.",
            etape: "R2 - Estimation & Mandat",
            dateRDV: "2025-01-20",
            statut: "En cours",
            dateCreation: "2025-01-18T11:00:00Z"
        },
        {
            client: "Paul Martin",
            adresse: "5 impasse des Fleurs, Nice",
            notes: "Mandat signé.",
            etape: "Commercialisation",
            dateRDV: "2025-02-04",
            statut: "Fait",
            dateCreation: "2025-02-04T14:22:00Z"
        },
        {
            client: "Sophie Bernard",
            adresse: "27 boulevard Voltaire, Paris",
            notes: "Acquéreur intéressé par offre ferme.",
            etape: "Offre reçue",
            dateRDV: "2025-02-16",
            statut: "En cours",
            dateCreation: "2025-02-15T10:18:00Z"
        },
        {
            client: "Antoine Girard",
            adresse: "3 rue de la Mer, Marseille",
            notes: "Signature de compromis prévue.",
            etape: "Compromis signé",
            dateRDV: "2025-03-01",
            statut: "Fait",
            dateCreation: "2025-03-01T09:10:00Z"
        },
        {
            client: "Lucie Dubois",
            adresse: "45 chemin des Vignes, Toulouse",
            notes: "Maison en vente depuis 2 semaines.",
            etape: "Commercialisation",
            dateRDV: "2025-03-20",
            statut: "En cours",
            dateCreation: "2025-03-19T15:00:00Z"
        },
        {
            client: "Nicolas Petit",
            adresse: "22 rue Lafayette, Lille",
            notes: "Client souhaite évaluer deux biens.",
            etape: "R2 - Estimation & Mandat",
            dateRDV: "2025-04-08",
            statut: "À faire",
            dateCreation: "2025-04-07T13:40:00Z"
        },
        {
            client: "Camille Moreau",
            adresse: "6 avenue Carnot, Bordeaux",
            notes: "Acte authentique prévu fin avril.",
            etape: "Acte authentique",
            dateRDV: "2025-04-29",
            statut: "Fait",
            dateCreation: "2025-04-26T08:00:00Z"
        },
        {
            client: "Julien Mercier",
            adresse: "91 rue Victor Hugo, Clermont-Ferrand",
            notes: "Visite de prospection prévue.",
            etape: "R0 - Contact",
            dateRDV: "2025-05-15",
            statut: "À faire",
            dateCreation: "2025-05-12T16:30:00Z"
        },
        {
            client: "Laura Fontaine",
            adresse: "25 boulevard des Alpes, Grenoble",
            notes: "Acquéreur prêt à signer compromis.",
            etape: "Compromis signé",
            dateRDV: "2025-05-28",
            statut: "En cours",
            dateCreation: "2025-05-27T09:55:00Z"
        },
        {
            client: "Thomas Laurent",
            adresse: "4 rue Pasteur, Brest",
            notes: "Estimation validée.",
            etape: "R2 - Estimation & Mandat",
            dateRDV: "2025-06-03",
            statut: "Fait",
            dateCreation: "2025-06-03T10:10:00Z"
        },
        {
            client: "Alice Roux",
            adresse: "33 avenue Foch, Strasbourg",
            notes: "Bien ajouté à la base en juillet.",
            etape: "Qualification acquéreur",
            dateRDV: "2025-07-17",
            statut: "En cours",
            dateCreation: "2025-07-15T12:45:00Z"
        },
        {
            client: "Damien Leroy",
            adresse: "14 place de la République, Tours",
            notes: "Rendez-vous découverte prévu.",
            etape: "R1 - Visite découverte",
            dateRDV: "2025-07-28",
            statut: "À faire",
            dateCreation: "2025-07-25T08:20:00Z"
        },
        {
            client: "Hélène Blanchard",
            adresse: "18 rue Principale, Metz",
            notes: "Offre acceptée par le vendeur.",
            etape: "Offre reçue",
            dateRDV: "2025-08-09",
            statut: "Fait",
            dateCreation: "2025-08-09T11:15:00Z"
        },
        {
            client: "Alexandre Colin",
            adresse: "8 rue du Parc, Reims",
            notes: "Dossier clos, acte signé.",
            etape: "Acte authentique",
            dateRDV: "2025-09-05",
            statut: "Fait",
            dateCreation: "2025-09-02T09:00:00Z"
        }
    ];

    const addData = async () => {
        try {
            for (const fiche of fakeFiches) {
                // Génération automatique du numéro de fiche (comme FeuilleForm.js)
                const today = new Date(fiche.dateCreation);
                const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

                const snap = await getDocs(collection(db, "fiches"));
                const countToday = snap.docs.filter(doc =>
                    doc.data().dateCreation?.startsWith(today.toISOString().slice(0, 10))
                ).length;

                const numeroAuto = `FICHE-${dateStr}-${String(countToday + 1).padStart(3, "0")}`;

                const ref = doc(collection(db, "fiches"), numeroAuto);
                await setDoc(ref, { ...fiche, numeroContrat: numeroAuto });

                console.log("✅ Fiche ajoutée :", numeroAuto);
            }

            alert("✅ 15 fiches fictives ajoutées automatiquement !");
        } catch (error) {
            console.error("❌ Erreur :", error);
            alert("❌ Erreur lors de l’ajout : " + error.message);
        }
    };

    return (
        <div style={{
            backgroundColor: "#243b55",
            height: "100vh",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Segoe UI, sans-serif"
        }}>
            <h1 style={{ marginBottom: "20px" }}>📊 Import automatique de données fictives</h1>
            <button
                onClick={addData}
                style={{
                    background: "#4fa3f7",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    fontWeight: "bold",
                    padding: "15px 30px",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(79,163,247,0.4)",
                    fontSize: "18px"
                }}
            >
                🚀 Générer automatiquement 15 fiches
            </button>
        </div>
    );
}
