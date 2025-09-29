import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import express, { Request, Response } from "express";
import * as admin from "firebase-admin";

// ✅ Initialiser Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

// ✅ Limite d’instances
setGlobalOptions({ maxInstances: 10 });

const app = express();
app.use(express.json());

// ✅ Webhook PayPal
app.post("/", async (req: Request, res: Response) => {
    try {
        const event = req.body;
        logger.info("📩 Webhook PayPal reçu", { type: event?.event_type, id: event?.id });

        switch (event?.event_type) {
            case "BILLING.SUBSCRIPTION.CREATED": {
                const subscriptionId = event?.resource?.id;
                const payerEmail = event?.resource?.subscriber?.email_address;

                if (payerEmail) {
                    const snap = await db.collection("users")
                        .where("email", "==", payerEmail)
                        .limit(1)
                        .get();

                    if (!snap.empty) {
                        const userRef = snap.docs[0].ref;
                        await userRef.set({
                            subscription: {
                                id: subscriptionId,
                                status: "created",
                                startDate: new Date().toISOString(),
                            },
                        }, { merge: true });

                        logger.info(`🆕 Abonnement créé pour ${payerEmail}`);
                    } else {
                        logger.warn(`⚠️ Aucun utilisateur trouvé pour ${payerEmail}`);
                    }
                }
                break;
            }

            case "BILLING.SUBSCRIPTION.ACTIVATED": {
                const subscriptionId = event?.resource?.id;
                const payerEmail = event?.resource?.subscriber?.email_address;

                if (payerEmail) {
                    const snap = await db.collection("users")
                        .where("email", "==", payerEmail)
                        .limit(1)
                        .get();

                    if (!snap.empty) {
                        const userRef = snap.docs[0].ref;
                        await userRef.set({
                            subscription: {
                                id: subscriptionId,
                                status: "active",
                                startDate: new Date().toISOString(),
                                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30j
                            },
                        }, { merge: true });

                        logger.info(`✅ Abonnement activé pour ${payerEmail}`);
                    }
                }
                break;
            }

            case "BILLING.SUBSCRIPTION.CANCELLED": {
                const subscriptionId = event?.resource?.id;

                const snap = await db.collection("users")
                    .where("subscription.id", "==", subscriptionId)
                    .limit(1)
                    .get();

                if (!snap.empty) {
                    const userRef = snap.docs[0].ref;
                    await userRef.set({
                        subscription: {
                            status: "cancelled",
                            endDate: new Date().toISOString(),
                        },
                    }, { merge: true });

                    logger.info(`🚫 Abonnement annulé : ${subscriptionId}`);
                }
                break;
            }

            default:
                logger.info(`ℹ️ Event ignoré : ${event?.event_type}`);
        }

        res.status(200).send("OK");
    } catch (err) {
        logger.error("❌ Erreur Webhook PayPal", err);
        res.status(500).send("Erreur serveur");
    }
});

// ✅ Export Cloud Function
export const paypalWebhook = onRequest(app);
