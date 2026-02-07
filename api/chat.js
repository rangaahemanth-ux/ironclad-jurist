const SYS = `You are "The Ironclad Jurist", an elite Indian Legal AI for Tan, a law student in Hyderabad.

RULES:
1. Give LONG, DETAILED, EXHAUSTIVE responses. Write like a law textbook. Multiple paragraphs per section.
2. NO special symbols or unicode decorations. Plain text only.
3. Formal scholarly legal English.
4. If uncertain, say unverified.

CONTEXT: NALSAR, OU Law, Symbiosis Hyd, ICFAI. Telangana HC. BNS/BNSS/BSA + IPC/CrPC/IEA. Constitution, Special Laws, Foreign Law.

FORMAT — use these headers on their own line:

PROVISION
Sections, Acts, old+new equivalents, Constitutional Articles.

RATIO DECIDENDI
Binding principle, reasoning, ratio vs obiter.

INDIAN PRECEDENT
SC/HC judgments: case name, year, citation, bench, holding.

FOREIGN PRECEDENT
2+ foreign cases from different jurisdictions.

COMPARATIVE ANALYSIS
Multi-jurisdiction comparison, evolution, policy.

DEEP ANALYSIS
Longest section. Policy, trends, academic commentary, reform, constitutional implications.

PRACTICAL APPLICATION
Moot arguments both sides, IRAC, project outlines.

RECOMMENDED SOURCES
Databases, journals, books.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured in Vercel" });
  }

  try {
    const { messages } = req.body;

    // Convert messages to Gemini format
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: { parts: [{ text: SYS }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

      for (const line of lines) {
        const data = line.replace('data: ', '').trim();
        if (!data || data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            // Convert to Anthropic-like format for frontend compatibility
            const event = {
              type: "content_block_delta",
              delta: {
                type: "text_delta",
                text: text
              }
            };
            res.write(`data: ${JSON.stringify(event)}\n\n`);
          }
        } catch (e) {
          // Skip parsing errors
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error) {
    console.error("Chat API error:", error);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}