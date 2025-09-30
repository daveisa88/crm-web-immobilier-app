import OpenAI from "openai";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            // On attend bien "message" du frontend
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

            return res.status(200).json({ result: texteIA });
        } catch (error) {
            console.error("Erreur OpenAI:", error);
            return res.status(500).json({ error: error.message });
        }
    } else {
        // Si la méthode n'est pas POST → 405
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
