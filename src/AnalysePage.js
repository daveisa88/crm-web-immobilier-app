// src/AnalysePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAuth } from "firebase/auth";
import { checkAndConsumeQuota } from "./quota";

export default function AnalysePage() {
    const navigate = useNavigate();
    const [annonce, setAnnonce] = useState("");
    const [htmlFallback, setHtmlFallback] = useState("");
    const [result, setResult] = useState("🧠 Le rapport s'affichera ici...");

    const analyserAnnonce = async () => {
        setResult("⏳ Vérification de vos crédits...");

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            setResult("❌ Vous devez être connecté.");
            return;
        }

        try {
            // Quota (sauf admin)
            if (user.email?.toLowerCase() !== "daveisa@outlook.fr") {
                const ok = await checkAndConsumeQuota(user, "analyse");
                if (!ok) {
                    setResult("⚠️ Vous avez atteint votre quota d'analyses pour ce mois.");
                    return;
                }
            }

            // --- Extraction texte depuis champ URL/HTML
            setResult("⏳ Préparation du texte...");
            let texte = "";
            if (htmlFallback?.trim()) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlFallback, "text/html");
                doc.querySelectorAll("script, style, noscript").forEach((el) => el.remove());
                texte = doc.body.innerText.replace(/\s+/g, " ").trim();
            } else {
                texte = `Annonce : ${annonce}`;
            }

            if (!texte) {
                setResult("❌ Aucun contenu à analyser.");
                return;
            }

            // Tronquage sécurité
            const MAX = 12000;
            if (texte.length > MAX) {
                texte = texte.slice(0, MAX) + " ... [Texte tronqué]";
            }

            // --- Prompt IA (sortie JSON stricte)
            const prompt = `
Tu es un expert immobilier en France. Analyse l'annonce ci-dessous et renvoie UNIQUEMENT un objet JSON minifié, sans texte autour, avec les champs :
{
 "type_bien": "",           // maison, appart, etc.
 "localisation": "",        // ville + secteur si dispo
 "surface_m2": "",          // ex "72 m²"
 "pieces": "",              // ex "3 pièces (2 chambres)"
 "etage": "",               // ou "RDC / N.C." si inconnu
 "atouts": "",              // points forts (ascenseur, balcon, parking...)
 "prix_eur": "",            // ex "249 000 €"
 "prix_m2_annonce": "",     // calcule prix / m² si possible, sinon "N.C."
 "prix_m2_region_estime": "", // estimation prix/m² de la région/ville selon l'annonce (approx)
 "evaluation_prix": "",     // "Sous-évalué" / "Cohérent" / "Surévalué" (+ courte justification)
 "resume": ""               // résumé fluide (3-5 phrases)
}

Annonce :
${texte}
      `.trim();

            setResult("⏳ Analyse IA en cours...");

            // --- Appel API serverless (assure-toi que /api/openai lit req.body.prompt et renvoie {result})
            const response = await fetch("/api/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const raw = await response.text();
            let payload;
            try {
                payload = JSON.parse(raw);
            } catch {
                throw new Error("Réponse API non-JSON: " + raw.slice(0, 200));
            }

            if (!response.ok || payload.error) {
                throw new Error(payload.error || "Erreur inconnue (API non OK)");
            }

            const iaText = payload.result ?? "";
            // L'IA doit renvoyer du JSON dans result → on parse
            let fiche;
            try {
                fiche = JSON.parse(iaText);
            } catch {
                // fallback : afficher le texte brut si ce n'est pas du JSON
                setResult(
                    `<div style="background:#2b3d63;color:#fff;padding:20px;border-radius:12px">
             <h2 style="text-align:center;color:#ffd700;margin-bottom:16px">📊 Synthèse de l'annonce</h2>
             <pre style="white-space:pre-wrap">${iaText || "⚠️ Aucun résultat."}</pre>
           </div>`
                );
                return;
            }

            // --- Rendu stylé
            const clean = (v) => (v && String(v).trim()) || "N.C.";
            const card = `
      <div style="
        max-width:850px;margin:20px auto;background:#2b3d63;color:#fff;
        padding:25px;border-radius:12px;box-shadow:0 6px 15px rgba(0,0,0,0.3);
        font-family:Segoe UI, sans-serif;line-height:1.7;font-size:15px;">
        <h2 style="text-align:center;margin-bottom:20px;color:#ffd700;">📊 Synthèse de l'annonce</h2>

        <p><strong>🏡 Type de bien :</strong> ${clean(fiche.type_bien)}</p>
        <p><strong>📍 Localisation :</strong> ${clean(fiche.localisation)}</p>
        <p><strong>📐 Surface :</strong> ${clean(fiche.surface_m2)}</p>
        <p><strong>🚪 Nombre de pièces :</strong> ${clean(fiche.pieces)}</p>
        <p><strong>🏢 Étage :</strong> ${clean(fiche.etage)}</p>
        <p><strong>🌞 Atouts :</strong> ${clean(fiche.atouts)}</p>
        <p><strong>💰 Prix :</strong> ${clean(fiche.prix_eur)}</p>
        <p><strong>📊 Prix/m² (annonce) :</strong> ${clean(fiche.prix_m2_annonce)}</p>
        <p><strong>🗺️ Prix/m² (région estimé) :</strong> ${clean(fiche.prix_m2_region_estime)}</p>
        <p><strong>🧮 Évaluation du prix :</strong> ${clean(fiche.evaluation_prix)}</p>

        <h3 style="margin-top:25px;color:#ffb347;">Résumé fluide :</h3>
        <div style="background:#1a2949;padding:15px;border-radius:8px;color:#ddd;line-height:1.6;">
          ${clean(fiche.resume)}
        </div>
      </div>
      `;
            setResult(card);
        } catch (e) {
            setResult("❌ Erreur : " + e.message);
        }
    };

    const telechargerPDF = async () => {
        const el = document.getElementById("pdf-capture");
        if (!el) return alert("Rien à exporter !");
        const canvas = await html2canvas(el, { scale: 2 });
        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height * w) / canvas.width;
        pdf.addImage(img, "PNG", 0, 0, w, h);
        pdf.save("analyse_annonce.pdf");
    };

    return (
        <div style={{ backgroundColor: "#243b55", minHeight: "100vh", padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
            <h1 style={{ textAlign: "center", fontSize: 30, fontWeight: "bold", color: "white", marginBottom: 20, padding: "15px 25px", background: "#e91e63", borderRadius: 10, boxShadow: "0 4px 10px rgba(233,30,99,0.4)" }}>
                🔍 Analyse d'une annonce par l'IA
            </h1>

            <div style={{ textAlign: "center", marginBottom: 30 }}>
                <button onClick={() => navigate(-1)} style={{ backgroundColor: "#e91e63", color: "#fff", padding: "10px 18px", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", boxShadow: "0 3px 8px rgba(233,30,99,0.4)" }}>
                    🔙 Retour à la feuille
                </button>
            </div>

            <div style={{ background: "#7392e0", padding: 40, maxWidth: 900, margin: "auto", borderRadius: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.2)" }}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: "bold", color: "#1a2a4f" }}>📎 Lien de l'annonce</label>
                    <textarea rows={2} value={annonce} onChange={(e) => setAnnonce(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #46464dff", background: "#fff", color: "#444" }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: "bold", color: "#1a2a4f" }}>🛠️ Code HTML (optionnel)</label>
                    <textarea rows={6} value={htmlFallback} onChange={(e) => setHtmlFallback(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #46464dff", background: "#fff", color: "#444" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
                    <button onClick={analyserAnnonce} style={{ backgroundColor: "#e91e63", color: "#fff", padding: "12px 22px", borderRadius: 8, fontWeight: "bold", border: "none", cursor: "pointer" }}>
                        🤖 Lancer l’analyse IA
                    </button>
                    <button onClick={telechargerPDF} style={{ backgroundColor: "#1a2a4f", color: "#fff", padding: "12px 22px", borderRadius: 8, fontWeight: "bold", border: "none", cursor: "pointer" }}>
                        📄 Télécharger PDF
                    </button>
                </div>

                <div id="pdf-capture" style={{ width: "95%", border: "1px solid #46464dff", borderRadius: 10, padding: 20, background: "#fff", color: "#1a1a1a" }} dangerouslySetInnerHTML={{ __html: result }} />
            </div>
        </div>
    );
}
