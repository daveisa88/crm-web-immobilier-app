// api/openai.js
import OpenAI from "openai";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Message manquant" });
            }

            const completion = await client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
                temperature: 0.7,
            });

            const texteIA =
                completion.choices[0]?.message?.content || "⚠️ Pas de réponse IA.";

            // 🔑 On renvoie TOUJOURS sous la clé reply
            return res.status(200).json({ reply: texteIA });
        } catch (error) {
            console.error("Erreur OpenAI:", error);
            return res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
