import express from "express";
import { GoogleGenAI } from "@google/genai";

export const aiRouter = express.Router();

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey =
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY ??
      process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

const MODEL_NAME = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  if (limit.count >= 20) return false;
  limit.count++;
  return true;
}

// Helper: call Gemini with a prompt
async function callGemini(prompt: string, config?: any): Promise<string> {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config,
  });
  return response.text || "";
}

// Helper: call Gemini with chat history
async function callGeminiChat(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const ai = getGenAI();
  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  const history = messages.slice(0, -1);
  for (const msg of history) {
    // We send message for user/model explicitly. With @google/genai we can specify history in chats.create! Wait, but this is simpler: the chat handles history, but we need to pass previous messages.
    // Instead, let's just use generateContent with the full array of messages.
  }
  // Wait, let's just construct the contents array for generateContent, it's easier.
  const contents = messages.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction: systemPrompt,
    }
  });

  return response.text || "";
}

aiRouter.post("/", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) ?? "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  try {
    const { feature, payload } = req.body;

    if (!feature || !payload) {
      return res.status(400).json({ error: "Missing feature or payload" });
    }

    switch (feature) {
      case "product-description":
        return await handleProductDescription(payload, res);
      case "search-assistant":
        return await handleSearchAssistant(payload, res);
      case "craft-story":
        return await handleCraftStory(payload, res);
      case "price-suggestion":
        return await handlePriceSuggestion(payload, res);
      case "review-reply":
        return await handleReviewReply(payload, res);
      case "buyer-assistant":
        return await handleBuyerAssistant(payload, res);
      case "tag-generator":
        return await handleTagGenerator(payload, res);
      default:
        return res.status(400).json({ error: "Unknown feature" });
    }
  } catch (error: any) {
    console.error("AI route error:", error);

    if (error.message?.includes("API_KEY_INVALID")) {
      return res.status(500).json({ error: "Invalid Gemini API key. Check your Secrets tab." });
    }
    if (error.message?.includes("QUOTA_EXCEEDED") || error.message?.includes("quota") || error.status === 429) {
      return res.status(429).json({ error: "Gemini free tier quota exceeded. Try again later." });
    }
    if (error.message?.includes("SAFETY")) {
      return res.status(400).json({ error: "Request blocked by safety filter. Please rephrase." });
    }

    return res.status(500).json({ error: "AI request failed. Please try again.", details: error.message });
  }
});

async function handleProductDescription(payload: any, res: express.Response) {
  const { title, category, materials, price, location } = payload;
  const prompt = `You are a product copywriter for Multan Connect, a premium marketplace for traditional handmade crafts from Multan, Pakistan.

Write a compelling product description for:
Title: ${title}
Category: ${category}
Materials: ${materials || "traditional materials"}
Price: PKR ${price}
Made in: ${location}, Multan

Write 2-3 paragraphs that:
1. Open with the cultural heritage and craftsmanship behind this piece
2. Describe what makes it special as a handmade item
3. Suggest who would love it and what occasion it suits

Tone: warm, authentic, premium but accessible. No bullet points. Flowing prose. Max 150 words.

Return ONLY the description text, nothing else. No preamble, no "Here is the description:", just the text directly.`;

  const text = await callGemini(prompt);
  return res.json({ result: text.trim() });
}

async function handleSearchAssistant(payload: any, res: express.Response) {
  const prompt = `You are a shopping assistant for Multan Connect, a marketplace selling handmade Pakistani crafts: Blue Pottery (Kashigari), Khussa footwear, embroidery, and gift sets from Multan.

A buyer typed: "${payload.query}"

Respond with a JSON object ONLY. No markdown, no code blocks, no explanation. Just the raw JSON:
{"isNaturalLanguage":true,"interpretation":"one sentence what buyer wants","suggestedSearchTerms":["term1","term2","term3"],"suggestedCategory":"blue_pottery","suggestedMaxPrice":null,"tip":"one friendly tip"}

Valid category values: "blue_pottery", "khussa", "embroidery", "gift_sets", or null.
suggestedMaxPrice should be a number in PKR or null.`;

  const text = await callGemini(prompt, { responseMimeType: "application/json" });
  try {
    const result = JSON.parse(text);
    return res.json({ result });
  } catch {
    return res.json({ result: { isNaturalLanguage: false } });
  }
}

