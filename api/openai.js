import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // ✅ clé stockée dans .env de Vercel
});

export default async function handler(req, res) {
    try {
        const { prompt } = req.body;

        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6,
        });

        res.status(200).json({
            result: completion.choices[0].message.content,
        });
    } catch (err) {
        console.error("❌ Erreur OpenAI:", err);
        res.status(500).json({ error: err.message });
    }
}
