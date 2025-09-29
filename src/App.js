// src/App.js
import React, { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import "./App.css";

// Pages publiques
import AccueilPage from "./AccueilPage";
import ManuelPage from "./ManuelPage";
import AbonnementPage from "./AbonnementPage";
import FicheClientPreview from "./FicheClientPreview";

// Pages protégées
import FeuilleForm from "./FeuilleForm";
import ListeFiches from "./ListeFiches";
import Login from "./Login";
import ComparateurPage from "./ComparateurPage";
import AnalysePage from "./AnalysePage";
import MailTypePage from "./MailTypePage";
import PaiementPage from "./PaiementPage";

// Firebase
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const auth = getAuth();

// ✅ Vérification rôle + abonnement Firestore
function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setAllowed(false);
                setLoading(false);
                return;
            }

            try {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();

                    // ✅ Si ADMIN → accès direct
                    if (data.role?.toLowerCase() === "admin") {
                        setAllowed(true);
                        setLoading(false);
                        return;
                    }

                    // 👉 Sinon contrôle abonnement
                    if (data.subscription?.status === "active" && data.subscription?.endDate) {
                        const end = new Date(data.subscription.endDate);
                        const now = new Date();

                        setAllowed(end > now);
                    } else {
                        setAllowed(false);
                    }
                } else {
                    setAllowed(false);
                }
            } catch (err) {
                console.error("Erreur Firestore:", err);
                setAllowed(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
                🔄 Vérification abonnement...
            </div>
        );
    }

    return allowed ? children : <Navigate to="/abonnement" replace />;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<AccueilPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manuel" element={<ManuelPage />} />
            <Route path="/abonnement" element={<AbonnementPage />} />
            <Route path="/fiche-preview" element={<FicheClientPreview />} />
            <Route path="/paiement" element={<PaiementPage />} />

            {/* Pages protégées */}
            <Route
                path="/Feuille"
                element={
                    <ProtectedRoute>
                        <FeuilleForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/Feuille/Liste"
                element={
                    <ProtectedRoute>
                        <ListeFiches />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/mailtype"
                element={
                    <ProtectedRoute>
                        <MailTypePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/comparateur"
                element={
                    <ProtectedRoute>
                        <ComparateurPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/analyse"
                element={
                    <ProtectedRoute>
                        <AnalysePage />
                    </ProtectedRoute>
                }
            />

            {/* Redirection fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState(window.location.hash);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });

        const handleHashChange = () => setCurrentPath(window.location.hash);
        window.addEventListener("hashchange", handleHashChange);

        return () => {
            unsubscribe();
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    // Pages où on masque le header
    const hideHeader =
        currentPath === "#/" || currentPath.startsWith("#/abonnement");

    return (
        <Router>
            <div className="content">
                {user && !hideHeader && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "16px 24px",
                            background: "#1a2a4f",
                            color: "white",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                    >
                        <img
                            src="https://i.imgur.com/mvMKs9J.png"
                            alt="Logo MJ"
                            style={{ width: "80px", marginRight: "16px" }} // ✅ plus grand
                        />
                        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
                            CRM Immobilier – Agent Mandataire
                        </h1>
                    </div>
                )}

                {!loading && <AppRoutes />}
            </div>
        </Router>
    );
}


export default App;
