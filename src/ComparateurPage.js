// ComparateurPage.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { checkAndConsumeQuota } from "./quota";
import { getAuth } from "firebase/auth";

// Config worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ComparateurPage() {
    const navigate = useNavigate();
    const [resultat, setResultat] = useState("📥 En attente de fichiers PDF…");
    const pdfRef = useRef(null);
    const auth = getAuth();

    // 🔎 OCR PDF
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
                        const { data: { text } } = await Tesseract.recognize(canvas, "fra");
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

    // 🧠 Comparaison IA
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

Tâches :
1. Extrais localisation, surface, prix, pièces, atouts.
2. Calcule prix au m² (prix/surface).
3. Indique si le prix est surévalué, sous-évalué ou cohérent avec le marché.
4. Note chaque annonce (1-10) sur surface, pièces, confort, exposition, terrain.
5. Donne une note moyenne globale.
6. Conclus par : “🏆 L’annonce gagnante est l’annonce X”.
`;

            // 👉 Appel API serverless (même logique que AnalysePage)
            const response = await fetch("/api/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }), // ✅ on envoie prompt
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                const msg = data?.error || JSON.stringify(data);
                setResultat("❌ API error: " + msg);
                return;
            }

            // ✅ Cohérent avec AnalysePage → data.result
            const output = data.result || "⚠️ Aucun résultat.";
            const gagnant = output.match(/annonce\s+(\d)/i)?.[1] || "?";

            const badge = `
            <div style="margin-top:20px;text-align:center;">
                <span style="
                    display:inline-block;
                    padding:12px 24px;
                    background:linear-gradient(90deg,#FFD700,#FFA500);
                    color:#111;
                    font-weight:bold;
                    border-radius:30px;
                    font-family:Segoe UI, sans-serif;
                    box-shadow:0 4px 10px rgba(0,0,0,0.15);
                    font-size:1rem;
                ">
                    🏆 Annonce gagnante : ${gagnant}
                </span>
            </div>`;

            setResultat(`
                <div style="background:#2b3d63;color:#fff;padding:20px;border-radius:12px;">
                    <h3 style="text-align:center;color:#ffd700;">📊 Résultats de la comparaison</h3>
                    <div style="background:#1a2949;padding:15px;border-radius:8px;white-space:pre-wrap;">
                        ${output}
                    </div>
                    ${badge}
                </div>
            `);
        } catch (error) {
            console.error("Erreur analyse:", error);
            setResultat("❌ Erreur pendant l'analyse.");
        }
    };

    // 📄 Export PDF
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
                        boxShadow: "0 4px 8px rgba(233,30,99,0.4)",
                    }}
                >
                    🔙 Retour à la feuille
                </button>
            </div>

            <div
                style={{
                    background: "#ffffff",
                    padding: 40,
                    maxWidth: 750,
                    margin: "auto",
                    borderRadius: 16,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        color: "#1a2a4f",
                        marginBottom: 30,
                        fontWeight: "bold",
                    }}
                >
                    📊 Comparateur PDF IA
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
                                    border: "2px dashed #4fa3f7",
                                    borderRadius: "8px",
                                    background: "#f9f9fb",
                                    cursor: "pointer",
                                    width: "80%",
                                }}
                                onChange={(e) => {
                                    const fileName =
                                        e.target.files[0]?.name || "Aucun fichier choisi";
                                    document.getElementById(`label${num}`).innerText =
                                        fileName;
                                }}
                            />
                            <div
                                id={`label${num}`}
                                style={{
                                    marginTop: "5px",
                                    fontSize: "14px",
                                    color: "#1a2a4f",
                                    fontWeight: "bold",
                                }}
                            >
                                Aucun fichier choisi
                            </div>
                        </div>
                    ))}
                </div>

                {/* Boutons */}
                <div
                    style={{
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                    }}
                >
                    <button
                        onClick={analyserComparaisonIA}
                        style={{
                            background: "#e91e63",
                            color: "white",
                            padding: "12px 24px",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        🧠 Lancer la comparaison
                    </button>
                    <button
                        onClick={telechargerPDF}
                        style={{
                            background: "#4fa3f7",
                            color: "white",
                            padding: "12px 24px",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        📄 Télécharger le rapport
                    </button>
                </div>

                {/* Résultat */}
                <div
                    ref={pdfRef}
                    style={{
                        marginTop: 30,
                        background: "#ffffff",
                        padding: 20,
                        borderRadius: 12,
                        border: "2px solid #1a2a4f",
                        color: "#333",
                        fontFamily: "Segoe UI",
                        minHeight: 100,
                    }}
                    dangerouslySetInnerHTML={{ __html: resultat }}
                />
            </div>
        </div>
    );
}
