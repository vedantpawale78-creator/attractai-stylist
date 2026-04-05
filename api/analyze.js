const { GoogleGenAI } = require('@google/genai');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // The gemini api key will be securely fetched from the Vercel Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { imageBase64, location = "Unknown", weather = "Clear" } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Extract mime type and raw base64 data
    const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
    const base64Data = imageBase64.substring(imageBase64.indexOf(',') + 1);

    const date = new Date();
    const currentDate = date.toLocaleDateString();
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    const prompt = `
You are an elite AI fashion stylist and appearance analyst.

Your task is to analyze a user's image and generate:
1. Appearance analysis
2. Aesthetic score
3. Daily outfit recommendation based on real-world context

-----------------------------------
📅 CONTEXT AWARENESS
-----------------------------------
- Current Date: ${currentDate}
- Day: ${dayOfWeek}
- Location: ${location}
- Weather: ${weather}

Determine Occasion Automatically:
- If weekday → college/casual outfit
- If weekend → relaxed/stylish outfit
- If festival/holiday → festive outfit

-----------------------------------
🧠 IMAGE ANALYSIS
-----------------------------------
Analyze the uploaded image and determine:
- Face features (symmetry, jawline, skin condition)
- Body type (athletic, slim, bulky, etc.)
- Posture
- Overall attractiveness

-----------------------------------
🎯 TASKS
-----------------------------------

1. FACE ANALYSIS:
Give a short, premium description.

2. BODY ANALYSIS:
Describe build and posture.

3. AESTHETIC SCORE:
Give a score out of 100.

4. DAILY OUTFIT RECOMMENDATION:
Generate a COMPLETE outfit:
- Top
- Bottom
- Footwear
- Accessories

Rules:
- Must match weather
- Must suit body type
- Must be wearable (student-friendly)
- Must follow modern fashion

5. COLOR SUGGESTION:
- Primary colors
- Accent colors
- Based on skin tone

6. STYLING TIPS:
- 2–3 actionable tips (posture, grooming, clothing tweaks)

7. WHY IT WORKS:
Explain in 1–2 lines based on body + face + vibe

8. OPTIONAL:
- Alternative outfit
- One improvement suggestion

-----------------------------------
📤 OUTPUT FORMAT (STRICT JSON)
-----------------------------------

Return ONLY valid JSON (no extra text):

{
  "face": "string",
  "body": "string",
  "score": 0,
  "outfit": {
    "top": "string",
    "bottom": "string",
    "footwear": "string",
    "accessories": "string"
  },
  "colors": {
    "primary": "string",
    "accent": "string",
    "reason": "string"
  },
  "tips": ["string", "string", "string"],
  "why": "string",
  "alternative": {
    "top": "string",
    "bottom": "string",
    "footwear": "string",
    "accessories": "string"
  },
  "upgrade": "string",
  "confidence": 0
}

Important:
- Keep responses concise and premium
- Do NOT include markdown or explanation outside JSON
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user', 
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const aiResponseText = response.text;
    const result = JSON.parse(aiResponseText);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
