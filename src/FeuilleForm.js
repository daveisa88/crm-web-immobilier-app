// src/FeuilleForm.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signOut } from "firebase/auth";

export default function FeuilleForm() {
    console.log("✅ Composant FeuilleForm monté");
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        numeroContrat: '',
        adresse: '',
        annonceCollee: '',
        client: '',
        notes: '',
        etape: '',
        dateRDV: '',
        statut: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        const fiche = localStorage.getItem("ficheSelectionnee");
        if (fiche) {
            setFormData(JSON.parse(fiche));
            localStorage.removeItem("ficheSelectionnee");
        }
    }, []);

    useEffect(() => {
        const etapeEl = document.querySelector('select[name="etape"]');
        const statutEl = document.querySelector('select[name="statut"]');

        if (etapeEl) {
            etapeEl.className = 'form-control';
            const val = formData.etape.toLowerCase();
            if (val.includes('contact')) etapeEl.classList.add('etape-contact');
            else if (val.includes('visite d')) etapeEl.classList.add('etape-visite');
            else if (val.includes('estimation')) etapeEl.classList.add('etape-estimation');
            else if (val.includes('commercialisation')) etapeEl.classList.add('etape-commercial');
            else if (val.includes('qualification')) etapeEl.classList.add('etape-qualification');
            else if (val.includes('visites organis')) etapeEl.classList.add('etape-visites');
            else if (val.includes('offre')) etapeEl.classList.add('etape-offre');
            else if (val.includes('compromis')) etapeEl.classList.add('etape-compromis');
            else if (val.includes('acte')) etapeEl.classList.add('etape-acte');
        }

        if (statutEl) {
            statutEl.className = 'form-control';
            if (formData.statut === 'À faire') statutEl.classList.add('statut-afaire');
            else if (formData.statut === 'En cours') statutEl.classList.add('statut-encours');
            else if (formData.statut === 'Fait') statutEl.classList.add('statut-fait');
        }
    }, [formData.etape, formData.statut]);

    const storage = getStorage();
    const isElectron = !!window.electronAPI; // 🔎 Détection de l’environnement

    // ✅ Déconnexion utilisateur
    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => navigate("/"))
            .catch(() => alert("❌ Erreur lors de la déconnexion"));
    };

    // ✅ Navigation interne
    const openPage = (path) => {
        navigate(path);
    };

    const openMailType = () => {
        const client = encodeURIComponent(formData.client || "");
        const adresse = encodeURIComponent(formData.adresse || "");
        window.location.href = `${process.env.PUBLIC_URL}/MailType.html?client=${client}&adresse=${adresse}`;
    };






    // ✅ Enregistrement fiche + upload fichiers
    const handleSubmit = async (e) => {
        e.preventDefault();
        const files = document.querySelector('input[type="file"]').files;

        try {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
            const snapshot = await getDocs(collection(db, "fiches"));
            const countToday = snapshot.docs.filter(doc =>
                doc.data().dateCreation?.startsWith(today.toISOString().slice(0, 10))
            ).length;

            const numeroAuto = `FICHE-${dateStr}-${String(countToday + 1).padStart(3, "0")}`;
            const uploadedUrls = [];

            console.log("📂 Nombre de fichiers sélectionnés :", files.length);

            if (files.length > 0) {
                for (let file of files) {
                    console.log("isElectron ?", isElectron);
                    console.log("📄 Fichier détecté :", file);

                    if (isElectron && window.electronAPI?.uploadFichierFirebase) {
                        console.log("➡️ Mode Electron - envoi via preload :", file.path);

                        const result = await window.electronAPI.uploadFichierFirebase(
                            file.path,
                            `${numeroAuto}/${file.name}`
                        );

                        console.log("📬 Retour Electron :", result);

                        if (result.success) {
                            uploadedUrls.push({ name: file.name, url: result.url });
                        } else {
                            console.error("❌ Erreur upload Electron :", result.error);
                        }
                    } else {
                        console.log("➡️ Mode Web - tentative upload Firebase :", file.name);

                        const storageRef = ref(storage, `${numeroAuto}/${file.name}`);
                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);

                        console.log("✅ Upload Web réussi :", url);

                        uploadedUrls.push({ name: file.name, url });
                    }
                }
            } else {
                console.log("ℹ️ Aucun fichier joint → enregistrement de la fiche sans fichiers.");
            }

            await setDoc(doc(db, "fiches", numeroAuto), {
                ...formData,
                numeroContrat: numeroAuto,
                fichiers: uploadedUrls,
                dateCreation: today.toISOString()
            });

            console.log("📄 Fiche enregistrée dans Firestore :", {
                ...formData,
                numeroContrat: numeroAuto,
                fichiers: uploadedUrls
            });

            alert(`✅ Fiche enregistrée avec le numéro : ${numeroAuto}`);

            setFormData({
                numeroContrat: '',
                adresse: '',
                annonceCollee: '',
                client: '',
                notes: '',
                etape: '',
                dateRDV: '',
                statut: '',
            });

        } catch (error) {
            console.error("❌ Erreur handleSubmit :", error);
            alert("❌ Une erreur est survenue : " + error.message);
        }
    };

    return (
        <div style={{ backgroundColor: "#243b55", minHeight: "100vh", padding: "30px" }}>
            {/* Déconnexion */}
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

            {/* Formulaire */}
            <form
                onSubmit={handleSubmit}
                style={{
                    background: "#7392e0ff", // bleu ciel plus foncé
                    padding: "35px",
                    borderRadius: "20px",
                    boxShadow: "0 6px 5px rgba(0,0,0,0.2)",
                    width: "100%",
                    maxWidth: "1400px",
                    margin: "auto",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "40px",
                        color: "white",            // écriture blanche pour contraste
                        fontSize: "20px",          // plus gros
                        fontWeight: "bold",
                        padding: "15px 25px",
                        border: "2px solid #e91e63", // bordure rose
                        borderRadius: "10px",
                        display: "inline-block",
                        background: "#e91e63",     // fond rose
                        boxShadow: "0 4px 8px rgba(233,30,99,0.3)" // ombre rose douce
                    }}
                >
                    📄 Fiche Client Immobilier
                </h2>



                {/* Grille labels/champs */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px 2fr",
                        gap: "15px 40px",
                        alignItems: "center",
                    }}
                >
                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                        📄 Numéro contrat
                    </label>
                    <input
                        name="numeroContrat"
                        value={formData.numeroContrat}
                        readOnly
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #bfcde6",
                            width: "100%",
                            background: "white",
                            color: "#5a6475",
                        }}
                    />

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                        👤 Nom du client
                    </label>
                    <input
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #bfcde6",
                            width: "100%",
                            background: "white",
                            color: "#5a6475",
                        }}
                    />

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                        🏠 Adresse du bien
                    </label>
                    <input
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #bfcde6",
                            width: "100%",
                            background: "white",
                            color: "#5a6475",
                        }}
                    />

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                        📋 Annonce web
                    </label>
                    <textarea
                        name="annonceCollee"
                        value={formData.annonceCollee}
                        onChange={handleChange}
                        rows="3"
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #bfcde6",
                            width: "100%",
                            background: "white",
                            color: "#5a6475",
                        }}
                    />

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                        📅 Date RDV
                    </label>
                    <input
                        type="date"
                        name="dateRDV"
                        value={formData.dateRDV}
                        onChange={handleChange}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #bfcde6",
                            width: "100%",
                            background: "white",
                            color: "#5a6475",
                        }}
                    />

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                        📝 Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #bfcde6",
                            width: "100%",
                            background: "white",
                            color: "#5a6475",
                        }}
                    />

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
                        📑 Documents
                    </label>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{
                            padding: "8px",
                            borderRadius: "8px",
                            border: "1px solid #bfcde6",
                            width: "100%",
                            background: "white",
                            color: "#5a6475",
                        }}
                    />

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
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
                            width: "100%",
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

                    <label style={{ background: "#444", color: "white", padding: "6px 12px", borderRadius: "6px" }}>
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
                            width: "100%",
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

                {/* Bouton Enregistrer */}
                <div style={{ textAlign: "right", marginTop: "25px" }}>
                    <button
                        type="submit"
                        style={{
                            background: "#1a2a4f",
                            color: "white",
                            padding: "12px 24px",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            minWidth: "250px",
                            boxShadow: "0 4px 10px rgba(26,42,79,0.3)",
                        }}
                    >
                        💾 Enregistrer la fiche client
                    </button>
                </div>
            </form>

            {/* Barre de boutons */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    justifyContent: "flex-end",
                    maxWidth: "1200px",
                    margin: "30px auto",
                }}
            >
                <button onClick={() => openPage("/manuel")} style={{ background: "#4fa3f7", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>📘 Manuel</button>
                <button onClick={() => openPage("/analyse")} style={{ background: "#e91e63", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>🤖 Analyse IA</button>
                <button onClick={() => window.open("https://outlook.office.com/calendar/", "_blank")} style={{ background: "#4fa3f7", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>📆 Outlook</button>
                <button onClick={() => window.open("https://teams.microsoft.com/", "_blank")} style={{ background: "#1a2a4f", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>🟪 Teams</button>
                <button onClick={() => window.print()} style={{ background: "#4fa3f7", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>🖨️ Imprimer</button>
                <button onClick={() => openPage("/comparateur")} style={{ background: "#4fa3f7", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>📊 Comparer annonces</button>
                <button
                    onClick={() =>
                        navigate(`/mailtype?client=${encodeURIComponent(formData.client)}&adresse=${encodeURIComponent(formData.adresse)}`)
                    }
                    style={{ background: "#e91e63", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                    📧 Mail Type
                </button>
                <button onClick={() => openPage("/Feuille/Liste")} style={{ background: "#4fa3f7", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    📁 Voir toutes les fiches
                </button>
            </div>
        </div>
    );






}
