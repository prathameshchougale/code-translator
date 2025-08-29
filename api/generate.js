// File Path: /api/generate.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Access your secret API key from Vercel's environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Main function Vercel will run
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, task } = req.body;
        if (!prompt || !task) {
            return res.status(400).json({ error: 'Prompt and task are required.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

        let systemInstructionText;
        if (task === 'translate') {
            systemInstructionText = "You are an expert code translator. Your task is to translate the given code snippet. Provide ONLY the raw, translated code as your response. Do not include any extra text, explanations, or markdown formatting like ```.";
        } else if (task === 'explain') {
            systemInstructionText = "You are an expert code explainer. Your task is to provide a line-by-line explanation of the given code. For each line or logical block of code, create a parent div with the class 'explanation-item'. Inside this div, put the code line in a div with class 'code-line' and its corresponding explanation in a div with class 'explanation-text'. Do not provide any text outside of this HTML structure.";
        } else {
            return res.status(400).json({ error: 'Invalid task specified.' });
        }

        const systemInstruction = { parts: [{ text: systemInstructionText }] };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction,
        });

        const response = await result.response;
        const text = response.text();

        res.status(200).json({ result: text });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to process request with the AI model.' });
    }
}
