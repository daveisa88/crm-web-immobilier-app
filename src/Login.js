import React, { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
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

    // 🔑 Connexion classique
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === "login") {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                await checkUserFirestore(cred.user);
            } else {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await createUserFirestore(cred.user);
                setMessage("✅ Compte créé avec succès !");
                navigate("/abonnement");
            }
        } catch (err) {
            setMessage(`❌ Erreur : ${err.message}`);
        }
    };

    // 🔄 Réinitialisation mot de passe
    const handleResetPassword = async () => {
        if (!email) {
            setMessage("⚠️ Entrez d’abord votre email pour réinitialiser.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("📩 Email de réinitialisation envoyé !");
        } catch (err) {
            setMessage(`❌ Erreur reset : ${err.message}`);
        }
    };

    // 🔑 Connexion Google
    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(auth, provider);
            await checkUserFirestore(cred.user);
        } catch (err) {
            setMessage(`❌ Erreur Google : ${err.message}`);
        }
    };

    // 🔑 Connexion GitHub
    const handleGithubLogin = async () => {
        try {
            const provider = new GithubAuthProvider();
            const cred = await signInWithPopup(auth, provider);
            await checkUserFirestore(cred.user);
        } catch (err) {
            setMessage(`❌ Erreur GitHub : ${err.message}`);
        }
    };

    // 🔍 Vérifier Firestore pour l’utilisateur
    const checkUserFirestore = async (user) => {
        const userEmail = user.email?.toLowerCase();
        const q = query(collection(db, "users"), where("email", "==", userEmail));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const data = snap.docs[0].data();
            if (data.role?.toLowerCase().trim() === "admin") {
                setMessage("✅ Connexion ADMIN réussie !");
                navigate("/Feuille");
                return;
            }
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
            await createUserFirestore(user);
            navigate("/abonnement");
        }
    };

    // 🆕 Créer doc Firestore
    const createUserFirestore = async (user) => {
        const userEmail = user.email?.toLowerCase();
        await setDoc(doc(db, "users", user.uid), {
            email: userEmail,
            createdAt: new Date().toISOString(),
            role: "user",
            subscription: {
                status: "inactive",
                endDate: null,
            },
        });
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
                {/* Retour */}
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

                {/* Formulaire email/mdp */}
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

                    {mode === "login" && (
                        <button
                            type="button"
                            onClick={handleResetPassword}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#4fa3f7",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                textDecoration: "underline",
                            }}
                        >
                            🔒 Mot de passe oublié ?
                        </button>
                    )}

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

                {/* Séparateur */}
                <div
                    style={{
                        margin: "20px 0",
                        display: "flex",
                        alignItems: "center",
                        textAlign: "center",
                    }}
                >
                    <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
                    <span style={{ margin: "0 10px", color: "#666", fontSize: "0.9rem" }}>
                        ou
                    </span>
                    <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
                </div>

                {/* Connexion Google */}
                <button
                    onClick={handleGoogleLogin}
                    style={{
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        background: "#fff",
                        color: "#555",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "500",
                        width: "100%",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                        style={{ width: "20px", height: "20px" }}
                    />
                    Continuer avec Google
                </button>

                {/* Connexion GitHub */}
                <button
                    onClick={handleGithubLogin}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        background: "#333",
                        color: "#fff",
                        padding: "10px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "500",
                        width: "100%",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                >
                    <img
                        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        alt="GitHub logo"
                        style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%" }}
                    />
                    Continuer avec GitHub
                </button>

                {/* Switch mode */}
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
                        width: "100%",
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
