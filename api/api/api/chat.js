import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const { messages, useSearch } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: SYS,
      messages: messages,
      stream: true,
    };

    if (useSearch) {
      body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    }

    const stream = await client.messages.create(body);

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
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