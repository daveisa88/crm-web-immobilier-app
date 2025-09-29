import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Vérifie et consomme une requête IA en fonction du quota utilisateur
 * @param {string} feature - Nom de la fonctionnalité (ex: "analyse", "comparateur")
 * @returns {Promise<{allowed: boolean, remaining: number|string, limit: number|string, message: string}>}
 */
export async function checkAndConsumeQuota(feature) {
    const user = auth.currentUser;
    if (!user) {
        return { allowed: false, remaining: 0, limit: 0, message: "❌ Utilisateur non connecté." };
    }

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        return { allowed: false, remaining: 0, limit: 0, message: "❌ Données utilisateur introuvables." };
    }

    const data = snap.data();

    // 🔹 Définir quotas par abonnement
    let limit = 0;
    switch (data.subscription?.plan) {
        case "free": // Essai gratuit
            limit = 20;
            break;
        case "standard": // Abonnement mensuel
            limit = 100;
            break;
        case "premium": // Abonnement annuel
            limit = Infinity;
            break;
        default:
            limit = 0;
    }

    // 🔹 Suivi des quotas par mois (reset auto chaque mois)
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`; // ex: "2025-09"

    if (!data.quotas) data.quotas = {};
    if (!data.quotas[monthKey]) {
        data.quotas[monthKey] = { analyse: 0, comparateur: 0 };
    }

    const used = data.quotas[monthKey][feature] || 0;

    if (used >= limit && limit !== Infinity) {
        return {
            allowed: false,
            remaining: 0,
            limit,
            message: `⚠️ Vous avez atteint votre quota de ${limit} requêtes pour ${feature} ce mois-ci.`,
        };
    }

    // 🔹 Incrémenter l’utilisation
    data.quotas[monthKey][feature] = used + 1;

    await updateDoc(ref, { quotas: data.quotas });

    return {
        allowed: true,
        remaining: limit === Infinity ? "∞" : limit - (used + 1),
        limit: limit === Infinity ? "∞" : limit,
        message: `✅ Requête validée. Il vous reste ${limit === Infinity ? "illimité" : limit - (used + 1)
            } / ${limit}.`,
    };
}
