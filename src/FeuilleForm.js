import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signOut } from "firebase/auth";

export default function FeuilleForm() {
    const navigate = useNavigate();
    const storage = getStorage();
    const isElectron = !!window.electronAPI;

    const [formData, setFormData] = useState({
        numeroContrat: "",
        adresse: "",
        annonceCollee: "",
        client: "",
        notes: "",
        etape: "",
        dateRDV: "",
        statut: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ✅ Chargement fiche sélectionnée depuis la liste
    useEffect(() => {
        const fiche = localStorage.getItem("ficheSelectionnee");
        if (fiche) {
            setFormData(JSON.parse(fiche));
            localStorage.removeItem("ficheSelectionnee");
        }
    }, []);

    // ✅ Coloration dynamique Étape / Statut
    useEffect(() => {
        const etapeEl = document.querySelector('select[name="etape"]');
        const statutEl = document.querySelector('select[name="statut"]');

        if (etapeEl) {
            etapeEl.className = "form-control";
            const val = formData.etape.toLowerCase();
            if (val.includes("contact")) etapeEl.classList.add("etape-contact");
            else if (val.includes("visite")) etapeEl.classList.add("etape-visite");
            else if (val.includes("estimation")) etapeEl.classList.add("etape-estimation");
            else if (val.includes("commercialisation")) etapeEl.classList.add("etape-commercial");
            else if (val.includes("qualification")) etapeEl.classList.add("etape-qualification");
            else if (val.includes("offre")) etapeEl.classList.add("etape-offre");
            else if (val.includes("compromis")) etapeEl.classList.add("etape-compromis");
            else if (val.includes("acte")) etapeEl.classList.add("etape-acte");
        }

        if (statutEl) {
            statutEl.className = "form-control";
            if (formData.statut === "À faire") statutEl.classList.add("statut-afaire");
            else if (formData.statut === "En cours") statutEl.classList.add("statut-encours");
            else if (formData.statut === "Fait") statutEl.classList.add("statut-fait");
        }
    }, [formData.etape, formData.statut]);

    // ✅ Déconnexion
    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => navigate("/"))
            .catch(() => alert("❌ Erreur lors de la déconnexion"));
    };

    const openPage = (path) => navigate(path);

    // 🆕 Créer une nouvelle fiche avec numéro unique
    const handleNewFiche = async () => {
        try {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

            const snapshot = await getDocs(collection(db, "fiches"));
            const fiches = snapshot.docs.map((d) => d.data());

            // 🔢 Récupère le plus grand index pour la date du jour
            const todayFiches = fiches.filter((f) =>
                (f.dateCreation || "").startsWith(today.toISOString().slice(0, 10))
            );

            const maxIndex = todayFiches
                .map((f) => {
                    const num = f.numeroContrat?.split("-").pop();
                    return num ? parseInt(num, 10) : 0;
                })
                .reduce((a, b) => Math.max(a, b), 0);

            const newIndex = String(maxIndex + 1).padStart(3, "0");
            const numeroAuto = `FICHE-${dateStr}-${newIndex}`;

            setFormData({
                numeroContrat: numeroAuto,
                adresse: "",
                annonceCollee: "",
                client: "",
                notes: "",
                etape: "",
                dateRDV: "",
                statut: "",
            });

            alert(`🆕 Nouvelle fiche préparée : ${numeroAuto}`);
        } catch (error) {
            alert("❌ Erreur création : " + error.message);
        }
    };

    // 💾 Enregistrement ou mise à jour
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const files = document.querySelector('input[type="file"]').files;
        const uploadedUrls = [];

        try {
            let numero = formData.numeroContrat;

            // 🔸 Si aucun numéro => on en génère un nouveau
            if (!numero) {
                const today = new Date();
                const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
                const snapshot = await getDocs(collection(db, "fiches"));
                const fiches = snapshot.docs.map((d) => d.data());

                const todayFiches = fiches.filter((f) =>
                    (f.dateCreation || "").startsWith(today.toISOString().slice(0, 10))
                );

                const maxIndex = todayFiches
                    .map((f) => {
                        const num = f.numeroContrat?.split("-").pop();
                        return num ? parseInt(num, 10) : 0;
                    })
                    .reduce((a, b) => Math.max(a, b), 0);

                const newIndex = String(maxIndex + 1).padStart(3, "0");
                numero = `FICHE-${dateStr}-${newIndex}`;
            }

            // 📎 Upload fichiers
            if (files.length > 0) {
                for (let file of files) {
                    if (isElectron && window.electronAPI?.uploadFichierFirebase) {
                        const result = await window.electronAPI.uploadFichierFirebase(
                            file.path,
                            `${numero}/${file.name}`
                        );
                        if (result.success) uploadedUrls.push({ name: file.name, url: result.url });
                    } else {
                        const storageRef = ref(storage, `${numero}/${file.name}`);
                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);
                        uploadedUrls.push({ name: file.name, url });
                    }
                }
            }

            // 🗂️ Enregistrement Firestore
            await setDoc(
                doc(db, "fiches", numero),
                {
                    ...formData,
                    numeroContrat: numero,
                    fichiers: uploadedUrls,
                    dateCreation: formData.dateCreation || new Date().toISOString(),
                },
                { merge: true } // ✅ évite la recréation et conserve le même numéro
            );

            alert(`✅ Fiche ${numero} enregistrée avec succès !`);

            setFormData({
                numeroContrat: numero,
                adresse: "",
                annonceCollee: "",
                client: "",
                notes: "",
                etape: "",
                dateRDV: "",
                statut: "",
            });
        } catch (error) {
            console.error("❌ Erreur handleSubmit :", error);
            alert("❌ Une erreur est survenue : " + error.message);
        }
    };

    return (
        <div style={{ backgroundColor: "#243b55", minHeight: "100vh", padding: "30px" }}>
            {/* 🔓 Déconnexion */}
            <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <button
                    onClick={handleLogout}
                    style={{
                        background: "#e91e63",
                        color: "white",
                        padding: "12px 24px",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(233,30,99,0.4)",
                    }}
                >
                    🔓 Se déconnecter
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 300px",
                    gap: "100px",
                    maxWidth: "1600px",
                    margin: "auto",
                    alignItems: "start",
                }}
            >
                {/* FORMULAIRE CLIENT */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        background: "#7392e0ff",
                        padding: "40px",
                        borderRadius: "2px",
                        boxShadow: "0 2px 2px rgba(0,0,0,0.2)",
                        marginTop: "-80px",
                        width: "90%",
                    }}
                >
                    <h2
                        style={{
                            textAlign: "center",
                            marginBottom: "40px",
                            color: "white",
                            fontSize: "15px",
                            fontWeight: "bold",
                            padding: "15px 25px",
                            border: "2px solid #e91e63",
                            borderRadius: "5px",
                            background: "#e91e63",
                            boxShadow: "0 2px 8px rgba(233,30,99,0.3)",
                            display: "inline-block",
                        }}
                    >
                        📄 Fiche Client Immobilier
                    </h2>

                    {/* Champs */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "160px 1fr",
                            gap: "18px 35px",
                            alignItems: "center",
                        }}
                    >
                        {[
                            ["📄 Numéro contrat", "numeroContrat", "text", true],
                            ["👤 Nom du client", "client", "text"],
                            ["🏠 Adresse du bien", "adresse", "text"],
                            ["📋 Annonce web", "annonceCollee", "textarea"],
                            ["📅 Date RDV", "dateRDV", "date"],
                            ["📝 Notes", "notes", "textarea"],
                        ].map(([label, name, type, readOnly]) => (
                            <React.Fragment key={name}>
                                <label
                                    style={{
                                        background: "#444",
                                        color: "white",
                                        padding: "7px 12px",
                                        borderRadius: "6px",
                                        fontSize: "15px",
                                    }}
                                >
                                    {label}
                                </label>
                                {type === "textarea" ? (
                                    <textarea
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        rows="3"
                                        readOnly={readOnly}
                                        style={{
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid #bfcde6",
                                            background: "white",
                                            color: "#5a6475",
                                        }}
                                    />
                                ) : (
                                    <input
                                        type={type}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        readOnly={readOnly}
                                        style={{
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid #bfcde6",
                                            background: "white",
                                            color: "#5a6475",
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        ))}

                        {/* Fichiers */}
                        <label
                            style={{
                                background: "#444",
                                color: "white",
                                padding: "7px 12px",
                                borderRadius: "6px",
                                fontSize: "15px",
                            }}
                        >
                            📑 Documents
                        </label>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #bfcde6",
                                background: "white",
                                color: "#5a6475",
                            }}
                        />

                        {/* Étape / Statut */}
                        <label style={{ background: "#444", color: "white", padding: "7px 12px", borderRadius: "6px", fontSize: "15px" }}>
                            🔄 Étape
                        </label>
                        <select
                            name="etape"
                            value={formData.etape}
                            onChange={handleChange}
                            style={{
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #bfcde6",
                                background: "white",
                                color: "#5a6475",
                            }}
                        >
                            <option value="">Sélectionner</option>
                            <option>R0 - Contact</option>
                            <option>R1 - Visite découverte</option>
                            <option>R2 - Estimation & Mandat</option>
                            <option>Commercialisation</option>
                            <option>Qualification acquéreur</option>
                            <option>Visites organisées</option>
                            <option>Offre reçue</option>
                            <option>Compromis signé</option>
                            <option>Acte authentique</option>
                        </select>

                        <label style={{ background: "#444", color: "white", padding: "7px 12px", borderRadius: "6px", fontSize: "15px" }}>
                            📌 Statut
                        </label>
                        <select
                            name="statut"
                            value={formData.statut}
                            onChange={handleChange}
                            style={{
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #bfcde6",
                                background: "white",
                                color: "#5a6475",
                            }}
                        >
                            <option value="">Sélectionner</option>
                            <option>À faire</option>
                            <option>En cours</option>
                            <option>Fait</option>
                        </select>
                    </div>
                </form>

                {/* ✅ Boutons rapides */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        background: "#7392e0ff",
                        padding: "25px",
                        borderRadius: "15px",
                        boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                        width: "100%",
                        maxWidth: "320px",
                        alignSelf: "center",
                    }}
                >
                    <button onClick={() => openPage("/manuel")} style={btnDark}>
                        📘 Manuel
                    </button>
                    <button
                        onClick={() => window.open("https://outlook.office.com/calendar/", "_blank")}
                        style={btnDark}
                    >
                        📆 Outlook
                    </button>
                    <button
                        onClick={() => window.open("https://teams.microsoft.com/", "_blank")}
                        style={btnDark}
                    >
                        🟪 Teams
                    </button>
                    <button onClick={() => openPage("/analyse")} style={btnPink}>
                        🤖 Analyse IA
                    </button>
                    <button onClick={() => openPage("/comparateur")} style={btnPink}>
                        📊 Comparer annonces
                    </button>
                    <button onClick={() => openPage("/mailtype")} style={btnPink}>
                        📧 Mail Type
                    </button>
                    <button onClick={() => openPage("/Feuille/Liste")} style={btnGreen}>
                        📁 Voir toutes les fiches
                    </button>
                    <button onClick={() => openPage("/stats")} style={btnBlue}>
                        📈 Statistiques / Progression
                    </button>

                    {/* 🆕 Création et Enregistrement */}
                    <button onClick={handleNewFiche} style={btnBlue}>
                        🆕 Créer une nouvelle fiche
                    </button>
                    <button onClick={handleSubmit} style={btnGreen}>
                        💾 Enregistrer la fiche client
                    </button>
                </div>
            </div>
        </div>
    );
}

/* === Styles boutons === */
const btnDark = {
    background: "#1a2a4f",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
};
const btnPink = { ...btnDark, background: "#e91e63" };
const btnGreen = { ...btnDark, background: "#3f6628" };
const btnBlue = { ...btnDark, background: "#4fa3f7" };
