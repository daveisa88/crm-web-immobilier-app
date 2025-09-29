import React, { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("login");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === "login") {
                // ✅ Connexion utilisateur
                const cred = await signInWithEmailAndPassword(auth, email, password);
                const userEmail = cred.user.email?.toLowerCase();

                // 🔍 Chercher l'utilisateur par email dans Firestore
                const q = query(collection(db, "users"), where("email", "==", userEmail));
                const snap = await getDocs(q);

                if (!snap.empty) {
                    const data = snap.docs[0].data();
                    console.log("🔥 Données Firestore :", data);

                    // ✅ Exception ADMIN (stop ici ⛔)
                    if (data.role?.toLowerCase().trim() === "admin") {
                        console.log("🎉 ADMIN détecté -> accès direct");
                        setMessage("✅ Connexion ADMIN réussie !");
                        navigate("/Feuille");
                        return; // <<--- très important
                    }

                    // 👉 Sinon contrôle abonnement
                    if (data.subscription?.status === "active" && data.subscription?.endDate) {
                        const end = new Date(data.subscription.endDate);
                        const now = new Date();
                        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

                        if (diff > 0) {
                            setMessage(`⏳ Il vous reste ${diff} jours d’abonnement.`);
                            navigate("/Feuille");
                        } else {
                            setMessage("⚠️ Votre abonnement a expiré.");
                            navigate("/abonnement");
                        }
                    } else {
                        setMessage("⚠️ Aucun abonnement actif.");
                        navigate("/abonnement");
                    }
                } else {
                    console.log("❌ Aucun document Firestore trouvé !");
                    setMessage("⚠️ Utilisateur sans données Firestore.");
                    navigate("/abonnement");
                }

            } else {
                // ✅ Création d’un compte
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                const userEmail = cred.user.email?.toLowerCase();

                await setDoc(doc(db, "users", cred.user.uid), {
                    email: userEmail,
                    createdAt: new Date().toISOString(),
                    role: "user", // par défaut
                    subscription: {
                        status: "inactive",
                        endDate: null,
                    },
                });

                setMessage("✅ Compte créé avec succès !");
                navigate("/abonnement");
            }
        } catch (err) {
            console.error("❌ Erreur login:", err);
            setMessage(`❌ Erreur : ${err.message}`);
        }
    };




    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1a2a4f, #4fa3f7)",
                fontFamily: "Segoe UI, sans-serif",
                padding: "20px",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "40px",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "400px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
                    textAlign: "center",
                }}
            >
                {/* 🔙 Bouton Retour */}
                <div style={{ marginBottom: "20px", textAlign: "left" }}>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            backgroundColor: "#e91e63",
                            color: "white",
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                        }}
                    >
                        ⬅ Retour
                    </button>
                </div>

                <h2 style={{ marginBottom: "20px", color: "#1a2a4f" }}>
                    {mode === "login" ? "🔑 Connexion" : "📝 Créer un compte"}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "15px" }}
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Adresse email"
                        required
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        required
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            background: mode === "login" ? "#4fa3f7" : "#e91e63",
                            color: "#fff",
                            padding: "12px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                            transition: "0.3s",
                        }}
                    >
                        {mode === "login" ? "Se connecter" : "Créer un compte"}
                    </button>
                </form>

                <button
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    style={{
                        marginTop: "15px",
                        background: "#f4f4f4",
                        color: "#333",
                        padding: "10px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        transition: "0.3s",
                    }}
                >
                    {mode === "login"
                        ? "🆕 Créer un compte"
                        : "🔙 Déjà inscrit ? Se connecter"}
                </button>

                {message && (
                    <p
                        style={{
                            marginTop: "15px",
                            color: message.includes("❌") ? "red" : "green",
                        }}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;
