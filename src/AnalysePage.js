import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAuth } from "firebase/auth";
import { checkAndConsumeQuota } from "./quota"; // ✅ quota.js

export default function AnalysePage() {
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState("");
  const [htmlFallback, setHtmlFallback] = useState("");
  const [result, setResult] = useState("🧠 Le rapport s'affichera ici...");

  // 🧠 Analyse avec OpenAI via ton API serverless
  const analyserAnnonce = async () => {
    setResult("⏳ Vérification de vos crédits...");

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setResult("❌ Vous devez être connecté.");
      return;
    }

    try {
      // ✅ Exception admin
      if (user.email !== "daveisa@outlook.fr") {
        const ok = await checkAndConsumeQuota(user, "analyse");
        if (!ok) {
          setResult("⚠️ Vous avez atteint votre quota d'analyses pour ce mois.");
          return;
        }
      }

      setResult("⏳ Analyse en cours...");

      // === Extraction texte
      let texte = "";
      if (htmlFallback) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlFallback, "text/html");
        doc.querySelectorAll("script, style, noscript").forEach((el) => el.remove());
        texte = doc.body.innerText.replace(/\s+/g, " ").trim();
      } else {
        texte = `Voici une annonce : ${annonce}`;
      }

      const MAX_LONGUEUR = 12000;
      if (texte.length > MAX_LONGUEUR) {
        texte = texte.slice(0, MAX_LONGUEUR) + " ... [Texte tronqué pour analyse]";
      }

      const prompt = `
Tu es un expert immobilier. Donne-moi une fiche synthèse et un résumé fluide de l’annonce suivante.
- La fiche doit être cohérente avec les infos trouvées (surface, prix, pièces…).
- Le résumé doit être naturel et lisible pour un client.

Annonce brute :
${texte}
`;

        // 👉 Appel API serverless
        const response = await fetch("/api/openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            setResult("❌ API error: " + (data.error || "Erreur inconnue"));
            return;
        }

        // ✅ la bonne clé c'est "result"
        const texteIA = data.result || "⚠️ Aucun résultat.";
        setResult(texteIA);

      setResult(`
        <div style="
          max-width:850px;
          margin:20px auto;
          background:#2b3d63;
          color:#fff;
          padding:25px;
          border-radius:12px;
          box-shadow:0 6px 15px rgba(0,0,0,0.3);
          font-family:Segoe UI, sans-serif;
          line-height:1.7;
          font-size:15px;
        ">
          <h2 style="text-align:center; margin-bottom:20px; color:#ffd700;">
            📊 Synthèse de l'annonce
          </h2>
          <div style="background:#1a2949; padding:15px; border-radius:8px; color:#ddd; line-height:1.6;">
            ${texteIA}
          </div>
        </div>
      `);
    } catch (e) {
      setResult("❌ Erreur : " + e.message);
    }
  };

  // 📄 Export PDF
  const telechargerPDF = async () => {
    const element = document.getElementById("pdf-capture");
    if (!element) {
      alert("Rien à exporter !");
      return;
    }
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("analyse_annonce.pdf");
    } catch (error) {
      alert("❌ Erreur PDF : " + error.message);
    }
  };

  return (
    <div style={{ backgroundColor: "#243b55", minHeight: "100vh", padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
      {/* Titre */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "30px",
          fontWeight: "bold",
          color: "white",
          marginBottom: "20px",
          padding: "15px 25px",
          background: "#e91e63",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(233,30,99,0.4)",
        }}
      >
        🔍 Analyse d'une annonce par l'IA
      </h1>

      {/* Bouton retour */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "#e91e63",
            color: "#fff",
            padding: "10px 18px",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 3px 8px rgba(233,30,99,0.4)",
          }}
        >
          🔙 Retour à la feuille
        </button>
      </div>

      {/* Cadre principal */}
      <div
        style={{
          background: "#7392e0",
          padding: 40,
          maxWidth: 900,
          margin: "auto",
          borderRadius: 16,
          boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
        }}
      >
        {/* Champ annonce */}
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <label style={{ fontWeight: "bold", color: "#1a2a4f" }}>📎 Lien de l'annonce</label>
          <textarea
            rows={2}
            value={annonce}
            onChange={(e) => setAnnonce(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #46464dff",
              background: "#fff",
              color: "#444",
            }}
          />
        </div>

        {/* Champ HTML */}
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <label style={{ fontWeight: "bold", color: "#1a2a4f" }}>🛠️ Code HTML (optionnel)</label>
          <textarea
            rows={6}
            value={htmlFallback}
            onChange={(e) => setHtmlFallback(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #46464dff",
              background: "#fff",
              color: "#444",
            }}
          />
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
          <button
            onClick={analyserAnnonce}
            style={{
              backgroundColor: "#e91e63",
              color: "#fff",
              padding: "12px 22px",
              borderRadius: 8,
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            🤖 Lancer l’analyse IA
          </button>
          <button
            onClick={telechargerPDF}
            style={{
              backgroundColor: "#1a2a4f",
              color: "#fff",
              padding: "12px 22px",
              borderRadius: 8,
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            📄 Télécharger PDF
          </button>
        </div>

        {/* Résultats */}
        <div
          id="pdf-capture"
          style={{
            width: "95%",
            border: "1px solid#46464dff",
            borderRadius: 10,
            padding: 20,
            background: "#fff",
            color: "#1a1a1a",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: result }}
        />
      </div>
    </div>
  );
}
