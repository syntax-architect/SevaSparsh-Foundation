import dotenv from 'dotenv';
dotenv.config();
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function run() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You generate realistic fake donation data for an Indian NGO to display as a live ticker. Return ONLY valid JSON with a root "donations" array.' },
        { role: 'user', content: 'Generate 10 realistic recent donations. Fields: "name" (typical Indian name, last initial or full), "amount" (realistic amounts like 500, 1000, 1500, 2100, 5100), "location" (Indian city), "timeAgo" (e.g., "1m ago", "3m ago", "12m ago"). Output JSON format: { "donations": [ {"name": "...", "amount": 1500, "location": "...", "timeAgo": "..."} ] }' }
      ],
      model: 'groq/compound',
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });
    console.log('OK', chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('ERROR', error);
  }
}
run();
