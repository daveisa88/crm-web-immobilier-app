// api/openai.js
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // ✅ lu côté serveur uniquement
});

export default async function handler(req, res) {
    try {
        const { prompt } = JSON.parse(req.body);

        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const texteIA = response.choices?.[0]?.message?.content || "⚠️ Aucun résultat.";
        res.status(200).json({ text: texteIA });
    } catch (err) {
        console.error("Erreur API OpenAI:", err);
        res.status(500).json({ error: err.message });
    }
}