async function handleCraftStory(payload: any, res: express.Response) {
  const prompt = `You are a storyteller for Multan Connect, a premium marketplace celebrating Pakistan's traditional crafts.

Write an artisan story for this seller's public profile page:
Shop Name: ${payload.shopName}
Craft: ${payload.craftType}
Location: ${payload.location}, Multan
Years of Experience: ${payload.yearsExperience ?? "many"}
Existing Bio: ${payload.bio || "not provided"}

Write 2 paragraphs in first person (as the artisan speaking):
1. Their connection to the craft — heritage, how they learned, what it means to them
2. Their process, what makes their work unique, their hopes for their craft

Tone: authentic, warm, proud, culturally rich. Reference Multan's heritage. Max 180 words total.

Return ONLY the story text. No preamble or labels.`;

  const text = await callGemini(prompt);
  return res.json({ result: text.trim() });
}

async function handlePriceSuggestion(payload: any, res: express.Response) {
  const prompt = `You are a pricing advisor for Multan Connect, a marketplace for traditional Pakistani handmade crafts from Multan.

Suggest a fair price range in PKR for:
Title: ${payload.title}
Category: ${payload.category}
Materials: ${payload.materials || "traditional"}
Description: ${payload.description || "not provided"}

Consider: craft complexity, material costs, artisan time, fair wages.
Multan Connect is premium — do not underprice craftsmanship.

Respond with raw JSON ONLY. No markdown, no code blocks:
{"minPrice":1500,"maxPrice":3500,"recommendedPrice":2500,"reasoning":"one sentence explaining the pricing"}`;

  const text = await callGemini(prompt, { responseMimeType: "application/json" });
  try {
    const result = JSON.parse(text);
    return res.json({ result });
  } catch {
    return res.json({ result: null });
  }
}

async function handleReviewReply(payload: any, res: express.Response) {
  const prompt = `You are helping an artisan seller on Multan Connect reply to a customer review.

Shop: ${payload.shopName}
Product: ${payload.productTitle}
Reviewer: ${payload.reviewerName}
Rating: ${payload.rating}/5 stars
Review: "${payload.reviewText}"

Write a short, warm, professional reply (2-3 sentences):
- Thank the reviewer by name
- Acknowledge their specific feedback
- If negative (1-2 stars): apologize sincerely and offer to make it right
- If positive (4-5 stars): express genuine gratitude and invite them back
- End with a warm Multan/craft-related closing

Do NOT be generic. Reference the actual review content.
Return ONLY the reply text. No labels or preamble.`;

  const text = await callGemini(prompt);
  return res.json({ result: text.trim() });
}

async function handleBuyerAssistant(payload: any, res: express.Response) {
  const systemPrompt = `You are Craft Guide, a friendly shopping assistant for Multan Connect — a marketplace for traditional handmade crafts from Multan, Pakistan.

You help buyers:
- Understand craft types (Blue Pottery/Kashigari vs Khussa vs embroidery)
- Find the right product for their occasion or budget  
- Learn about Multan's craft heritage
- Understand care instructions for handmade items

Available categories: Blue Pottery, Khussa footwear, Embroidery, Gift Sets
Price range: PKR 500 – 50,000
Delivery: within Pakistan only, 3-5 business days, PKR 250 flat fee

Keep responses concise (2-4 sentences max). Be warm and culturally aware.
If asked to find specific products, suggest relevant search terms.
Do not make up specific product listings or prices.
Greet in a warm Pakistani style when appropriate.`;

  const text = await callGeminiChat(systemPrompt, payload.messages);
  return res.json({ result: text.trim() });
}

async function handleTagGenerator(payload: any, res: express.Response) {
  const prompt = `Generate search tags for a product on Multan Connect, a marketplace for traditional handmade crafts from Multan, Pakistan.

Product Title: ${payload.title}
Category: ${payload.category}
Description: ${payload.description || "not provided"}

Generate 8-10 relevant, searchable tags. Consider:
- What buyers might search for
- Gift occasions (Eid, wedding, birthday, home decor)
- Materials and techniques
- Cultural keywords
- Style descriptors

Respond with raw JSON ONLY. No markdown, no code blocks:
{"tags":["tag1","tag2","tag3"]}

Tags should be lowercase, 1-3 words each.`;

  const text = await callGemini(prompt, { responseMimeType: "application/json" });
  try {
    const result = JSON.parse(text);
    return res.json({ result });
  } catch {
    return res.json({ result: { tags: [] } });
  }
}