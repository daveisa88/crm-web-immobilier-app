// AppRoutes.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import FeuilleForm from "./FeuilleForm";
import ManuelPage from "./ManuelPage";
import ComparateurPage from "./ComparateurPage";
import ListeFiches from "./ListeFiches";
import AbonnementPage from "./AbonnementPage"; // ✅ ta page d’abonnement

// 🔒 HOC pour protéger les routes
function PrivateRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const checkSub = async () => {
            const user = auth.currentUser;
            if (!user) {
                setAllowed(false);
                setLoading(false);
                return;
            }

            const ref = doc(db, "users", user.email);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();
                const endDate = data.endDate ? new Date(data.endDate) : null;
                const active = data.status === "active" && endDate && endDate > new Date();

                setAllowed(active);
            } else {
                setAllowed(false);
            }
            setLoading(false);
        };

        checkSub();
    }, []);

    if (loading) return <p style={{ color: "white" }}>⏳ Vérification abonnement...</p>;
    return allowed ? children : <Navigate to="/abonnement" replace />;
}

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<FeuilleForm />} />
                <Route path="/abonnement" element={<AbonnementPage />} />
                <Route
                    path="/manuel"
                    element={
                        <PrivateRoute>
                            <ManuelPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/comparateur"
                    element={
                        <PrivateRoute>
                            <ComparateurPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/Feuille/Liste"
                    element={
                        <PrivateRoute>
                            <ListeFiches />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}
