import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function ProtectedRoute({ children }) {
    const auth = getAuth();
    const user = auth.currentUser;

    const [loading, setLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const checkSub = async () => {
            if (!user) {
                setIsAllowed(false);
                setLoading(false);
                return;
            }

            try {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();
                    const sub = data.subscription;

                    if (sub && sub.status === "active") {
                        const now = new Date();
                        const end = new Date(sub.endDate);

                        if (end > now) {
                            setIsAllowed(true); // ✅ abonnement encore valide
                        } else {
                            setIsAllowed(false); // ❌ expiré
                        }
                    } else {
                        setIsAllowed(false); // ❌ pas d’abonnement
                    }
                } else {
                    setIsAllowed(false); // ❌ pas trouvé
                }
            } catch (err) {
                console.error("Erreur Firestore abonnement:", err);
                setIsAllowed(false);
            }

            setLoading(false);
        };

        checkSub();
    }, [user]);

    if (loading) return <p style={{ textAlign: "center", color: "white" }}>⏳ Vérification abonnement...</p>;

    return isAllowed ? children : <Navigate to="/abonnement" replace />;
}
