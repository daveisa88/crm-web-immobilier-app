// src/ListeFiches.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function ListeFiches() {
    const [fiches, setFiches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            console.log("🔍 Chargement fiches...");
            const snapshot = await getDocs(collection(db, "fiches"));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("✅ Fiches récupérées :", data);
            setFiches(data);
        };
        fetchData();
    }, []);

    return (
        <div style={{
            padding: '30px',
            maxWidth: '1000px',
            margin: 'auto',
            backgroundColor: '#0f296bff',
            borderRadius: '12px'
        }}>
            {/* ✅ BOUTON RETOUR */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: '#d819b8ff',
                        color: '#ffffff',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                >
                    🔙 Retour à la feuille
                </button>
            </div>

            <h2 style={{
                textAlign: 'center',
                color: '#d819b8ff',
                marginBottom: '30px'
            }}>📁 Liste des fiches enregistrées</h2>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {fiches.map((fiche, index) => (
                    <li key={index} style={{
                        marginBottom: "25px",
                        background: "#7392e0ff",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span
                                onClick={() => {
                                    localStorage.setItem("ficheSelectionnee", JSON.stringify(fiche));
                                    navigate("/feuille");
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#e91e63"; // rose
                                    e.currentTarget.style.textDecoration = "underline";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#090946ff"; // bleu initial
                                    e.currentTarget.style.textDecoration = "none";
                                }}
                                style={{
                                    color: "#090946ff",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    transition: "all 0.2s ease-in-out"
                                }}
                            >
                                📄 {fiche.numeroContrat}
                            </span>

                            <button
                                onClick={async () => {
                                    if (window.confirm(`Supprimer la fiche ${fiche.numeroContrat} ?`)) {
                                        try {
                                            await deleteDoc(doc(db, "fiches", fiche.numeroContrat));
                                            setFiches(prev => prev.filter(f => f.numeroContrat !== fiche.numeroContrat));
                                            alert("🗑️ Fiche supprimée !");
                                        } catch (error) {
                                            alert("❌ Erreur suppression : " + error.message);
                                        }
                                    }
                                }}
                                style={{
                                    backgroundColor: "#0078d4",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                            >
                                ❌ Supprimer
                            </button>
                        </div>

                        <div style={{ marginTop: "10px", lineHeight: "1.6" }}>
                            👤 <strong>Client :</strong> {fiche.client}<br />
                            🏠 <strong>Adresse :</strong> {fiche.adresse}<br />
                            🔗 <strong>Annonce :</strong>{" "}
                            <a href={fiche.annonceCollee} target="_blank" rel="noopener noreferrer" style={{ color: "#0078d4" }}>
                                {fiche.annonceCollee}
                            </a><br />
                            📝 <strong>Notes :</strong> {fiche.notes}<br />
                            🔄 <strong>Étape :</strong> <span className={`etape-${fiche.etape?.toLowerCase()}`}>{fiche.etape}</span><br />
                            📌 <strong>Statut :</strong> <span className={`statut-${fiche.statut?.toLowerCase()}`}>{fiche.statut}</span><br />
                            📅 <strong>Date RDV :</strong> {fiche.dateRDV}<br />

                            {fiche.fichiers?.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    📎 <strong>Fichiers joints :</strong>
                                    <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                        {fiche.fichiers.map((file, idx) => (
                                            <li key={idx}>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="link-file"
                                                >
                                                    📄 {file.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <p style={{ marginTop: '10px', color: "#090946ff" }}>
                                🕓 <strong>Créée le :</strong>{" "}
                                {fiche.dateCreation ? new Date(fiche.dateCreation).toLocaleString() : "Date inconnue"}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ListeFiches;
