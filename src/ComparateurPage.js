// ComparateurPage.js (version stylisée comme AnalysePage)
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { checkAndConsumeQuota } from "./quota";
import { getAuth } from "firebase/auth";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ComparateurPage() {
    const navigate = useNavigate();
    const [resultat, setResultat] = useState("📥 En attente de fichiers PDF…");
    const pdfRef = useRef(null);
    const auth = getAuth();

    // OCR PDF -> texte
    const extractTextWithOCR = async (file) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const pdfData = new Uint8Array(reader.result);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    let allText = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 2 });
                        const canvas = document.createElement("canvas");
                        const context = canvas.getContext("2d");
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        await page.render({ canvasContext: context, viewport }).promise;
                        const {
                            data: { text },
                        } = await Tesseract.recognize(canvas, "fra");
                        allText += text + "\n\n";
                    }
                    resolve(allText.trim());
                } catch (err) {
                    reject(err.message);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    // IA comparateur
    const analyserComparaisonIA = async () => {
        setResultat("⏳ Vérification quota…");

        const user = auth.currentUser;
        const email = user?.email?.toLowerCase();

        if (email !== "daveisa@outlook.fr") {
            const quotaCheck = await checkAndConsumeQuota("comparateur");
            if (!quotaCheck.allowed) {
                setResultat(quotaCheck.message);
                return;
            }
        }

        setResultat("⏳ Analyse en cours…");
        const fichiers = ["pdf1", "pdf2", "pdf3"].map(
            (id) => document.getElementById(id).files[0]
        );

        if (fichiers.some((f) => !f)) {
            setResultat("❌ Merci de sélectionner les 3 fichiers PDF.");
            return;
        }

        try {
            const textes = await Promise.all(fichiers.map(extractTextWithOCR));

            const prompt = `
Tu es un expert immobilier. Compare ces 3 annonces immobilières : 

Annonce 1 :
${textes[0]}

Annonce 2 :
${textes[1]}

Annonce 3 :
${textes[2]}

Pour chaque annonce, donne une fiche synthèse claire :
- Type de bien
- Localisation
- Surface
- Nombre de pièces
- Atouts
- Prix + prix au m²
- Indique si le prix est surévalué, sous-évalué ou cohérent avec le marché régional

Ensuite :
- Donne une note de 1 à 10 par annonce
- Conclus par l’annonce gagnante 🏆
`;

            const response = await fetch("/api/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                const msg = data?.error || JSON.stringify(data);
                setResultat("❌ API error: " + msg);
                return;
            }

            // ✅ Texte IA
            const texteIA = data.result || "⚠️ Réponse vide.";

            // Mise en forme style "AnalysePage"
            setResultat(`
        <div style="
          max-width:900px;
          margin:20px auto;
          font-family:Segoe UI, sans-serif;
          line-height:1.7;
          font-size:15px;
          color:#fff;
        ">
          <h2 style="text-align:center; margin-bottom:20px; color:#ffd700;">
            📊 Comparaison des annonces
          </h2>
          <div style="background:#2b3d63; padding:20px; border-radius:12px; margin-bottom:20px;">
            ${texteIA.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `);
        } catch (error) {
            console.error("Erreur analyse:", error);
            setResultat("❌ Erreur pendant l'analyse.");
        }
    };

    // Export PDF
    const telechargerPDF = async () => {
        const element = pdfRef.current;
        if (!element) {
            alert("Rien à exporter !");
            return;
        }
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight);
        pdf.save("comparaison_annonces.pdf");
    };

    return (
        <div style={{ backgroundColor: "#243b55", minHeight: "100vh", padding: 40 }}>
            {/* Retour */}
            <div style={{ textAlign: "center", marginBottom: 30 }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: "#e91e63",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    🔙 Retour à la feuille
                </button>
            </div>

            {/* Carte principale */}
            <div
                style={{
                    background: "#7392e0",
                    padding: 40,
                    maxWidth: 900,
                    margin: "auto",
                    borderRadius: 16,
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        color: "white",
                        marginBottom: 30,
                        fontWeight: "bold",
                    }}
                >
                    📊 Comparateur Annonce PDF IA
                </h2>

                {/* Upload */}
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                    {[1, 2, 3].map((num) => (
                        <div key={num} style={{ marginBottom: "15px" }}>
                            <input
                                type="file"
                                id={`pdf${num}`}
                                accept="application/pdf"
                                style={{
                                    margin: "12px auto",
                                    display: "block",
                                    padding: "10px",
                                    border: "1px solid #1a1a1a",   // cadre fin noir
                                    borderRadius: "8px",
                                    background: "#fff",
                                    cursor: "pointer",
                                    width: "80%",
                                    color: "#1a2a4f",              // texte (nom du fichier) plus foncé
                                    fontWeight: 600,               // plus lisible
                                }}
                                onChange={(e) => {
                                    // (optionnel) titre en tooltip
                                    const f = e.target.files?.[0]?.name || "";
                                    e.target.title = f || "Choisir un fichier PDF";
                                }}
                            />
                            {/* ⛔️ On supprime le div qui doublait le nom du fichier */}
                        </div>
                    ))}
                </div>



                {/* Boutons */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <button
                        onClick={analyserComparaisonIA}
                        style={{
                            background: "#e91e63",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            marginRight: "15px",
                        }}
                    >
                        🧠 Lancer la comparaison
                    </button>
                    <button
                        onClick={telechargerPDF}
                        style={{
                            background: "#1a2a4f",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        📄 Télécharger le rapport
                    </button>
                </div>

                {/* Résultats */}
                <div
                    ref={pdfRef}
                    style={{
                        width: "95%",
                        border: "1px solid #46464dff",
                        borderRadius: 10,
                        padding: 20,
                        background: "#fff",
                        color: "#1a1a1a",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{ __html: resultat }}
                />
            </div>
        </div>
    );
}
